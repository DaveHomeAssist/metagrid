import RoomPlan
import SwiftUI

@main
struct HardingScanBridgeApp: App {
    var body: some Scene {
        WindowGroup {
            ScanBridgeView()
        }
    }
}

struct ScanBridgeView: View {
    @StateObject private var model = ScanBridgeModel()

    var body: some View {
        ZStack(alignment: .top) {
            RoomCaptureRepresentable(model: model)
                .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("56 Harding Scan")
                            .font(.headline)
                        Text(model.statusText)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Button(model.isScanning ? "Stop" : "Start") {
                        model.isScanning ? model.stop() : model.start()
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(!RoomCaptureSession.isSupported)
                }

                Picker("Floor", selection: $model.floor) {
                    Text("Basement").tag("basement")
                    Text("First").tag("first")
                }
                .pickerStyle(.segmented)

                Button("Export scan.v1 JSON") {
                    model.exportScanV1()
                }
                .buttonStyle(.bordered)
                .disabled(!model.canExport || !RoomCaptureSession.isSupported)
            }
            .padding(16)
            .background(.regularMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .padding()
        }
        .sheet(item: $model.exportedFile) { exported in
            ScanShareSheet(url: exported.url)
        }
        .onAppear {
            model.checkSupport()
        }
    }
}
