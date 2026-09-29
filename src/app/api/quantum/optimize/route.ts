import { NextResponse } from "next/server";
import {
  generateExpoVenueData,
  runComparativeBenchmark,
  solveClassicalGreedy,
  solveQuantumQUBO,
  VehicleRequest,
} from "@/lib/quantum/quboOptimizer";

export async function GET() {
  // Returns default comparative benchmark for Quantum Expo 2026
  try {
    const benchmark = runComparativeBenchmark();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      venue: "Quantum Expo 2026 - Main Exhibition Pavilion",
      benchmark,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to execute quantum benchmark",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      vehicles,
      solver = "both", // "classical" | "quantum" | "both"
      sweeps = 200,
      trotterSlices = 4,
    } = body;

    const dataset = generateExpoVenueData();
    const vehicleList: VehicleRequest[] = vehicles && vehicles.length > 0 ? vehicles : dataset.sampleVehicles;

    if (solver === "classical") {
      const result = solveClassicalGreedy(vehicleList, dataset.slots);
      return NextResponse.json({ success: true, result });
    }

    if (solver === "quantum") {
      const result = solveQuantumQUBO(vehicleList, dataset.slots, { sweeps, trotterSlices });
      return NextResponse.json({ success: true, result });
    }

    // Default "both" benchmark
    const benchmark = runComparativeBenchmark(vehicleList, dataset.slots);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      benchmark,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Invalid optimization request",
      },
      { status: 400 }
    );
  }
}
