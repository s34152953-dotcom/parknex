export interface Landmark {
  id: string;
  name: string;
  description: string;
  floor: string;
  position: [number, number, number];
}

export const LANDMARKS: Landmark[] = [
  {
    id: "main_lobby",
    name: "Main Parking Lobby",
    description: "Central floor reception & security kiosk",
    floor: "B2",
    position: [0, 0.1, 12],
  },
  {
    id: "mall_entrance",
    name: "Mall Entrance Gate",
    description: "Pedestrian sliding glass doors into mall",
    floor: "B2",
    position: [0, 0.1, 15],
  },
  {
    id: "lift",
    name: "Elevator Lobby",
    description: "West high-speed passenger elevators",
    floor: "B2",
    position: [-8, 0.1, 12],
  },
  {
    id: "escalator",
    name: "Central Escalator",
    description: "East escalator ascending to Ground Level",
    floor: "B2",
    position: [8, 0.1, 12],
  },
];

interface GraphNode {
  id: string;
  x: number;
  y: number;
  z: number;
  neighbors: { id: string; distance: number }[];
}

// Coordinate scale: 1 unit ~ 2.5 meters
const NODES_DATA: Record<string, { x: number; y: number; z: number; connections: string[] }> = {
  // Landmarks
  "mall_entrance": { x: 0, y: 0.12, z: 15, connections: ["main_lobby"] },
  "main_lobby": { x: 0, y: 0.12, z: 12, connections: ["mall_entrance", "corridor_mid", "lift_junction", "escalator_junction"] },
  "lift": { x: -8, y: 0.12, z: 12, connections: ["lift_junction"] },
  "lift_junction": { x: -4, y: 0.12, z: 12, connections: ["lift", "main_lobby", "aisle_a_junction"] },
  "escalator": { x: 8, y: 0.12, z: 12, connections: ["escalator_junction"] },
  "escalator_junction": { x: 4, y: 0.12, z: 12, connections: ["escalator", "main_lobby", "aisle_b_junction"] },

  // Central Corridor
  "corridor_mid": { x: 0, y: 0.12, z: 7, connections: ["main_lobby", "zone_b_cross", "aisle_a_junction", "aisle_b_junction"] },
  "zone_b_cross": { x: 0, y: 0.12, z: 0, connections: ["corridor_mid", "zone_a_cross", "slot_b03", "lane_b_left", "lane_b_right"] },
  "zone_a_cross": { x: 0, y: 0.12, z: -8, connections: ["zone_b_cross", "slot_a03", "lane_a_left", "lane_a_right"] },

  // Aisle A (Zone A / Lane A)
  "aisle_a_junction": { x: -4, y: 0.12, z: 7, connections: ["corridor_mid", "lift_junction", "lane_a_left", "lane_b_left"] },
  "lane_a_left": { x: -3, y: 0.12, z: -8, connections: ["aisle_a_junction", "zone_a_cross", "slot_a02", "lane_a_far_left"] },
  "lane_a_far_left": { x: -6, y: 0.12, z: -8, connections: ["lane_a_left", "slot_a01"] },
  "lane_a_right": { x: 3, y: 0.12, z: -8, connections: ["zone_a_cross", "slot_a04", "lane_a_far_right"] },
  "lane_a_far_right": { x: 6, y: 0.12, z: -8, connections: ["lane_a_right", "slot_a05"] },

  // Aisle B (Zone B / Lane B)
  "aisle_b_junction": { x: 4, y: 0.12, z: 7, connections: ["corridor_mid", "escalator_junction", "lane_b_right"] },
  "lane_b_left": { x: -3, y: 0.12, z: 0, connections: ["zone_b_cross", "aisle_a_junction", "slot_b02", "lane_b_far_left"] },
  "lane_b_far_left": { x: -6, y: 0.12, z: 0, connections: ["lane_b_left", "slot_b01"] },
  "lane_b_right": { x: 3, y: 0.12, z: 0, connections: ["zone_b_cross", "aisle_b_junction", "slot_b04", "lane_b_far_right"] },
  "lane_b_far_right": { x: 6, y: 0.12, z: 0, connections: ["lane_b_right", "slot_b05"] },

  // Slots in Zone A
  "slot_a01": { x: -6.0, y: 0.12, z: -8.0, connections: ["lane_a_far_left"] },
  "slot_a02": { x: -3.0, y: 0.12, z: -8.0, connections: ["lane_a_left"] },
  "slot_a03": { x: 0.0, y: 0.12, z: -8.0, connections: ["zone_a_cross"] },
  "slot_a04": { x: 3.0, y: 0.12, z: -8.0, connections: ["lane_a_right"] },
  "slot_a05": { x: 6.0, y: 0.12, z: -8.0, connections: ["lane_a_far_right"] },

  // Slots in Zone B
  "slot_b01": { x: -6.0, y: 0.12, z: 0.0, connections: ["lane_b_far_left"] },
  "slot_b02": { x: -3.0, y: 0.12, z: 0.0, connections: ["lane_b_left"] },
  "slot_b03": { x: 0.0, y: 0.12, z: 0.0, connections: ["zone_b_cross"] },
  "slot_b04": { x: 3.0, y: 0.12, z: 0.0, connections: ["lane_b_right"] },
  "slot_b05": { x: 6.0, y: 0.12, z: 0.0, connections: ["lane_b_far_right"] },
};

// Slot ID mapping to node ID
export function getSlotNodeId(slotNumberOrId: string): string {
  const norm = slotNumberOrId.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (norm.includes("a01") || norm.includes("a1")) return "slot_a01";
  if (norm.includes("a02") || norm.includes("a2")) return "slot_a02";
  if (norm.includes("a03") || norm.includes("a3")) return "slot_a03";
  if (norm.includes("a04") || norm.includes("a4")) return "slot_a04";
  if (norm.includes("a05") || norm.includes("a5")) return "slot_a05";
  if (norm.includes("b01") || norm.includes("b1")) return "slot_b01";
  if (norm.includes("b02") || norm.includes("b2")) return "slot_b02";
  if (norm.includes("b03") || norm.includes("b3")) return "slot_b03";
  if (norm.includes("b04") || norm.includes("b4")) return "slot_b04";
  if (norm.includes("b05") || norm.includes("b5")) return "slot_b05";
  return "slot_b03"; // fallback
}

export interface RouteResult {
  startLandmark: Landmark;
  targetSlot: string;
  totalDistanceMeters: number;
  walkTimeMinutes: number;
  waypointCoordinates: [number, number, number][];
  directions: string[];
}

export function calculateDijkstraRoute(
  startLandmarkId: string,
  slotNumberOrId: string,
  slotDetails?: { floor?: string; zone?: string; pillar?: string; slotNumber?: string }
): RouteResult {
  const startLandmark = LANDMARKS.find((l) => l.id === startLandmarkId) || LANDMARKS[0];
  const targetNodeId = getSlotNodeId(slotNumberOrId);
  const startNodeId = startLandmark.id;

  // Build bidirectional graph
  const nodes: Record<string, GraphNode> = {};
  for (const [id, data] of Object.entries(NODES_DATA)) {
    nodes[id] = {
      id,
      x: data.x,
      y: data.y,
      z: data.z,
      neighbors: [],
    };
  }

  for (const [id, data] of Object.entries(NODES_DATA)) {
    for (const conn of data.connections) {
      if (nodes[conn]) {
        const dx = nodes[id].x - nodes[conn].x;
        const dz = nodes[id].z - nodes[conn].z;
        const dist = Math.sqrt(dx * dx + dz * dz) * 2.5; // in meters
        if (!nodes[id].neighbors.some((n) => n.id === conn)) {
          nodes[id].neighbors.push({ id: conn, distance: dist });
        }
        if (!nodes[conn].neighbors.some((n) => n.id === id)) {
          nodes[conn].neighbors.push({ id, distance: dist });
        }
      }
    }
  }

  // Dijkstra algorithm
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const id of Object.keys(nodes)) {
    distances[id] = Infinity;
    previous[id] = null;
    unvisited.add(id);
  }
  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let closestNodeId: string | null = null;
    let minDistance = Infinity;
    for (const id of unvisited) {
      if (distances[id] < minDistance) {
        minDistance = distances[id];
        closestNodeId = id;
      }
    }

    if (!closestNodeId || minDistance === Infinity) break;
    if (closestNodeId === targetNodeId) break;

    unvisited.delete(closestNodeId);

    const currentNode = nodes[closestNodeId];
    for (const neighbor of currentNode.neighbors) {
      if (!unvisited.has(neighbor.id)) continue;
      const alt = distances[closestNodeId] + neighbor.distance;
      if (alt < distances[neighbor.id]) {
        distances[neighbor.id] = alt;
        previous[neighbor.id] = closestNodeId;
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = targetNodeId;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  if (path.length === 0 || path[0] !== startNodeId) {
    // Direct line fallback
    path.length = 0;
    path.push(startNodeId, "main_lobby", "corridor_mid", targetNodeId);
  }

  const waypointCoordinates: [number, number, number][] = path.map((id) => {
    const n = nodes[id] || NODES_DATA[id] || { x: 0, y: 0.12, z: 0 };
    return [n.x, n.y, n.z];
  });

  const totalDistanceMeters = Math.round(
    distances[targetNodeId] && isFinite(distances[targetNodeId])
      ? distances[targetNodeId]
      : 36
  );
  const walkTimeMinutes = Math.max(1, Math.round((totalDistanceMeters / 60) * 10) / 10);

  const zone = slotDetails?.zone || (targetNodeId.includes("a") ? "Zone A" : "Zone B");
  const pillar = slotDetails?.pillar || (targetNodeId.includes("a") ? "Pillar 06" : "Pillar 18");
  const slotNumber = slotDetails?.slotNumber || slotNumberOrId;
  const floor = slotDetails?.floor || "B2";

  const directions: string[] = [
    `Start at ${startLandmark.name} on Floor ${floor}`,
    `Proceed along Main Driving Lane corridor towards ${zone}`,
    `Follow marked path towards ${pillar}`,
    `Arrive at your vehicle in Slot ${slotNumber}`,
  ];

  return {
    startLandmark,
    targetSlot: slotNumber,
    totalDistanceMeters,
    walkTimeMinutes,
    waypointCoordinates,
    directions,
  };
}
