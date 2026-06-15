/* Regression-equality test: module vs verbatim inline oracle.
 * Oracle = the exact arithmetic copied from the inline files. If the module
 * ever drifts from the inline math, these assertions fail. */
const W = require(require("path").join(__dirname, "..", "wiring-shared.js"));

let pass = 0,
  fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++;
  else {
    fail++;
    console.error("FAIL:", msg, "\n   got:", JSON.stringify(a), "\n   exp:", JSON.stringify(b));
  }
}

/* ---- deterministic PRNG so fuzz failures reproduce ---- */
let _s = 123456789;
function rnd() {
  _s = (1103515245 * _s + 12345) & 0x7fffffff;
  return _s / 0x7fffffff;
}
function ri(max) {
  return Math.floor(rnd() * (max + 1));
}

/* =====================================================================
 * BOX FILL ORACLE — verbatim from residential-wiring-reference.html calc()
 * Current per-gauge mixed-gauge model (cond14/cond12/cond10).
 * ===================================================================== */
const BOX_SIZES = [18, 20.3, 22.5, 30.3, 42];
const AWG_UNITS = { cond14: 2.0, cond12: 2.25, cond10: 2.5 };
function smallestFitOracle(req) {
  for (var i = 0; i < BOX_SIZES.length; i++) {
    if (BOX_SIZES[i] >= req) return BOX_SIZES[i];
  }
  return null;
}
function numO(v) {
  var n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}
function boxFillOracle(inp) {
  var cond14 = numO(inp.cond14),
    cond12 = numO(inp.cond12),
    cond10 = numO(inp.cond10);
  var devices = numO(inp.devices),
    grounds = numO(inp.grounds),
    clamps = numO(inp.clamps);
  var target = numO(inp.boxsize);
  var counts = { cond14: cond14, cond12: cond12, cond10: cond10 };
  var insulatedVolume = cond14 * AWG_UNITS.cond14 + cond12 * AWG_UNITS.cond12 + cond10 * AWG_UNITS.cond10;
  var present = Object.keys(counts).filter(function (k) {
    return counts[k] > 0;
  });
  var largestKey = present.length ? present[present.length - 1] : "cond12";
  var largestUnit = AWG_UNITS[largestKey];
  var groundUnit = grounds > 0 ? 1 : 0;
  var clampUnit = clamps > 0 ? 1 : 0;
  var deviceUnits = devices * 2;
  var groundVolume = groundUnit * largestUnit;
  var clampVolume = clampUnit * largestUnit;
  var deviceVolume = deviceUnits * largestUnit;
  var totalUnits = cond14 + cond12 + cond10 + groundUnit + clampUnit + deviceUnits;
  var required = insulatedVolume + groundVolume + clampVolume + deviceVolume;
  var ok = target >= required;
  var fit = smallestFitOracle(required);
  return { insulatedVolume, largestKey, groundVolume, clampVolume, deviceVolume, totalUnits, required, fit, ok };
}
function pick(m) {
  // project module result onto the oracle's compared fields
  return { insulatedVolume: m.insulatedVolume, largestKey: m.largestKey, groundVolume: m.groundVolume, clampVolume: m.clampVolume, deviceVolume: m.deviceVolume, totalUnits: m.totalUnits, required: m.required, fit: m.fit, ok: m.ok };
}

const PRESET_BOXES = [18, 20.3, 22.5, 30.3, 42];

// Fixed vectors: the four CURRENT inline PRESETS (end-run / mid-tap / 3way / fan).
const PRESETS = [
  { cond14: 0, cond12: 2, cond10: 0, devices: 1, grounds: 1, clamps: 1, boxsize: 18 },
  { cond14: 0, cond12: 6, cond10: 0, devices: 1, grounds: 1, clamps: 1, boxsize: 22.5 },
  { cond14: 0, cond12: 5, cond10: 0, devices: 1, grounds: 1, clamps: 1, boxsize: 22.5 },
  { cond14: 0, cond12: 3, cond10: 0, devices: 2, grounds: 1, clamps: 1, boxsize: 30.3 },
];
PRESETS.forEach(function (p, i) {
  eq(pick(W.boxFill(p)), boxFillOracle(p), "boxFill PRESET " + i);
});

// Targeted mixed-gauge cases (the whole point of the new model):
[
  { cond14: 3, cond12: 0, cond10: 0, devices: 1, grounds: 1, clamps: 0, boxsize: 18 }, // only 14 -> largest 2.00
  { cond14: 2, cond12: 0, cond10: 2, devices: 1, grounds: 1, clamps: 1, boxsize: 22.5 }, // 14+10 -> largest 2.50
  { cond14: 1, cond12: 1, cond10: 1, devices: 2, grounds: 1, clamps: 1, boxsize: 30.3 }, // all three -> largest 2.50
  { cond14: 0, cond12: 0, cond10: 0, devices: 1, grounds: 1, clamps: 1, boxsize: 18 }, // none present -> default cond12 (2.25)
].forEach(function (p, i) {
  eq(pick(W.boxFill(p)), boxFillOracle(p), "boxFill mixed-gauge case " + i);
});

// Fuzz 5000 random per-gauge mixes across all box sizes.
for (let n = 0; n < 5000; n++) {
  const inp = {
    cond14: ri(6),
    cond12: ri(6),
    cond10: ri(6),
    devices: ri(4),
    grounds: ri(3),
    clamps: ri(2),
    boxsize: PRESET_BOXES[ri(4)],
  };
  eq(pick(W.boxFill(inp)), boxFillOracle(inp), "boxFill fuzz #" + n + " in=" + JSON.stringify(inp));
}

/* =====================================================================
 * LOAD ESTIMATE ORACLE — verbatim from panel-schedule-56HA.html
 * ===================================================================== */
const VA_BY_NAME = {
  "Electric dryer": 5000,
  "A/C condenser": 3500,
  Refrigerator: 700,
  Microwave: 1500,
  Dishwasher: 1400,
  "Coffee pot": 1000,
  "Washing machine (likely)": 1200,
  Oven: 300,
  "Sump pump #2": 800,
};
const VA_BY_KIND = { light: 120, outlet: 180, net: 100, appl: 1000, hvac: 3500, pump: 800, unk: 0 };
const loadVAo = (l) => VA_BY_NAME[l.load] ?? VA_BY_KIND[l.kind] ?? 150;
function loadEstimateOracle(loads) {
  let total = 0;
  loads.forEach((l) => (total += loadVAo(l)));
  const connectedA = Math.round(total / 240);
  const demandA = Math.round((10000 + 0.4 * Math.max(0, total - 10000)) / 240);
  return { totalVA: total, connectedA, demandA };
}

// Subtle-case checks: unk -> 0 (must NOT fall through to 150); unknown name+kind -> 150.
eq(W.loadVA({ kind: "unk" }), 0, "loadVA unk === 0 (no nullish fallthrough)");
eq(W.loadVA({ load: "Nonexistent", kind: "alsoNonexistent" }), 150, "loadVA fallback 150");
eq(W.loadVA({ load: "Electric dryer", kind: "light" }), 5000, "loadVA name beats kind");

// Realistic mixed loads, every name + every kind represented.
const KINDS = Object.keys(VA_BY_KIND).concat(["mystery"]);
const NAMES = Object.keys(VA_BY_NAME).concat([null, "Unknown gizmo"]);
// Fixed: a single big array touching every branch.
const bigLoads = [];
Object.keys(VA_BY_NAME).forEach((n) => bigLoads.push({ load: n, kind: "appl" }));
Object.keys(VA_BY_KIND).forEach((k) => bigLoads.push({ kind: k }));
bigLoads.push({ load: "Unknown gizmo", kind: "mystery" }); // -> 150
{
  const o = loadEstimateOracle(bigLoads);
  const m = W.loadEstimate(bigLoads);
  eq({ totalVA: m.totalVA, connectedA: m.connectedA, demandA: m.demandA }, o, "loadEstimate big mixed array");
}

// Boundary totals around the 10kVA demand knee: build arrays that land just
// below / at / above 10000 VA and confirm the 220.83 knee matches.
function loadsForVA(targetVA) {
  // hvac=3500 chunks + appl=1000 + light=120 to fine-tune
  const arr = [];
  let rem = targetVA;
  while (rem >= 3500) {
    arr.push({ kind: "hvac" });
    rem -= 3500;
  }
  while (rem >= 1000) {
    arr.push({ kind: "appl" });
    rem -= 1000;
  }
  while (rem >= 120) {
    arr.push({ kind: "light" });
    rem -= 120;
  }
  return arr;
}
[9000, 9999, 10000, 10001, 12000, 30000, 60000].forEach((t) => {
  const loads = loadsForVA(t);
  const o = loadEstimateOracle(loads);
  const m = W.loadEstimate(loads);
  eq({ totalVA: m.totalVA, connectedA: m.connectedA, demandA: m.demandA }, o, "loadEstimate knee ~" + t);
});

// Fuzz 3000 random load arrays.
for (let n = 0; n < 3000; n++) {
  const len = ri(25);
  const loads = [];
  for (let i = 0; i < len; i++) {
    const useName = rnd() < 0.5;
    loads.push(useName ? { load: NAMES[ri(NAMES.length - 1)], kind: KINDS[ri(KINDS.length - 1)] } : { kind: KINDS[ri(KINDS.length - 1)] });
  }
  const o = loadEstimateOracle(loads);
  const m = W.loadEstimate(loads);
  eq({ totalVA: m.totalVA, connectedA: m.connectedA, demandA: m.demandA }, o, "loadEstimate fuzz #" + n);
}

/* =====================================================================
 * NEW helpers — sanity (no inline oracle; assert documented behavior)
 * ===================================================================== */
// spacingCheck: a 20 ft wall with receptacles at 4 and 16 ft -> compliant
// (start 4<=6, between 12<=12, end 4<=6). Move them to 8 and 8 -> start/end 8>6 fail.
{
  const wall = [{ x1: 0, y1: 0, x2: 20, y2: 0, label: "south" }];
  const good = W.spacingCheck([{ x: 4, y: 0 }, { x: 16, y: 0 }], wall);
  eq(good.ok, true, "spacingCheck compliant 4/16 on 20ft");
  const bad = W.spacingCheck([{ x: 8, y: 0 }], wall);
  eq(bad.ok, false, "spacingCheck single recep on 20ft -> end gaps violate");
  const empty = W.spacingCheck([], wall);
  eq(empty.violations.some((v) => v.type === "no-receptacle"), true, "spacingCheck empty wall flagged");
  const tiny = W.spacingCheck([], [{ x1: 0, y1: 0, x2: 1.5, y2: 0 }]);
  eq(tiny.ok, true, "spacingCheck <2ft wall exempt");
}
// bom: counts by layer+type, total, byFloor.
{
  const items = [
    { type: "outlet", layer: "power", floor: "basement" },
    { type: "outlet", layer: "power", floor: "first" },
    { type: "can", layer: "light", floor: "basement" },
  ];
  const b = W.bom(items);
  eq(b.total, 3, "bom total");
  eq(b.byFloor, { basement: 2, first: 1 }, "bom byFloor");
  eq(
    b.byType.find((t) => t.type === "outlet").count,
    2,
    "bom outlet count"
  );
}
// parseHash
eq(W.parseHash("#circuit=4+6"), { kind: "circuit", id: "4+6" }, "parseHash circuit preserves + (fragment, not query)");
eq(W.parseHash("#circuit=8+10"), { kind: "circuit", id: "8+10" }, "parseHash circuit 8+10");
eq(W.parseHash("#circuit=12.1"), { kind: "circuit", id: "12.1" }, "parseHash circuit dotted");
eq(W.parseHash("#part6"), { kind: "anchor", id: "part6" }, "parseHash anchor");
eq(W.parseHash(""), null, "parseHash empty");

console.log("\n==== regression: " + pass + " passed, " + fail + " failed ====");
process.exit(fail ? 1 : 0);
