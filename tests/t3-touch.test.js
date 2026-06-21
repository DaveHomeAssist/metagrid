/* T3 verify: pointer-event place/drag/undo/floor in jsdom + mobile chrome.
 * Polyfills the SVG CTM methods so the planner's clientToSvg() maps identity. */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const DIR = require("path").join(__dirname, "..", "public", "tools");
const WIRING = fs.readFileSync(path.join(DIR, "wiring-shared.js"), "utf8");

let fail = 0;
const ok = (c, m) => (c ? console.log("  ok  " + m) : (fail++, console.error("  FAIL " + m)));

function makeStore() {
  const map = new Map();
  return { getItem: (k) => (map.has(k) ? map.get(k) : null), setItem: (k, v) => map.set(k, String(v)), removeItem: (k) => map.delete(k), clear: () => map.clear(), key: (i) => Array.from(map.keys())[i] ?? null, get length() { return map.size; } };
}

function loadPlanner() {
  let html = fs.readFileSync(path.join(DIR, "basement-planner.html"), "utf8");
  html = html.replace(/<script\b[^>]*\bsrc\s*=\s*["']wiring-shared\.js["'][^>]*><\/script>/i, "<script>\n" + WIRING + "\n</script>");
  const store = makeStore();
  const dom = new JSDOM(html, {
    url: "https://x.test/basement-planner.html",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    beforeParse(window) {
      window.structuredClone = (v) => JSON.parse(JSON.stringify(v));
      Object.defineProperty(window, "localStorage", { value: store, configurable: true });
      if (!window.matchMedia) window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, media: "" });
      window.Element.prototype.scrollIntoView = function () {};
      // SVG CTM polyfills -> clientToSvg() becomes identity (svg px == client px)
      const SVG = window.SVGSVGElement && window.SVGSVGElement.prototype;
      if (SVG) {
        SVG.createSVGPoint = function () { const o = { x: 0, y: 0 }; o.matrixTransform = function () { return { x: o.x, y: o.y }; }; return o; };
        SVG.getScreenCTM = function () { return { inverse: function () { return {}; } }; };
      }
    },
  });
  return dom.window;
}

function pointer(win, type, target, x, y) {
  let e;
  try {
    e = new win.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
  } catch (_) {
    e = new win.Event(type, { bubbles: true, cancelable: true });
    try { Object.defineProperty(e, "clientX", { value: x }); Object.defineProperty(e, "clientY", { value: y }); } catch (__) {}
  }
  e.pointerId = 1;
  e.isPrimary = true;
  target.dispatchEvent(e);
  return e;
}

(async () => {
  const win = loadPlanner();
  const doc = win.document;
  const svg = doc.getElementById("plan");
  ok(!!svg, "#plan present");
  ok(typeof win.setTool === "function", "setTool is global");
  ok(typeof win.undo === "function", "undo is global");
  ok(typeof win.setFloor === "function", "setFloor is global");

  // ---- pointer PLACE ----
  const before = doc.querySelectorAll(".placed[data-id]").length;
  win.setTool("place:electrical:receptacle");
  pointer(win, "pointerdown", svg, 300, 300); // inside plan bounds (60..660 x, 60..1020 y)
  const afterPlace = doc.querySelectorAll(".placed[data-id]").length;
  ok(afterPlace === before + 1, "pointerdown placed an item (" + before + " -> " + afterPlace + ")");
  win.syncProjectFromPlanner();
  let items = win.WiringShared.project.load().items;
  ok(items.length === 1 && items[0].x === 300 && items[0].y === 300, "placed item at snapped (300,300)");
  const placedEl = doc.querySelector(".placed[data-id]");

  // ---- pointer DRAG ----
  win.setTool("select");
  pointer(win, "pointerdown", placedEl, 300, 300); // select + start drag on the item
  pointer(win, "pointermove", svg, 360, 360); // drag
  pointer(win, "pointerup", win, 360, 360); // commit (window-level handler)
  win.syncProjectFromPlanner();
  items = win.WiringShared.project.load().items;
  ok(items[0].x === 360 && items[0].y === 360, "pointer drag moved item to (360,360) snapped, got (" + items[0].x + "," + items[0].y + ")");

  // ---- UNDO still works after pointer drag ----
  win.undo();
  win.syncProjectFromPlanner();
  items = win.WiringShared.project.load().items;
  ok(items.length === 1 && items[0].x === 300, "undo reverted the drag (x back to 300)");

  // ---- FLOOR switcher ----
  win.setFloor("first");
  ok(doc.getElementById("mg-floor-btn") && doc.getElementById("mg-floor-btn").textContent.indexOf("First") >= 0, "setFloor('first') switched + synced mobile label");
  win.setFloor("basement");
  ok(doc.getElementById("mg-floor-btn") && doc.getElementById("mg-floor-btn").textContent.indexOf("Basement") >= 0, "setFloor('basement') switched back");

  // ---- DELETE via tool ----
  win.setTool("delete");
  pointer(win, "pointerdown", doc.querySelector(".placed[data-id]"), 300, 300);
  ok(doc.querySelectorAll(".placed[data-id]").length === 0, "delete tool + pointerdown removed the item");

  // ---- mobile chrome injected ----
  const bar = doc.getElementById("mg-actionbar");
  ok(!!bar, "#mg-actionbar injected");
  ok(bar && bar.querySelectorAll("button").length === 4, "action bar has 4 buttons (Undo/Floor/Layers/Items), got " + (bar ? bar.querySelectorAll("button").length : 0));
  ok(!!doc.getElementById("mg-scrim"), "#mg-scrim backdrop injected");
  ok(!!doc.getElementById("mg-floor-btn"), "floor button present in action bar");

  // ---- drawer toggle behavior ----
  const leftAside = doc.querySelector("main > aside:not(.right)");
  const layersBtn = Array.prototype.find.call(bar.querySelectorAll("button"), (b) => /Layers/.test(b.textContent));
  layersBtn.click();
  ok(leftAside.classList.contains("mg-open"), "Layers/Tools button opens the left drawer");
  doc.getElementById("mg-scrim").click();
  ok(!leftAside.classList.contains("mg-open"), "scrim click closes the drawer");

  console.log("\n==== T3 verify: " + (fail ? fail + " FAILED" : "ALL PASSED") + " ====");
  process.exit(fail ? 1 : 0);
})();
