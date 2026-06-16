/* VIGOROUS smoke test — boots all three apps end-to-end, drives real workflows
 * hard, hammers edge cases, and reports everything (including failures).
 * Run: node tests/smoke.test.js   (needs jsdom: npm i -D jsdom --no-save) */
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const DIR = path.join(__dirname, "..");
const WIRING = fs.readFileSync(path.join(DIR, "wiring-shared.js"), "utf8");

let pass = 0,
  fail = 0;
const fails = [];
function ok(c, m) {
  if (c) pass++;
  else {
    fail++;
    fails.push(m);
    console.error("  FAIL " + m);
  }
}
function section(t) {
  console.log("\n### " + t);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// jsdom errors that are environment noise, not app bugs
const NOISE = [/Could not parse CSS stylesheet/i, /Not implemented/i, /Could not load img/i];
const isNoise = (s) => NOISE.some((re) => re.test(String(s)));

function polyfill(window, store) {
  window.structuredClone = (v) => JSON.parse(JSON.stringify(v));
  Object.defineProperty(window, "localStorage", { value: store, configurable: true });
  if (!window.matchMedia) window.matchMedia = () => ({ matches: false, media: "", onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } });
  window.Element.prototype.scrollIntoView = function () {};
  window.Element.prototype.scrollTo = function () {};
  window.print = function () {};
  if (window.HTMLAnchorElement) window.HTMLAnchorElement.prototype.click = function () {};
  if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:smoke";
  if (!window.URL.revokeObjectURL) window.URL.revokeObjectURL = () => {};
  if (window.SVGElement) {
    window.SVGElement.prototype.getBBox = function () { return { x: 0, y: 0, width: 10, height: 10 }; };
  }
  if (window.SVGSVGElement) {
    const S = window.SVGSVGElement.prototype;
    S.createSVGPoint = function () { const o = { x: 0, y: 0 }; o.matrixTransform = function () { return { x: o.x, y: o.y }; }; return o; };
    S.getScreenCTM = function () { return { inverse: function () { return {}; } }; };
  }
  if (!window.CSS) window.CSS = {};
  if (!window.CSS.escape) window.CSS.escape = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function makeStore(seed) {
  const map = new Map(seed ? Object.entries(seed) : []);
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    key: (i) => Array.from(map.keys())[i] ?? null,
    get length() { return map.size; },
    _map: map,
  };
}

function loadApp(file, store) {
  const vc = new VirtualConsole();
  const errs = [];
  vc.on("jsdomError", (e) => errs.push(e && e.message ? e.message : String(e)));
  let html = fs.readFileSync(path.join(DIR, file), "utf8");
  html = html.replace(/<script\b[^>]*\bsrc\s*=\s*["']wiring-shared\.js["'][^>]*><\/script>/i, "<script>\n" + WIRING + "\n</script>");
  let dom = null,
    ctorErr = null;
  try {
    dom = new JSDOM(html, { url: "https://x.test/" + file, runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc, beforeParse: (w) => polyfill(w, store) });
  } catch (e) {
    ctorErr = e;
  }
  const realErrs = errs.filter((e) => !isNoise(e));
  return { dom, window: dom && dom.window, doc: dom && dom.window.document, errs, realErrs, ctorErr };
}
function ev(win, type) { return new win.Event(type, { bubbles: true }); }
function pointer(win, type, target, x, y) {
  let e;
  try { e = new win.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y }); }
  catch (_) { e = new win.Event(type, { bubbles: true }); try { Object.defineProperty(e, "clientX", { value: x }); Object.defineProperty(e, "clientY", { value: y }); } catch (__) {} }
  e.pointerId = 1; e.isPrimary = true; target.dispatchEvent(e); return e;
}

(async () => {
  // =====================================================================
  section("1. Module — adversarial pure-function + store (Node, no jsdom)");
  // fresh require with an injected global localStorage
  const store0 = makeStore();
  global.localStorage = store0;
  delete require.cache[require.resolve(path.join(DIR, "wiring-shared.js"))];
  const W = require(path.join(DIR, "wiring-shared.js"));

  // boxFill garbage in -> numbers out, never throws
  ["", null, undefined, {}, { cond12: "x" }, { cond12: -5 }, { cond12: 1e6, devices: 1e3 }, { cond14: "3", cond10: "2", grounds: "1", boxsize: "22.5" }].forEach((inp, i) => {
    let r, threw = false;
    try { r = W.boxFill(inp); } catch (e) { threw = true; }
    ok(!threw && r && typeof r.required === "number" && isFinite(r.required), "boxFill robust on garbage #" + i + " -> " + (r && r.required) + " (finite, no throw)");
  });
  ok(W.boxFill({ cond12: -5 }).required === -11.25, "boxFill negative count passes through unclamped (matches inline calc; UI uses min=0)");
  ok(W.boxFill({ cond14: 1, cond10: 1, grounds: 1, clamps: 1 }).largestKey === "cond10", "boxFill mixed 14+10 picks largest=cond10");
  ok(W.boxFill({ cond12: 3, devices: 1, grounds: 1, clamps: 1, boxsize: 22.5 }).ok === true, "boxFill 3x12+device fits 22.5");
  ok(W.boxFill({ cond12: 99, boxsize: 18 }).ok === false, "boxFill 99 conductors fails 18");

  // loadEstimate edge inputs
  [null, undefined, [], "nope", [{}], [{ kind: "unk" }], [{ load: "Electric dryer" }]].forEach((inp, i) => {
    let r, threw = false;
    try { r = W.loadEstimate(inp); } catch (e) { threw = true; }
    ok(!threw && r && isFinite(r.totalVA) && isFinite(r.demandA), "loadEstimate robust #" + i + " -> VA " + (r && r.totalVA));
  });
  ok(W.loadEstimate([{ kind: "unk" }]).totalVA === 0, "loadEstimate unk -> 0 VA");
  ok(W.loadEstimate([{ kind: "hvac" }, { kind: "hvac" }, { kind: "hvac" }]).demandA === W.demandAmps(10500), "loadEstimate demand uses NEC 220.83 formula (=" + W.demandAmps(10500) + ", not total/240)");

  // spacingCheck degenerate
  ok(!W.spacingCheck([], []).violations.length, "spacingCheck no walls -> no violations");
  ok(W.spacingCheck([], [{ x1: 0, y1: 0, x2: 0, y2: 0 }]).ok === true, "spacingCheck zero-length wall safe");
  ok(W.spacingCheck([{ x: 4, y: 0 }, { x: 16, y: 0 }], [{ x1: 0, y1: 0, x2: 20, y2: 0 }]).ok === true, "spacingCheck 4/16 on 20ft compliant");

  // bom edge
  ok(W.bom(null).total === 0, "bom(null) -> 0");
  ok(W.bom([{ type: "outlet" }, { type: "outlet" }, {}]).total === 3, "bom counts items incl. typeless");

  // project store: round-trip + slice isolation + reset + version + watch
  W.project.reset();
  W.project.update({ circuits: [{ id: "1", name: "A" }] }, true);
  W.project.update({ items: [{ id: 9, circuitId: "1" }] }, true);
  let p = W.project.load();
  ok(p.circuits.length === 1 && p.items.length === 1, "project: circuits+items coexist after separate updates (no clobber)");
  ok(p.items[0].circuitId === "1", "project: circuitId persisted");
  W.project.update({ circuits: [{ id: "1" }, { id: "2" }] }, true);
  ok(W.project.load().items.length === 1, "project: updating circuits preserved items slice");
  // malformed + version mismatch
  store0.setItem("metagrid.project.v1", "{not json");
  ok(W.project.load().circuits.length === 0, "project: malformed JSON -> empty (no throw)");
  store0.setItem("metagrid.project.v1", JSON.stringify({ v: 99, circuits: [{ id: "x" }] }));
  ok(W.project.load().circuits.length === 0, "project: version mismatch -> empty");
  W.project.reset();
  ok(W.project.load().circuits.length === 0 && store0._map.has("metagrid.project.v1") === false, "project: reset clears the key");
  // private-mode: storage that throws
  const throwingStore = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); }, removeItem() { throw new Error("denied"); } };
  global.localStorage = throwingStore;
  let pmThrew = false;
  try { W.project.load(); W.project.update({ items: [{ id: 1 }] }, true); W.project.reset(); } catch (e) { pmThrew = true; }
  ok(!pmThrew, "project: private-mode (localStorage throws) degrades gracefully, no exception");
  global.localStorage = store0;

  // =====================================================================
  section("2. Boot integrity — each app loads with no genuine JS error");
  for (const f of ["residential-wiring-reference.html", "panel-schedule-56HA.html", "basement-planner.html"]) {
    const a = loadApp(f, makeStore());
    ok(!a.ctorErr, f + " constructed without throwing" + (a.ctorErr ? " — " + a.ctorErr.message : ""));
    ok(a.window && !!a.window.WiringShared, f + " — WiringShared present after boot");
    ok(a.realErrs.length === 0, f + " — no genuine JS errors during init" + (a.realErrs.length ? " :: " + a.realErrs.slice(0, 3).join(" | ") : ""));
  }

  // =====================================================================
  section("3. Panel — workflows + publish");
  {
    const store = makeStore();
    const a = loadApp("panel-schedule-56HA.html", store);
    const w = a.window, d = a.doc;
    ok(d.querySelectorAll(".brk[data-id]").length >= 10, "panel rendered breakers (" + d.querySelectorAll(".brk[data-id]").length + ")");
    ok(d.querySelectorAll("tr[data-circuit]").length >= 10, "panel rendered load rows (" + d.querySelectorAll("tr[data-circuit]").length + ")");
    const proj = w.WiringShared.project.load();
    ok(proj.circuits.length > 0 && proj.loads.length > 0, "panel published circuits/loads to project");
    let threw = false;
    try { w.rerenderAll(); w.rerenderAll(); } catch (e) { threw = true; }
    ok(!threw, "panel rerenderAll() x2 no throw");
    try { if (typeof w.exportData === "function") w.exportData(); } catch (e) { threw = true; }
    ok(!threw, "panel exportData() no throw (guarded URL/click polyfills)");
    // deep links to several circuits incl. 240V '+' id
    let dlThrew = false;
    for (const id of ["1", "2", "11", "16", "4+6", "8+10"]) {
      try { w.location.hash = "#circuit=" + id; w.dispatchEvent(ev(w, "hashchange")); } catch (e) { dlThrew = true; }
    }
    ok(!dlThrew, "panel deep links to 6 circuits no throw");
    const flashed = d.querySelector(".brk.flash");
    ok(!!flashed, "panel last deep link flashed a breaker");
  }

  // =====================================================================
  section("4. Reference — calculator (DOM-driven) + snapshot + deep links");
  {
    const a = loadApp("residential-wiring-reference.html", makeStore());
    const w = a.window, d = a.doc;
    const setCalc = (vals) => {
      Object.entries(vals).forEach(([id, v]) => { const el = d.getElementById(id); if (el) { el.value = String(v); el.dispatchEvent(ev(w, "input")); } });
    };
    const out = () => (d.getElementById("calcOut") ? d.getElementById("calcOut").textContent : "");
    setCalc({ cond14: 0, cond12: 3, cond10: 0, devices: 1, grounds: 1, clamps: 1, boxsize: 22.5 });
    ok(/cu in/.test(out()) && /22\.50|sufficient|Headroom/.test(out()), "reference calc renders for 3x12 + device");
    // mixed gauge -> caveat unhides
    setCalc({ cond14: 2, cond10: 2 });
    const caveat = d.getElementById("mixedGaugeCaveat");
    ok(caveat && !caveat.classList.contains("hidden"), "reference mixed-gauge caveat shown when 14+10 present");
    setCalc({ cond14: 0, cond10: 0 });
    ok(!caveat || caveat.classList.contains("hidden"), "reference caveat re-hidden when single gauge");
    // huge input -> "too small" path, no throw
    let cThrew = false;
    try { setCalc({ cond12: 200, boxsize: 18 }); } catch (e) { cThrew = true; }
    ok(!cThrew && /too small|at least/i.test(out()), "reference calc huge input -> 'too small', no throw");
    // presets
    const preset = d.querySelector("#presets button");
    let pThrew = false;
    try { if (preset) preset.dispatchEvent(ev(w, "click")); } catch (e) { pThrew = true; }
    ok(!pThrew, "reference preset button click no throw");
    // deep links to all parts + calc + appendix
    let dThrew = false;
    for (let i = 1; i <= 14; i++) { try { w.location.hash = "#part" + i; w.dispatchEvent(ev(w, "hashchange")); } catch (e) { dThrew = true; } }
    for (const h of ["#calc", "#appendix", "#contents"]) { try { w.location.hash = h; w.dispatchEvent(ev(w, "hashchange")); } catch (e) { dThrew = true; } }
    ok(!dThrew, "reference deep links to 14 parts + calc/appendix/contents no throw");
    const p6 = d.getElementById("part6");
    w.location.hash = "#part6"; w.dispatchEvent(ev(w, "hashchange"));
    ok(p6 && p6.open === true, "reference #part6 opened its <details>");
    // empty-project snapshot
    const snap = d.getElementById("mg-project-snapshot");
    ok(snap && /No shared project|Project data/.test(snap.textContent), "reference project snapshot rendered (empty state)");
  }

  // =====================================================================
  section("5. Planner — heavy workflow (place types / drag / undo-redo / floor / assign / delete / mobile)");
  {
    const store = makeStore();
    const a = loadApp("basement-planner.html", store);
    const w = a.window, d = a.doc;
    ok(a.realErrs.length === 0, "planner booted clean" + (a.realErrs.length ? " :: " + a.realErrs.slice(0, 2).join(" | ") : ""));

    // place a representative set of fixture types (exercises special-case branches)
    const placements = [
      ["electrical", "receptacle"], ["network", "ap"], ["lighting", "can"],
      ["furniture", "rect"], ["zone", "zone"], ["annotation", "note"], ["annotation", "arrow"], ["electrical", "240v"],
    ];
    let placeThrew = false, x = 120;
    for (const [layer, type] of placements) {
      w.setTool("select");
      try { w.placeItem(layer, type, { x: x, y: 200 }); } catch (e) { placeThrew = true; console.error("   place " + layer + ":" + type + " -> " + e.message); }
      x += 36;
    }
    ok(!placeThrew, "planner placed 8 fixture types incl. ap/rect/zone/note/arrow/240v without throw");
    w.syncProjectFromPlanner();
    ok(w.WiringShared.project.load().items.length === 8, "planner project has 8 items after placement");

    // drag the first placed item
    let dragThrew = false;
    try {
      const placed = d.querySelector(".placed[data-id]");
      const svg = d.getElementById("plan");
      pointer(w, "pointerdown", placed, 120, 200);
      pointer(w, "pointermove", svg, 168, 248);
      pointer(w, "pointerup", w, 168, 248);
    } catch (e) { dragThrew = true; }
    ok(!dragThrew, "planner pointer drag no throw");

    // undo/redo chain
    let undoThrew = false;
    try { for (let i = 0; i < 12; i++) w.undo(); } catch (e) { undoThrew = true; }
    w.syncProjectFromPlanner();
    const afterUndo = w.WiringShared.project.load().items.length;
    ok(!undoThrew, "planner 12x undo (past stack bottom) no throw");
    ok(afterUndo === 0, "planner undo emptied items (" + afterUndo + ")");
    let redoThrew = false;
    try { for (let i = 0; i < 12; i++) w.redo(); } catch (e) { redoThrew = true; }
    w.syncProjectFromPlanner();
    const afterRedo = w.WiringShared.project.load().items.length;
    ok(!redoThrew, "planner 12x redo no throw");
    ok(afterRedo === 8, "planner redo restored all 8 items (" + afterRedo + ")");

    // floor switch + place on first floor
    let floorThrew = false;
    try { w.setFloor("first"); w.placeItem("electrical", "receptacle", { x: 200, y: 300 }); w.setFloor("basement"); } catch (e) { floorThrew = true; }
    ok(!floorThrew, "planner floor switch + place on first floor no throw");
    w.syncProjectFromPlanner();
    const items = w.WiringShared.project.load().items;
    ok(items.length === 9 && items.some((it) => it.floor === "first"), "planner item placed on 'first' floor persisted");
    ok(d.querySelectorAll(".placed[data-id]").length === 8, "planner renders only active-floor (basement) items (8 of 9)");

    // assign a circuit via inspector dropdown (needs circuits — seed project then refresh)
    w.WiringShared.project.update({ circuits: [{ id: "11", name: "Refrigerator", amps: 15 }] }, true);
    w.refreshProjectCircuits();
    w.setTool("select");
    const someItem = d.querySelector(".placed[data-id]");
    pointer(w, "pointerdown", someItem, 0, 0); // select it
    const sel = d.getElementById("insp-circuit");
    let assignOk = false;
    if (sel) { sel.value = "11"; sel.dispatchEvent(ev(w, "change")); w.syncProjectFromPlanner(); assignOk = w.WiringShared.project.load().items.some((it) => String(it.circuitId) === "11"); }
    ok(!!sel, "planner inspector circuit dropdown present");
    ok(assignOk, "planner assigned item to circuit 11 (round-trips to project)");

    // delete via tool
    let delThrew = false;
    try { w.setTool("delete"); const pe = d.querySelector(".placed[data-id]"); if (pe) pointer(w, "pointerdown", pe, 0, 0); } catch (e) { delThrew = true; }
    ok(!delThrew, "planner delete-tool no throw");

    // mobile chrome
    const bar = d.getElementById("mg-actionbar");
    ok(bar && bar.querySelectorAll("button").length === 4, "planner mobile action bar (4 buttons)");
    const leftAside = d.querySelector("main > aside:not(.right)");
    const layersBtn = bar && Array.prototype.find.call(bar.querySelectorAll("button"), (b) => /Layers/.test(b.textContent));
    if (layersBtn) layersBtn.dispatchEvent(ev(w, "click"));
    ok(leftAside && leftAside.classList.contains("mg-open"), "planner Layers/Tools opens drawer");
    const scrim = d.getElementById("mg-scrim");
    if (scrim) scrim.dispatchEvent(ev(w, "click"));
    ok(leftAside && !leftAside.classList.contains("mg-open"), "planner scrim closes drawer");
  }

  // =====================================================================
  section("6. Planner — persistence reload (debounced write -> fresh boot restores)");
  {
    const store = makeStore();
    const a1 = loadApp("basement-planner.html", store);
    const w1 = a1.window;
    w1.placeItem("electrical", "receptacle", { x: 150, y: 150 });
    w1.placeItem("lighting", "can", { x: 200, y: 200 });
    w1.setFloor("first");
    await sleep(360); // flush the 250ms persistRaw debounce
    const persisted = JSON.parse(store.getItem("basement_planner_v1") || "{}");
    ok(Array.isArray(persisted.items) && persisted.items.length === 2, "planner persisted 2 items + floor to basement_planner_v1");
    ok(persisted.floor === "first", "planner persisted active floor=first");
    const a2 = loadApp("basement-planner.html", store);
    ok(a2.realErrs.length === 0, "planner re-boot from saved state clean");
    a2.window.syncProjectFromPlanner();
    ok(a2.window.WiringShared.project.load().items.length === 2, "planner restored 2 items on reload");
  }

  // =====================================================================
  section("7. Cross-app integration — panel -> planner -> reference (one shared store)");
  {
    const store = makeStore();
    const panel = loadApp("panel-schedule-56HA.html", store); // publishes circuits/loads
    const planner = loadApp("basement-planner.html", store); // reads circuits, writes items
    planner.window.placeItem("electrical", "receptacle", { x: 150, y: 150 });
    planner.window.placeItem("network", "ap", { x: 250, y: 250 });
    // assign first item to a real published circuit
    const circuits = planner.window.WiringShared.project.load().circuits;
    const target = circuits.find((c) => c.id === "11") || circuits[0];
    planner.window.refreshProjectCircuits();
    planner.window.setTool("select");
    pointer(planner.window, "pointerdown", planner.doc.querySelector(".placed[data-id]"), 0, 0);
    const sel = planner.doc.getElementById("insp-circuit");
    if (sel) { sel.value = String(target.id); sel.dispatchEvent(ev(planner.window, "change")); }
    planner.window.syncProjectFromPlanner();
    const proj = planner.window.WiringShared.project.load();
    ok(proj.circuits.length > 0 && proj.items.length === 2, "integration: circuits + 2 items coexist in shared project");
    ok(proj.items.some((it) => String(it.circuitId) === String(target.id)), "integration: item joined to published circuit " + target.id);
    // reference reads it
    const ref = loadApp("residential-wiring-reference.html", store);
    const snap = ref.doc.getElementById("mg-project-snapshot");
    ok(snap && /kVA/.test(snap.textContent), "integration: reference snapshot shows connected load (kVA) from shared project");
    ok(snap && /Bill of materials/i.test(snap.textContent), "integration: reference snapshot rendered BOM from the 2 placed items");
    ok(ref.realErrs.length === 0, "integration: reference booted clean with populated project");
  }

  // =====================================================================
  console.log("\n==================================================");
  console.log("VIGOROUS SMOKE: " + pass + " passed, " + fail + " failed");
  if (fail) { console.log("Failures:"); fails.forEach((f) => console.log("  - " + f)); }
  console.log("==================================================");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("HARNESS CRASH:", e); process.exit(2); });
