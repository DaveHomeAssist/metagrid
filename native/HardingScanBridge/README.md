# Harding Scan Bridge

Native iOS/iPadOS RoomPlan bridge for the 56 Harding renovation planner.

The app captures a room with Apple's RoomPlan API and exports a `scan.v1` JSON
file into the app Documents folder and through the system share sheet. The
browser planner imports that file at `basement-planner.html#scan`; USDZ export
is intentionally outside this bridge.

## Contract

The exported document is a single `scan.v1` object:

```json
{
  "schema": "scan.v1",
  "source": "roomplan",
  "floor": "basement",
  "room": "RoomPlan capture",
  "units": "m",
  "confidence": "field-check",
  "walls": [
    { "id": "rp-wall-1", "x1": 0, "y1": 0, "x2": 2.4, "y2": 0, "height": 2.4, "confidence": "field-check" }
  ],
  "openings": [],
  "meta": {
    "project": "56 Harding Ave",
    "exporter": "HardingScanBridge",
    "roomPlanCoordinateSpace": "meters; x maps to x, -z maps to y",
    "confidenceMapping": {
      "high": "field-check",
      "medium": "low-confidence",
      "low": "low-confidence"
    }
  }
}
```

RoomPlan wall surfaces are exported as top-down line segments in meters. The web
planner already scales meter units to its schematic coordinate system.

RoomPlan confidence is machine confidence, not field verification. The bridge
therefore maps `high` to `field-check`; `medium`, `low`, and unknown confidence
map to `low-confidence`.

## Build

Requires full Xcode with the iOS SDK. Command Line Tools alone are not enough.

```bash
open native/HardingScanBridge/HardingScanBridge.xcodeproj
```

Once full Xcode is selected, the shared scheme can also be checked from CLI:

```bash
xcodebuild -project native/HardingScanBridge/HardingScanBridge.xcodeproj -scheme HardingScanBridge -destination 'generic/platform=iOS' build
```

Run on a LiDAR capable iPhone or iPad. The app uses
`RoomCaptureSession.isSupported` to disable capture when RoomPlan is unavailable.
Simulators are useful for project opening only; the capture flow requires device
hardware.

## Device round trip

After the app detects walls, it auto-saves the latest JSON in its Documents
folder as `56-harding-roomplan-<floor>.scan.v1.json`. The export button also
opens the share sheet for the same file. Copy or share the JSON file to the Mac
and run:

```bash
NODE_PATH=/tmp/metagrid-jsdom/node_modules node tests/verify-roomplan-export.js /path/to/56-harding-roomplan-basement.scan.v1.json
```

That command imports the exported file into `basement-planner.html#scan`,
checks the rendered Scan Shell wall count, confirms persistence through reload,
and confirms scans stay out of the undo state.
