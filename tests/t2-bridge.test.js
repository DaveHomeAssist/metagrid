/* T2 two-context bridge round-trip:
 *   ctx "panel"   loads -> publishes circuits[]/loads[] to a SHARED localStorage
 *   ctx "planner" loads (same store) -> reads circuits, places an item, assigns
 *                 it to a circuit via the REAL inspector dropdown handler, writes items[]
 *   assert the circuitId link round-trips through metagrid.project.v1, that the
 *   panel's circuits aren't clobbered by the planner's item write, and that a
 *   later panel re-publish preserves the planner's items. */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const DIR = require("path").join(__dirname, "..", "public", "tools");
const WIRING = fs.readFileSync(path.join(DIR, "wiring-shared.js"), "utf8");

let fail = 0;
const ok = (c, m) => (c ? console.log("  ok  " + m) : (fail++, console.error("  FAIL " + m)));

// ONE shared storage object, injected into BOTH windows (simulates file:// same-origin).
function makeStore() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    key: (i) => Array.from(map.keys())[i] ?? null,
    get length() {
      return map.size;
    },
    _map: map,
  };
}

function loadPage(file, store) {
  let html = fs.readFileSync(path.join(DIR, file), "utf8");
  html = html.replace(/<script\b[^>]*\bsrc\s*=\s*["']wiring-shared\.js["'][^>]*><\/script>/i, "<script>\n" + WIRING + "\n</script>");
  const dom = new JSDOM(html, {
    url: "https://x.test/" + file,
    runScripts: "dangerously",
    pretendToBeVisual: true,
    beforeParse(window) {
      window.structuredClone = (v) => JSON.parse(JSON.stringify(v));
      Object.defineProperty(window, "localStorage", { value: store, configurable: true });
      if (!window.matchMedia) window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, media: "" });
      window.Element.prototype.scrollIntoView = function () {};
      if (!window.CSS) window.CSS = {};
      if (!window.CSS.escape) window.CSS.escape = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
    },
  });
  return dom.window;
}

(async () => {
  const store = makeStore();

  // ---- 1) Panel publishes circuits/loads ----
  console.log("\n-- panel context --");
  const panel = loadPage("panel-schedule-56HA.html", store);
  const proj1 = panel.WiringShared.project.load();
  ok(proj1.circuits.length > 0, "panel published circuits (" + proj1.circuits.length + ")");
  ok(proj1.loads.length > 0, "panel published loads (" + proj1.loads.length + ")");
  const targetCircuit = proj1.circuits.find((c) => c.id === "11") || proj1.circuits[0];
  ok(!!targetCircuit, "have a target circuit id=" + (targetCircuit && targetCircuit.id));
  // namespacing: panel keys + project key coexist
  ok(store._map.has("metagrid.project.v1"), "shared project key present");

  // ---- 2) Planner reads circuits, places + assigns an item ----
  console.log("\n-- planner context (shared store) --");
  const planner = loadPage("basement-planner.html", store);
  ok(typeof planner.placeItem === "function", "planner.placeItem is global");
  ok(typeof planner.syncProjectFromPlanner === "function", "planner.syncProjectFromPlanner is global");
  planner.placeItem("electrical", "receptacle", { x: 300, y: 300 });
  const sel = planner.document.querySelector("#insp-circuit");
  ok(!!sel, "inspector 'Assigned circuit' dropdown rendered for the placed item");
  ok(sel && sel.querySelectorAll("option").length > 1, "dropdown lists panel circuits (" + (sel ? sel.querySelectorAll("option").length : 0) + " options)");
  // assign via the REAL change handler
  sel.value = String(targetCircuit.id);
  sel.dispatchEvent(new planner.Event("change", { bubbles: true }));
  planner.syncProjectFromPlanner(); // flush past the debounce for a deterministic read

  // ---- 3) Round-trip assertions ----
  console.log("\n-- round-trip --");
  const proj2 = planner.WiringShared.project.load();
  ok(proj2.circuits.length === proj1.circuits.length, "panel circuits preserved after planner item write (" + proj2.circuits.length + ")");
  ok(proj2.items.length >= 1, "planner item persisted to project (" + proj2.items.length + ")");
  const linked = proj2.items.find((it) => String(it.circuitId) === String(targetCircuit.id));
  ok(!!linked, "item.circuitId === " + targetCircuit.id + " round-tripped");
  ok(linked && linked.x === 300 && linked.y === 300, "linked item carries x/y (Planner owns positions)");
  ok(linked && !!linked.floor, "linked item carries floor=" + (linked && linked.floor));
  ok(
    proj2.circuits.some((c) => String(c.id) === String(linked && linked.circuitId)),
    "join holds: item.circuitId matches a real panel circuit"
  );

  // ---- 4) Cross-tab: panel re-publish must not drop the planner item ----
  console.log("\n-- panel re-publish (cross-tab safety) --");
  if (typeof panel.rerenderAll === "function") panel.rerenderAll();
  else panel.syncProjectFromPanel();
  const proj3 = planner.WiringShared.project.load();
  ok(proj3.items.length === proj2.items.length, "panel re-publish preserved planner items[] (" + proj3.items.length + ")");
  ok(
    proj3.items.some((it) => String(it.circuitId) === String(targetCircuit.id)),
    "circuitId link survived panel re-publish"
  );

  // ---- 5) focus/visibility re-read: a new panel circuit shows after refocus ----
  console.log("\n-- focus re-read (watch) --");
  const p = panel.WiringShared.project.load();
  p.circuits.push({ id: "TEST99", name: "Added in panel", amps: 20, volt: "120V" });
  panel.WiringShared.project.save(p, true); // panel writes a new circuit to the shared store
  planner.dispatchEvent(new planner.Event("focus")); // planner regains focus -> watch should re-read
  planner.placeItem("electrical", "receptacle", { x: 350, y: 350 });
  const sel2 = planner.document.querySelector("#insp-circuit");
  const has99 = !!(sel2 && Array.prototype.some.call(sel2.options, (o) => o.value === "TEST99"));
  ok(has99, "planner dropdown shows panel's new circuit TEST99 after refocus (watch re-read fired)");

  console.log("\n==== T2 bridge: " + (fail ? fail + " FAILED" : "ALL PASSED") + " ====");
  process.exit(fail ? 1 : 0);
})();
