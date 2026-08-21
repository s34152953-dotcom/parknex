"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import dynamic from "next/dynamic";
import { LogOut, Navigation, Car, MapPin } from "lucide-react";
import { signOut } from "next-auth/react";

// Dynamically load the Leaflet map because it accesses window
const CustomerMap = dynamic(() => import("@/components/CustomerMap"), { ssr: false });

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Wait for session
  if (status === "loading") return <div className="p-8 text-center">Loading...</div>;
  if (!session) {
    if (typeof window !== "undefined") router.push("/customer/login");
    return null;
  }

  const user = useQuery(api.users.getUser, { email: session.user?.email || "" });

  if (user === undefined) return <div className="p-8 text-center">Loading user data...</div>;

  return (
    <div className="min-h-screen bg-[#FBF8F3] pb-12">
      {/* Header */}
      <header className="bg-white border-b border-[#EAE3D9] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1C1917] text-white flex items-center justify-center font-bold tracking-tighter text-sm">PX</div>
          <span className="font-extrabold tracking-tight text-[#1C1917]">PARKNEX</span>
        </div>
        <button onClick={() => signOut()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#FAF7F2] text-[#78716C] transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <main className="max-w-[800px] mx-auto p-6 flex flex-col gap-8 mt-6">
        
        {/* Welcome Banner */}
        <section className="bg-white rounded-3xl p-8 border border-[#EAE3D9] shadow-sm flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#1C1917]">Welcome back, {session.user?.name?.split(' ')[0]}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-[#FAF7F2] text-[#57534E] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#E2D9CC] flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5" />
              {user?.vehicleNumber || "No Vehicle Registered"}
            </span>
            {!user?.vehicleNumber && (
              <button onClick={() => router.push("/customer/register-vehicle")} className="text-xs font-bold text-[#D84A2B] hover:underline">
                Register Vehicle
              </button>
            )}
          </div>
        </section>

        {/* Live GPS Map */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-[#1C1917] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#D84A2B]" />
              Live Navigation
            </h2>
            <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full uppercase tracking-wider">GPS Active</span>
          </div>
          <CustomerMap />
        </section>
        
      </main>
    </div>
  );
}
