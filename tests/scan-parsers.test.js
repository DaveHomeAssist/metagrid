/* Scan parser verification: CSV, SVG, DXF import paths render locked scan
 * shells, persist through reload, preserve items, and reject unsupported files
 * with a named message in the intake UI. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { JSDOM } = require("jsdom");

const DIR = path.join(__dirname, "..");
const WIRING = fs.readFileSync(path.join(DIR, "wiring-shared.js"), "utf8");
let HTML = fs.readFileSync(path.join(DIR, "basement-planner.html"), "utf8");
HTML = HTML.replace(/<script\b[^>]*\bsrc\s*=\s*["']wiring-shared\.js["'][^>]*><\/script>/i, "<script>\n" + WIRING + "\n</script>");

function makeStore(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    key: (i) => Array.from(map.keys())[i] ?? null,
    get length() { return map.size; },
  };
}
function polyfill(window, store) {
  window.structuredClone = (v) => JSON.parse(JSON.stringify(v));
  Object.defineProperty(window, "localStorage", { value: store, configurable: true });
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, media: "" });
  window.Element.prototype.scrollIntoView = function () {};
}
function load(store) {
  return new JSDOM(HTML, {
    url: "https://x.test/basement-planner.html#scan",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    beforeParse(window) { polyfill(window, store); },
  });
}
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function seed() {
  return {
    basement_planner_v1: JSON.stringify({
      items: [{ id: 41, layer: "electrical", type: "receptacle", floor: "basement", x: 180, y: 180, label: "R1" }],
      nextId: 42,
      floor: "basement",
      prefs: { lastFloor: "basement", lastLayer: "electrical", lastTool: "select" },
    }),
  };
}
async function checkImport(name, text, expectedSource) {
  const store = makeStore(seed());
  const dom = load(store);
  dom.window.importScanText(name, text);
  await wait(350);
  assert.equal(dom.window.document.querySelectorAll("#scan-shell-layer .scan-shell-wall").length, 4, name + " renders four walls");
  let saved = JSON.parse(store.getItem("basement_planner_v1"));
  assert.equal(saved.scans.length, 1, name + " persisted one scan");
  assert.equal(saved.scans[0].source, expectedSource, name + " source saved");
  assert.equal(saved.items.length, 1, name + " preserved item count");
  assert.equal(saved.items[0].id, 41, name + " preserved item id");
  assert(!JSON.stringify(saved.undoStack || []).includes("scans"), name + " kept scans out of undo");
  dom.window.close();
  const reload = load(store);
  await wait(50);
  assert.equal(reload.window.document.querySelectorAll("#scan-shell-layer .scan-shell-wall").length, 4, name + " rendered after reload");
  reload.window.close();
}

(async () => {
  await checkImport(
    "harding-roomplan.scan.v1.json",
    JSON.stringify({
      schema: "scan.v1",
      source: "roomplan",
      floor: "basement",
      room: "RoomPlan capture",
      units: "m",
      confidence: "field-check",
      walls: [
        { id: "rp-wall-1", x1: 0, y1: 0, x2: 3.048, y2: 0, height: 2.4384, confidence: "field-check" },
        { id: "rp-wall-2", x1: 3.048, y1: 0, x2: 3.048, y2: 2.4384, height: 2.4384, confidence: "field-check" },
        { id: "rp-wall-3", x1: 3.048, y1: 2.4384, x2: 0, y2: 2.4384, height: 2.4384, confidence: "low-confidence" },
        { id: "rp-wall-4", x1: 0, y1: 2.4384, x2: 0, y2: 0, height: 2.4384, confidence: "field-check" },
      ],
      openings: [],
      meta: {
        project: "56 Harding Ave",
        exporter: "HardingScanBridge",
        roomPlanCoordinateSpace: "meters; x maps to x, -z maps to y",
      },
    }),
    "roomplan"
  );

  await checkImport(
    "walls.csv",
    [
      "id,x1,y1,x2,y2,floor,room,units,confidence",
      "a,0,0,10,0,basement,Laundry,ft,verified",
      "b,10,0,10,8,basement,Laundry,ft,verified",
      "c,10,8,0,8,basement,Laundry,ft,field-check",
      "d,0,8,0,0,basement,Laundry,ft,low-confidence",
    ].join("\n"),
    "csv"
  );
  await checkImport("scan.svg", '<svg><path d="M0 0 L10 0 L10 8 L0 8 Z"/></svg>', "svg");
  await checkImport(
    "scan.dxf",
    [
      "0", "SECTION", "2", "ENTITIES",
      "0", "LWPOLYLINE", "70", "1",
      "10", "0", "20", "0",
      "10", "10", "20", "0",
      "10", "10", "20", "8",
      "10", "0", "20", "8",
      "0", "ENDSEC", "0", "EOF",
    ].join("\n"),
    "dxf"
  );

  const store = makeStore(seed());
  const dom = load(store);
  let rejected = false;
  try {
    dom.window.importScanText("scan.usdz", "not parsed");
  } catch (err) {
    rejected = err.code === "UNSUPPORTED_FORMAT";
  }
  assert.equal(rejected, true, "unsupported USDZ rejected with typed code");
  assert(dom.window.document.getElementById("scan-message").textContent.includes("UNSUPPORTED_FORMAT"), "unsupported rejection shown in UI");
  dom.window.close();

  console.log("scan parsers: RoomPlan scan.v1/CSV/SVG/DXF/unsupported passed");
})().catch(err => {
  console.error(err);
  process.exit(1);
});
