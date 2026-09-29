import React from "react";
import QuantumOptimizerDashboard from "@/components/quantum/QuantumOptimizerDashboard";

export const metadata = {
  title: "Quantum Annealing Optimizer | PARKNEX Q",
  description: "QUBO-based combinatorial optimization engine for Expo vehicle routing and EV fleet dispatch.",
};

export default function QuantumAdminPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
      <QuantumOptimizerDashboard />
    </div>
  );
}
