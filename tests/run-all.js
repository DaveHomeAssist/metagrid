/* Runs every Metagrid electrical-suite verification in sequence.
 * Each child exits non-zero on failure; this aggregates and exits non-zero
 * if any suite failed. Requires the jsdom devDependency (npm install). */
const { execFileSync } = require("child_process");
const path = require("path");

const SUITES = [
  ["regression.test.js", "boxFill (NEC 314.16 per-gauge) + loadEstimate (NEC 220.83) regression-equal"],
  ["t1-deeplinks.test.js", "R1/R3: module load + deep links across all three apps"],
  ["t2-bridge.test.js", "R4: two-context project bridge round-trip + cross-tab + focus re-read"],
  ["t3-touch.test.js", "R11: pointer place/drag/undo/floor/delete + mobile chrome"],
  ["roomplan-bridge.test.js", "Scanner M2: native RoomPlan bridge static scan.v1 contract"],
  ["scan-parsers.test.js", "Scanner M1: CSV/SVG/DXF parser registry + unsupported format rejection"],
  ["smoke.test.js", "vigorous end-to-end: boot integrity, app workflows, persistence reload, cross-app integration + adversarial module/store"],
];

let failed = 0;
for (const [file, desc] of SUITES) {
  process.stdout.write("\n=== " + file + " — " + desc + " ===\n");
  try {
    execFileSync(process.execPath, [path.join(__dirname, file)], { stdio: "inherit" });
  } catch (e) {
    failed++;
  }
}
process.stdout.write("\n==== suite total: " + (failed ? failed + " FAILED" : "ALL PASSED") + " ====\n");
process.exit(failed ? 1 : 0);
