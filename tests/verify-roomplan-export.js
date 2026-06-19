/* Verifies a real HardingScanBridge RoomPlan export against the browser intake.
 * Usage:
 *   node tests/verify-roomplan-export.js /path/to/56-harding-roomplan-basement.scan.v1.json
 */
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { JSDOM } = require("jsdom");

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node tests/verify-roomplan-export.js /path/to/exported.scan.v1.json");
  process.exit(2);
}

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
      items: [{ id: 91, layer: "electrical", type: "receptacle", floor: "basement", x: 180, y: 180, label: "R1" }],
      nextId: 92,
      floor: "basement",
      prefs: { lastFloor: "basement", lastLayer: "electrical", lastTool: "select" },
    }),
  };
}

function preflight(raw) {
  assert(raw && typeof raw === "object", "export is a JSON object");
  assert.equal(raw.schema, "scan.v1", "schema is scan.v1");
  assert.equal(raw.source, "roomplan", "source is roomplan");
  assert.equal(raw.units, "m", "RoomPlan export uses meters");
  assert(["basement", "first"].includes(raw.floor), "floor is basement or first");
  assert(Array.isArray(raw.walls) && raw.walls.length > 0, "export has walls");
  for (const [index, wall] of raw.walls.entries()) {
    for (const key of ["x1", "y1", "x2", "y2"]) {
      assert(Number.isFinite(Number(wall[key])), "wall " + (index + 1) + " has finite " + key);
    }
    assert(["field-check", "low-confidence"].includes(wall.confidence), "wall " + (index + 1) + " confidence is mapped");
  }
}

(async () => {
  const text = fs.readFileSync(filePath, "utf8");
  const raw = JSON.parse(text);
  preflight(raw);

  const store = makeStore(seed());
  const dom = load(store);
  dom.window.importScanText(path.basename(filePath), text, "application/json");
  await wait(350);

  const wallCount = dom.window.document.querySelectorAll("#scan-shell-layer .scan-shell-wall").length;
  assert.equal(wallCount, raw.walls.length, "rendered every exported wall");
  let saved = JSON.parse(store.getItem("basement_planner_v1"));
  assert.equal(saved.items.length, 1, "preserved planner items");
  assert.equal(saved.items[0].id, 91, "preserved planner item id");
  assert.equal(saved.scans.length, 1, "persisted one scan");
  assert.equal(saved.scans[0].id, raw.id || saved.scans[0].id, "persisted exported scan id");
  assert.equal(saved.scans[0].source, "roomplan", "persisted source roomplan");
  assert.equal(saved.scans[0].walls.length, raw.walls.length, "persisted every wall");
  assert(!JSON.stringify(saved.undoStack || []).includes("scans"), "kept scans out of undo");
  dom.window.close();

  const reload = load(store);
  await wait(50);
  assert.equal(reload.window.document.querySelectorAll("#scan-shell-layer .scan-shell-wall").length, raw.walls.length, "rendered every wall after reload");
  reload.window.close();

  console.log("roomplan export verified: " + raw.walls.length + " wall(s), floor=" + raw.floor + ", id=" + (raw.id || "generated"));
})().catch(err => {
  console.error(err);
  process.exit(1);
});
