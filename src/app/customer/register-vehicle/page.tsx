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

  if (status === "loading") return <div className="p-8 text-center text-[#70675F]">Loading...</div>;
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
        vehicleNumber: vehicle.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().trim(),
      });
      router.push("/customer/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-4 text-[#241F1B]">
      <div className="max-w-md w-full bg-[#FFFFFF] rounded-2xl p-8 shadow-[0_8px_24px_rgba(70,48,35,0.07)] border border-[#DED3C7]">
        <h2 className="text-2xl font-bold text-[#241F1B] mb-2">Register Your Vehicle</h2>
        <p className="text-[#70675F] mb-6 text-[14px]">Enter your license plate so we can assign and locate your parking space.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[#241F1B] uppercase mb-2">License Plate Number</label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value.toUpperCase())}
              placeholder="e.g. MH02AB1234"
              required
              className="w-full h-12 px-4 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] font-mono font-bold uppercase focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !vehicle}
            className="w-full h-12 rounded-xl bg-[#C93B2F] text-white font-bold hover:bg-[#A92E25] transition-colors disabled:opacity-50 mt-2 cursor-pointer shadow-xs"
          >
            {loading ? "Saving..." : "Continue to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
