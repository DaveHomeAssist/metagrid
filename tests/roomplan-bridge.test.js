/* Static checks for the native RoomPlan bridge. This does not replace a device
 * round-trip, but keeps the checked-in bridge aligned with the scan.v1 intake
 * contract until Xcode/device verification runs. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const DIR = path.join(__dirname, "..");
const ROOT = path.join(DIR, "native", "HardingScanBridge");
const APP = path.join(ROOT, "HardingScanBridge");
const project = fs.readFileSync(path.join(ROOT, "HardingScanBridge.xcodeproj", "project.pbxproj"), "utf8");
const info = fs.readFileSync(path.join(APP, "Info.plist"), "utf8");
const exporter = fs.readFileSync(path.join(APP, "ScanV1Exporter.swift"), "utf8");
const bridge = fs.readFileSync(path.join(APP, "RoomCaptureBridge.swift"), "utf8");
const app = fs.readFileSync(path.join(APP, "HardingScanBridgeApp.swift"), "utf8");
const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
const verifier = fs.readFileSync(path.join(DIR, "tests", "verify-roomplan-export.js"), "utf8");
const scheme = fs.readFileSync(path.join(ROOT, "HardingScanBridge.xcodeproj", "xcshareddata", "xcschemes", "HardingScanBridge.xcscheme"), "utf8");

for (const file of [
  "HardingScanBridgeApp.swift",
  "RoomCaptureBridge.swift",
  "ScanV1Exporter.swift",
  "Info.plist",
]) {
  assert(project.includes(file), file + " referenced by Xcode project");
}

assert(project.includes("IPHONEOS_DEPLOYMENT_TARGET = 16.0"), "RoomPlan target is iOS 16+");
assert(info.includes("NSCameraUsageDescription"), "camera usage string present");
assert(info.includes("UIFileSharingEnabled"), "file sharing exposes exported scan.v1 files");
assert(bridge.includes("import RoomPlan"), "bridge imports RoomPlan");
assert(bridge.includes("RoomCaptureView"), "bridge uses RoomCaptureView");
assert(bridge.includes("RoomCaptureSession.isSupported"), "bridge guards unsupported devices");
assert(bridge.includes("UIActivityViewController"), "handoff uses share sheet");
assert(bridge.includes("for: .documentDirectory"), "export writes durable scan.v1 files to Documents");
assert(exporter.includes('let schema = "scan.v1"'), "exporter emits scan.v1 schema");
assert(exporter.includes('source: "roomplan"'), "exporter marks source roomplan");
assert(exporter.includes('units: "m"'), "exporter uses meter units from RoomPlan");
assert(exporter.includes('"high": "field-check"'), "high RoomPlan confidence maps to field-check");
assert(exporter.includes('"medium": "low-confidence"'), "medium RoomPlan confidence maps to low-confidence");
assert(exporter.includes('"low": "low-confidence"'), "low RoomPlan confidence maps to low-confidence");
assert(!exporter.includes("export(to:"), "exporter does not emit USDZ");
assert(app.includes("Export scan.v1 JSON"), "native UI exposes scan.v1 export");
assert(app.includes("RoomCaptureSession.isSupported"), "native UI disables capture on unsupported devices");
assert(readme.includes("tests/verify-roomplan-export.js"), "README documents device round-trip verifier");
assert(verifier.includes("importScanText"), "device verifier imports through browser intake");
assert(verifier.includes("#scan-shell-layer .scan-shell-wall"), "device verifier checks rendered scan shell walls");
assert(scheme.includes('BlueprintName = "HardingScanBridge"'), "shared Xcode scheme targets HardingScanBridge");
assert(readme.includes("-scheme HardingScanBridge"), "README documents CLI build scheme");

console.log("roomplan bridge: static scan.v1 contract passed");
