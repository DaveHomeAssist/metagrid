import Foundation
import RoomPlan
import simd

enum ScanV1Exporter {
    static func encode(room: CapturedRoom, floor: String) throws -> Data {
        let scan = makeScan(room: room, floor: floor)
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        return try encoder.encode(scan)
    }

    private static func makeScan(room: CapturedRoom, floor: String) -> ScanV1Document {
        let walls = room.walls.enumerated().map { index, surface in
            makeWall(surface: surface, index: index)
        }
        let confidence = walls.contains { $0.confidence == "low-confidence" } ? "low-confidence" : "field-check"

        return ScanV1Document(
            id: "roomplan-\(UUID().uuidString.lowercased())",
            source: "roomplan",
            floor: floor,
            room: "RoomPlan capture",
            units: "m",
            confidence: confidence,
            walls: walls,
            openings: [],
            importedAt: ISO8601DateFormatter().string(from: Date()),
            meta: ScanV1Meta(
                project: "56 Harding Ave",
                exporter: "HardingScanBridge",
                roomPlanCoordinateSpace: "meters; x maps to x, -z maps to y",
                confidenceMapping: [
                    "high": "field-check",
                    "medium": "low-confidence",
                    "low": "low-confidence",
                ],
                rawWallConfidence: Dictionary(uniqueKeysWithValues: walls.map { ($0.id, $0.roomPlanConfidence) })
            )
        )
    }

    private static func makeWall(surface: CapturedRoom.Surface, index: Int) -> ScanV1Wall {
        let center = surface.transform.columns.3
        let xAxis = surface.transform.columns.0
        let halfWidth = surface.dimensions.x / 2
        let start = center - xAxis * halfWidth
        let end = center + xAxis * halfWidth
        let confidence = metagridConfidence(surface.confidence)

        return ScanV1Wall(
            id: "rp-wall-\(index + 1)",
            x1: rounded(Double(start.x)),
            y1: rounded(Double(-start.z)),
            x2: rounded(Double(end.x)),
            y2: rounded(Double(-end.z)),
            height: rounded(Double(surface.dimensions.y)),
            confidence: confidence,
            roomPlanConfidence: rawConfidence(surface.confidence)
        )
    }

    private static func metagridConfidence(_ confidence: CapturedRoom.Confidence) -> String {
        switch confidence {
        case .high:
            return "field-check"
        case .medium, .low:
            return "low-confidence"
        @unknown default:
            return "low-confidence"
        }
    }

    private static func rawConfidence(_ confidence: CapturedRoom.Confidence) -> String {
        switch confidence {
        case .high:
            return "high"
        case .medium:
            return "medium"
        case .low:
            return "low"
        @unknown default:
            return "unknown"
        }
    }

    private static func rounded(_ value: Double) -> Double {
        (value * 1_000_000).rounded() / 1_000_000
    }
}

private struct ScanV1Document: Encodable {
    let schema = "scan.v1"
    let id: String
    let source: String
    let floor: String
    let room: String
    let units: String
    let confidence: String
    let walls: [ScanV1Wall]
    let openings: [String]
    let importedAt: String
    let meta: ScanV1Meta
}

private struct ScanV1Wall: Encodable {
    let id: String
    let x1: Double
    let y1: Double
    let x2: Double
    let y2: Double
    let height: Double
    let confidence: String
    let roomPlanConfidence: String

    enum CodingKeys: String, CodingKey {
        case id
        case x1
        case y1
        case x2
        case y2
        case height
        case confidence
    }
}

private struct ScanV1Meta: Encodable {
    let project: String
    let exporter: String
    let roomPlanCoordinateSpace: String
    let confidenceMapping: [String: String]
    let rawWallConfidence: [String: String]
}
