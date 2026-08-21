"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
  LogOut, Car, MapPin, Clock, QrCode, CheckCircle2, ChevronRight, Navigation, Plus,
} from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

const CustomerMap = dynamic(() => import("@/components/CustomerMap"), { ssr: false });

function formatDuration(entryTime: string): string {
  const diff = Date.now() - new Date(entryTime).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vehicleInput, setVehicleInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#D84A2B] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/customer/login");
    return null;
  }

  const user = useQuery(api.users.getUser, { email: session.user?.email || "" });
  const upsertUser = useMutation(api.users.upsertUser);

  const vehicleNumber = user?.vehicleNumber || "";
  const activeBooking = useQuery(
    api.bookings.getActiveBookingByVehicle,
    vehicleNumber ? { vehicleNumber } : "skip"
  );
  const history = useQuery(
    api.bookings.getHistoryByVehicle,
    vehicleNumber ? { vehicleNumber } : "skip"
  );

  const handleSaveVehicle = async () => {
    if (!vehicleInput.trim()) return;
    setSaving(true);
    await upsertUser({
      email: session.user?.email || "",
      name: session.user?.name || "",
      vehicleNumber: vehicleInput.trim().toUpperCase(),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-16">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D84A2B] flex items-center justify-center font-black text-white text-[11px] tracking-tight">PX</div>
          <span className="font-extrabold text-white tracking-tight">PARKNEX</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-white/40 hidden sm:block">{session.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 text-white/40 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-[680px] mx-auto px-5 pt-8 flex flex-col gap-6">
        {/* Greeting */}
        <div>
          <h1 className="text-[26px] font-black text-white tracking-tight">
            Hello, {session.user?.name?.split(" ")[0]}
          </h1>
          <p className="text-white/40 text-[14px] mt-1">Your parking dashboard</p>
        </div>

        {/* Vehicle Registration Section */}
        {user !== undefined && !vehicleNumber && (
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#D84A2B]/15 flex items-center justify-center">
                <Car className="w-5 h-5 text-[#D84A2B]" />
              </div>
              <div>
                <div className="text-[15px] font-bold text-white">Register Your Vehicle</div>
                <div className="text-[12px] text-white/40">So we can show your parking slot automatically</div>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. AA 00 BB 0000"
                value={vehicleInput}
                onChange={(e) => setVehicleInput(e.target.value.toUpperCase())}
                className="flex-1 h-11 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/20 text-[14px] font-mono focus:outline-none focus:border-[#D84A2B]/50"
              />
              <button
                onClick={handleSaveVehicle}
                disabled={saving || !vehicleInput.trim()}
                className="h-11 px-5 rounded-xl bg-[#D84A2B] text-white text-[13.5px] font-bold hover:bg-[#C23E21] disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
            {saved && <p className="text-[12px] text-green-400 mt-2">Vehicle registered!</p>}
          </div>
        )}

        {/* Active Booking Card */}
        {vehicleNumber && (
          <>
            {activeBooking === undefined && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 animate-pulse h-40" />
            )}

            {activeBooking === null && (
              <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-center">
                <MapPin className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <div className="text-[15px] font-bold text-white/60">No active parking session</div>
                <div className="text-[13px] text-white/30 mt-1">
                  Tell the operator your plate{" "}
                  <span className="font-mono text-white/50">{vehicleNumber}</span> when you arrive.
                </div>
              </div>
            )}

            {activeBooking && (
              <div className="bg-gradient-to-br from-[#D84A2B]/15 to-transparent border border-[#D84A2B]/30 rounded-3xl p-6 flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-[#F87171] uppercase tracking-widest mb-1">Active Session</div>
                    <div className="text-[32px] font-black text-white tracking-tight">
                      {activeBooking.slotDetails?.floor} · {activeBooking.slotDetails?.slotNumber}
                    </div>
                    <div className="text-[14px] text-white/50 mt-1">
                      {activeBooking.slotDetails?.zone} · {activeBooking.slotDetails?.pillar}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-[12px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    PARKED
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[13px] text-white/40">
                  <Clock className="w-4 h-4" />
                  Parked for {formatDuration(activeBooking.entryTime)} · {activeBooking.mallName}
                </div>

                {activeBooking.slotDetails?.walkingDirections && activeBooking.slotDetails.walkingDirections.length > 0 && (
                  <div className="bg-white/[0.04] rounded-2xl p-4">
                    <div className="text-[11px] font-bold text-white/30 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Navigation className="w-3.5 h-3.5" /> Walking Directions
                    </div>
                    {activeBooking.slotDetails?.walkingDirections?.map((step: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
                        <div className="w-5 h-5 rounded-full bg-[#D84A2B]/20 text-[#D84A2B] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                        <div className="text-[13.5px] text-white/70">{step}</div>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href={`/customer/${activeBooking.customerAccessToken}`}
                  className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#D84A2B] text-white font-bold text-[14px] hover:bg-[#C23E21] transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  View Exit Pass
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        )}

        {/* Vehicle Display (already registered) */}
        {vehicleNumber && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="w-4 h-4 text-white/30" />
              <span className="text-[13px] text-white/50">Registered vehicle</span>
            </div>
            <span className="font-mono text-[14px] font-bold text-white">{vehicleNumber}</span>
          </div>
        )}

        {/* History */}
        {history && history.length > 0 && (
          <div>
            <h2 className="text-[16px] font-bold text-white mb-3">Parking History</h2>
            <div className="flex flex-col gap-2">
              {history.map((b: any) => (
                <Link
                  key={b._id}
                  href={b.status === "ACTIVE" ? `/customer/${b.customerAccessToken}` : "#"}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4 flex items-center justify-between hover:border-white/10 transition-colors"
                >
                  <div>
                    <div className="text-[14px] font-semibold text-white">{b.slotNumber || b.slotId}</div>
                    <div className="text-[12px] text-white/30 mt-0.5">
                      {new Date(b.entryTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    b.status === "ACTIVE" ? "bg-green-500/15 text-green-400" :
                    b.status === "COMPLETED" ? "bg-white/10 text-white/40" :
                    "bg-red-500/10 text-red-400"
                  }`}>
                    {b.status}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
