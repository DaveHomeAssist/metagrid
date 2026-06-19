import RoomPlan
import SwiftUI
import UIKit

struct ExportedScanFile: Identifiable {
    let id = UUID()
    let url: URL
}

@MainActor
final class ScanBridgeModel: ObservableObject {
    @Published var isScanning = false
    @Published var canExport = false
    @Published var floor = "basement"
    @Published var statusText = "Ready to scan"
    @Published var exportedFile: ExportedScanFile?

    fileprivate weak var controller: RoomCaptureViewController?
    private var capturedRoom: CapturedRoom?

    func checkSupport() {
        if !RoomCaptureSession.isSupported {
            statusText = "RoomPlan requires a LiDAR capable iPhone or iPad"
        }
    }

    func attach(_ controller: RoomCaptureViewController) {
        self.controller = controller
    }

    func start() {
        guard RoomCaptureSession.isSupported else {
            checkSupport()
            return
        }
        controller?.startSession()
        isScanning = true
        statusText = "Scanning"
    }

    func stop() {
        controller?.stopSession()
        isScanning = false
        statusText = "Processing scan"
    }

    func receive(_ room: CapturedRoom, processed: Bool) {
        capturedRoom = room
        canExport = !room.walls.isEmpty
        guard canExport else {
            statusText = processed ? "Processed 0 walls" : "Scanning"
            return
        }
        do {
            _ = try writeScanV1(floor: floor)
            statusText = processed ? "Processed \(room.walls.count) walls · scan.v1 saved" : "Detected \(room.walls.count) walls · scan.v1 saved"
        } catch {
            statusText = "Save failed: \(error.localizedDescription)"
        }
    }

    func fail(_ error: Error) {
        statusText = error.localizedDescription
        isScanning = false
    }

    func exportScanV1() {
        do {
            let url = try writeScanV1(floor: floor)
            exportedFile = ExportedScanFile(url: url)
            statusText = "scan.v1 ready"
        } catch {
            fail(error)
        }
    }

    private func writeScanV1(floor: String) throws -> URL {
        guard let capturedRoom else {
            statusText = "No scan available"
            throw ScanBridgeExportError.noScanAvailable
        }

        let data = try ScanV1Exporter.encode(room: capturedRoom, floor: floor)
        let documents = try FileManager.default.url(
            for: .documentDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )
        let url = documents
            .appendingPathComponent("56-harding-roomplan-\(floor).scan.v1.json")
        try data.write(to: url, options: .atomic)
        return url
    }
}

enum ScanBridgeExportError: LocalizedError {
    case noScanAvailable

    var errorDescription: String? {
        switch self {
        case .noScanAvailable:
            return "No scan available"
        }
    }
}

struct RoomCaptureRepresentable: UIViewControllerRepresentable {
    @ObservedObject var model: ScanBridgeModel

    func makeUIViewController(context: Context) -> RoomCaptureViewController {
        let controller = RoomCaptureViewController()
        controller.model = model
        model.attach(controller)
        return controller
    }

    func updateUIViewController(_ uiViewController: RoomCaptureViewController, context: Context) {}
}

final class RoomCaptureViewController: UIViewController {
    fileprivate weak var model: ScanBridgeModel?

    private let captureView = RoomCaptureView(frame: .zero)
    private let configuration = RoomCaptureSession.Configuration()

    override func viewDidLoad() {
        super.viewDidLoad()
        captureView.translatesAutoresizingMaskIntoConstraints = false
        captureView.delegate = self
        captureView.captureSession.delegate = self

        view.addSubview(captureView)
        NSLayoutConstraint.activate([
            captureView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            captureView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            captureView.topAnchor.constraint(equalTo: view.topAnchor),
            captureView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
    }

    func startSession() {
        captureView.captureSession.run(configuration: configuration)
    }

    func stopSession() {
        captureView.captureSession.stop()
    }
}

extension RoomCaptureViewController: RoomCaptureViewDelegate {
    func captureView(shouldPresent roomDataForProcessing: CapturedRoomData, error: Error?) -> Bool {
        if let error {
            Task { @MainActor in model?.fail(error) }
            return false
        }
        return true
    }

    func captureView(didPresent processedResult: CapturedRoom, error: Error?) {
        Task { @MainActor in
            if let error {
                model?.fail(error)
            } else {
                model?.receive(processedResult, processed: true)
            }
        }
    }
}

extension RoomCaptureViewController: RoomCaptureSessionDelegate {
    func captureSession(_ session: RoomCaptureSession, didUpdate room: CapturedRoom) {
        Task { @MainActor in model?.receive(room, processed: false) }
    }

    func captureSession(_ session: RoomCaptureSession, didEndWith data: CapturedRoomData, error: Error?) {
        Task { @MainActor in
            if let error {
                model?.fail(error)
            } else {
                model?.statusText = "Processing scan"
            }
        }
    }
}

struct ScanShareSheet: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: [url], applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
