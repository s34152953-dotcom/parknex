"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import {
  LogOut,
  Car,
  MapPin,
  Clock,
  QrCode,
  CheckCircle2,
  ChevronRight,
  Navigation,
  Plus,
  Compass,
} from "lucide-react";
import Link from "next/link";
import ParknexLogo from "@/components/ui/ParknexLogo";

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
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#050507] text-[#F5F7FA] pb-20 selection:bg-[#D84A2B]/20 selection:text-[#D84A2B]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#050507]/85 backdrop-blur-md border-b border-white/[0.08] px-5 sm:px-8 py-4">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <Link href="/">
            <ParknexLogo size="md" variant="dark" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-white/50 hidden sm:block">
              {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 text-[12.5px] font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container (max-w-[1000px]) ── */}
      <main className="max-w-[1000px] mx-auto px-5 sm:px-8 pt-10 flex flex-col gap-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="text-[11.5px] font-bold text-[#D84A2B] uppercase tracking-wider mb-1">
              Customer Parking Hub
            </div>
            <h1 className="text-[28px] sm:text-[34px] font-extrabold text-white tracking-tight">
              Hello, {session.user?.name?.split(" ")[0] || "Driver"}
            </h1>
          </div>
          {vehicleNumber && (
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 self-start sm:self-center">
              <Car className="w-4 h-4 text-[#D84A2B]" />
              <span className="text-[12px] text-white/50">Vehicle:</span>
              <span className="font-mono text-[14px] font-bold text-white tracking-wider">{vehicleNumber}</span>
            </div>
          )}
        </div>

        {/* Vehicle Registration (If None) */}
        {user !== undefined && !vehicleNumber && (
          <div className="bg-[#10151D] border border-white/[0.08] rounded-3xl p-7 sm:p-9 shadow-xl">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-[#D84A2B]/15 flex items-center justify-center">
                <Car className="w-5 h-5 text-[#D84A2B]" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-white">Register Your Vehicle Plate</h2>
                <p className="text-[13px] text-white/50">Your active parking assignments will link here automatically</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-[500px] mt-4">
              <input
                type="text"
                placeholder="e.g. AA 00 BB 0000"
                value={vehicleInput}
                onChange={(e) => setVehicleInput(e.target.value.toUpperCase())}
                className="flex-1 h-12 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/25 text-[14px] font-mono tracking-wider focus:outline-none focus:border-[#D84A2B]"
              />
              <button
                onClick={handleSaveVehicle}
                disabled={saving || !vehicleInput.trim()}
                className="h-12 px-6 rounded-xl bg-[#D84A2B] text-white text-[14px] font-bold hover:bg-[#C23E21] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Register Plate</span>
              </button>
            </div>
            {saved && <p className="text-[12.5px] text-emerald-400 font-medium mt-3">Vehicle registered successfully!</p>}
          </div>
        )}

        {/* ── Active Parking Session (Strongest Visual Element) ── */}
        {vehicleNumber && (
          <section>
            {activeBooking === undefined && (
              <div className="bg-[#10151D] border border-white/10 rounded-3xl p-8 animate-pulse h-48" />
            )}

            {activeBooking === null && (
              <div className="bg-[#10151D] border border-white/[0.08] rounded-3xl p-10 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4 text-white/30">
                  <MapPin className="w-7 h-7" />
                </div>
                <h3 className="text-[18px] font-bold text-white">No Active Parking Session</h3>
                <p className="text-[13.5px] text-white/40 mt-1.5 max-w-[420px] leading-relaxed">
                  When you arrive at the parking gate, the operator will assign your slot to vehicle{" "}
                  <span className="font-mono text-white/80 font-bold">{vehicleNumber}</span>. Your live navigation will appear here.
                </p>
              </div>
            )}

            {activeBooking && (
              <div className="bg-[#10151D] border border-[#D84A2B]/40 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 flex flex-col gap-6 relative overflow-hidden">
                {/* Accent glow */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#D84A2B]/10 blur-[90px] pointer-events-none" />

                <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11.5px] font-bold uppercase tracking-wider mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live Parking Session</span>
                    </div>
                    <div className="text-[36px] sm:text-[46px] font-black text-white tracking-tight leading-none">
                      Level {activeBooking.slotDetails?.floor} · <span className="text-[#D84A2B]">{activeBooking.slotDetails?.slotNumber}</span>
                    </div>
                    <div className="text-[15px] text-white/60 mt-2 font-medium">
                      {activeBooking.slotDetails?.zone} · {activeBooking.slotDetails?.pillar} · {activeBooking.mallName}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[13.5px] text-white/50 bg-white/[0.04] px-4 py-2 rounded-xl border border-white/10 self-start">
                    <Clock className="w-4 h-4 text-[#D84A2B]" />
                    <span>Duration: {formatDuration(activeBooking.entryTime)}</span>
                  </div>
                </div>

                {/* Walking Directions */}
                {activeBooking.slotDetails?.walkingDirections && activeBooking.slotDetails.walkingDirections.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative z-10">
                    <div className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-[#D84A2B]" />
                      <span>Walking Directions to Space</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {activeBooking.slotDetails.walkingDirections.map((step: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 text-[14px] text-white/80">
                          <span className="w-5 h-5 rounded-full bg-[#D84A2B]/20 text-[#D84A2B] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exit QR Action */}
                <div className="pt-2 relative z-10">
                  <Link
                    href={`/customer/${activeBooking.customerAccessToken}`}
                    className="flex items-center justify-center gap-2.5 h-13 rounded-2xl bg-[#D84A2B] text-white font-bold text-[14.5px] hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-lg shadow-[#D84A2B]/20"
                  >
                    <QrCode className="w-5 h-5" />
                    <span>Open Digital Exit Pass</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Parking History ── */}
        {history && history.length > 0 && (
          <section className="pt-4">
            <h2 className="text-[18px] font-bold text-white mb-4">Past Parking History</h2>
            <div className="flex flex-col gap-2.5">
              {history.map((record: any) => (
                <div
                  key={record._id}
                  className="bg-[#10151D] border border-white/[0.06] rounded-2xl px-6 py-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-[15px] font-bold text-white">
                      Slot {record.slotNumber || record.slotId}
                    </div>
                    <div className="text-[12.5px] text-white/40 mt-0.5">
                      {new Date(record.entryTime).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <span
                    className={`text-[11.5px] font-bold px-3 py-1 rounded-full ${
                      record.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
