"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function RegisterVehicle() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const upsertUser = useMutation(api.users.upsertUser);
  const [vehicle, setVehicle] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "loading") return <div className="p-8 text-center">Loading...</div>;
  if (!session) {
    router.push("/customer/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertUser({
        email: session.user?.email || "",
        name: session.user?.name || "",
        vehicleNumber: vehicle,
      });
      router.push("/customer/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF8F3] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(80,50,20,0.03)] border border-[#EAE3D9]">
        <h2 className="text-2xl font-bold text-[#1C1917] mb-2">Register Your Vehicle</h2>
        <p className="text-[#78716C] mb-6 text-sm">Enter your license plate so we can assign and locate your parking space.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[#57534E] uppercase mb-2">License Plate Number</label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value.toUpperCase())}
              placeholder="e.g. AA 00 BB 0000"
              required
              className="w-full h-12 px-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] focus:border-[#D84A2B] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !vehicle}
            className="w-full h-12 rounded-xl bg-[#D84A2B] text-white font-bold hover:bg-[#C23E21] transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Saving..." : "Continue to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
