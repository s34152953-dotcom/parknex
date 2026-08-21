"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
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
  Loader2,
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

  const userEmail = session?.user?.email || "";
  const user = useQuery(api.users.getUser, userEmail ? { email: userEmail } : "skip");
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/customer/login");
    }
  }, [status, router]);

  const handleSaveVehicle = async () => {
    if (!vehicleInput.trim() || !userEmail) return;
    setSaving(true);
    try {
      await upsertUser({
        email: userEmail,
        name: session?.user?.name || userEmail,
        vehicleNumber: vehicleInput.trim().toUpperCase(),
      });
      setSaved(true);
    } catch (err) {
      console.error("Failed to save vehicle:", err);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-[100dvh] bg-[#050507] flex items-center justify-center w-full">
        <Loader2 className="w-8 h-8 text-[#D84A2B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#050507] text-[#F5F7FA] selection:bg-[#D84A2B]/20 selection:text-[#D84A2B] box-border w-full flex flex-col pb-[48px]">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#050507]/90 backdrop-blur-md border-b border-white/[0.08] w-full">
        <div className="w-full mx-auto px-[20px] h-[64px] sm:h-[72px] flex items-center justify-between">
          <Link href="/" className="group flex items-center transition-transform hover:opacity-90 shrink-0">
            <ParknexLogo size="md" variant="dark" />
          </Link>
          <div className="flex items-center gap-[12px]">
            <span className="text-[14px] text-white/50 hidden sm:block truncate max-w-[150px]">
              {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-[8px] px-[16px] h-[40px] rounded-xl border border-white/15 text-[14px] font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="w-full flex-1 pt-[24px]">
        {/* Welcome Section */}
        <div className="w-full px-[20px] max-w-[1000px] mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-[16px] mb-[32px]">
          <div>
            <div className="text-[12px] font-bold text-[#D84A2B] uppercase tracking-wider mb-[8px]">
              Customer Parking Hub
            </div>
            <h1 className="text-[36px] sm:text-[42px] font-black text-white tracking-tight leading-[1.1] break-words">
              Hello, {session.user?.name || "Driver"}
            </h1>
          </div>
          {vehicleNumber && (
            <div className="flex items-center gap-[12px] px-[16px] py-[10px] rounded-xl bg-white/[0.04] border border-white/15 self-start sm:self-center shrink-0">
              <Car className="w-4 h-4 text-[#D84A2B]" />
              <span className="text-[14px] text-white/50 font-medium">Vehicle:</span>
              <span className="font-mono text-[16px] font-bold text-white tracking-wider">{vehicleNumber}</span>
            </div>
          )}
        </div>

        {/* Vehicle Registration (If None) */}
        {user !== undefined && !vehicleNumber && (
          <div className="w-[calc(100%-40px)] max-w-[1000px] mx-auto bg-[#10151D] border border-white/[0.08] rounded-3xl p-[24px] shadow-xl flex flex-col gap-[18px] mb-[24px]">
            <div className="flex items-start gap-[16px]">
              <div className="w-[48px] h-[48px] rounded-2xl bg-[#D84A2B]/15 flex items-center justify-center shrink-0">
                <Car className="w-[24px] h-[24px] text-[#D84A2B]" />
              </div>
              <div className="flex-1">
                <h2 className="text-[24px] sm:text-[28px] font-bold text-white leading-tight mb-[4px]">
                  Register Your Vehicle Plate
                </h2>
                <p className="text-[16px] text-white/50 leading-[1.5]">
                  Your active parking assignments will link here automatically.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-[8px] w-full mt-[8px]">
              <label htmlFor="vehiclePlate" className="text-[14px] font-semibold text-white/80 pl-[4px]">
                Vehicle License Plate
              </label>
              <input
                id="vehiclePlate"
                type="text"
                placeholder="e.g. AA 00 BB 0000"
                value={vehicleInput}
                onChange={(e) => setVehicleInput(e.target.value.toUpperCase())}
                className="w-full h-[56px] px-[16px] rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-white/30 text-[16px] font-mono tracking-wider focus:outline-none focus:border-[#D84A2B] transition-colors"
              />
            </div>
            
            <div className="w-full pt-[16px]">
              <button
                onClick={handleSaveVehicle}
                disabled={saving || !vehicleInput.trim()}
                className="w-full sm:w-auto h-[56px] px-[24px] rounded-xl bg-[#D84A2B] text-white text-[16px] font-bold hover:bg-[#C23E21] disabled:opacity-50 transition-all flex items-center justify-center gap-[12px] cursor-pointer shrink-0"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                <span>Register Plate</span>
              </button>
            </div>
            {saved && <p className="text-[14px] text-emerald-400 font-medium">Vehicle registered successfully!</p>}
          </div>
        )}

        {/* ── Active Parking Session ── */}
        <div className="w-[calc(100%-40px)] max-w-[1000px] mx-auto">
          {vehicleNumber && activeBooking === undefined && (
            <div className="bg-[#10151D] border border-white/10 rounded-3xl p-[24px] animate-pulse h-[200px]" />
          )}

          {vehicleNumber && activeBooking === null && (
            <div className="bg-[#10151D] border border-white/[0.08] rounded-3xl p-[24px] text-center flex flex-col items-center justify-center min-h-[200px]">
              <div className="w-[56px] h-[56px] rounded-2xl bg-white/[0.04] flex items-center justify-center mb-[16px] text-white/30">
                <MapPin className="w-[28px] h-[28px]" />
              </div>
              <h3 className="text-[22px] font-bold text-white mb-[8px]">No Active Session</h3>
              <p className="text-[16px] text-white/50 leading-[1.5] max-w-[420px]">
                When you arrive at the gate, your slot will be assigned to <span className="font-mono text-white/90 font-bold">{vehicleNumber}</span> and your navigation will appear here.
              </p>
            </div>
          )}

          {vehicleNumber && activeBooking && (
            <div className="bg-[#10151D] border border-[#D84A2B]/40 rounded-3xl p-[24px] shadow-2xl flex flex-col gap-[24px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#D84A2B]/10 blur-[90px] pointer-events-none" />

              <div className="flex flex-col gap-[16px] relative z-10">
                <div className="inline-flex items-center gap-[8px] px-[12px] py-[6px] rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] font-bold uppercase self-start">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Parking Session</span>
                </div>
                
                <div>
                  <div className="text-[42px] sm:text-[48px] font-black text-white tracking-tight leading-[1.1]">
                    Level {activeBooking.slotDetails?.floor} <br className="sm:hidden" />
                    <span className="hidden sm:inline">· </span>
                    <span className="text-[#D84A2B]">{activeBooking.slotDetails?.slotNumber}</span>
                  </div>
                  <div className="text-[16px] text-white/70 mt-[8px] font-medium">
                    {activeBooking.slotDetails?.zone} · {activeBooking.slotDetails?.pillar} · {activeBooking.mallName}
                  </div>
                </div>

                <div className="flex items-center gap-[12px] text-[14px] text-white/60 bg-white/[0.04] px-[16px] py-[12px] rounded-xl border border-white/15 self-start mt-[8px]">
                  <Clock className="w-5 h-5 text-[#D84A2B]" />
                  <span className="font-medium">Duration: {formatDuration(activeBooking.entryTime)}</span>
                </div>
              </div>

              {/* Walking Directions */}
              {activeBooking.slotDetails?.walkingDirections && activeBooking.slotDetails.walkingDirections.length > 0 && (
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-[20px] relative z-10 mt-[8px]">
                  <div className="text-[14px] font-bold text-white/50 uppercase tracking-wider mb-[16px] flex items-center gap-[12px]">
                    <Navigation className="w-5 h-5 text-[#D84A2B]" />
                    <span>Walking Directions</span>
                  </div>
                  <div className="flex flex-col gap-[16px]">
                    {activeBooking.slotDetails.walkingDirections.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-[16px] text-[16px] text-white/80 leading-[1.5]">
                        <span className="w-[24px] h-[24px] rounded-full bg-[#D84A2B]/20 text-[#D84A2B] text-[12px] font-bold flex items-center justify-center shrink-0 mt-[2px]">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exit QR Action */}
              <div className="pt-[12px] relative z-10">
                <Link
                  href={`/customer/${activeBooking.customerAccessToken}`}
                  className="flex items-center justify-center gap-[12px] w-full h-[56px] rounded-2xl bg-[#D84A2B] text-white font-bold text-[16px] hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-lg"
                >
                  <QrCode className="w-6 h-6" />
                  <span>Open Digital Exit Pass</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Parking History ── */}
        {history && history.length > 0 && (
          <div className="w-[calc(100%-40px)] max-w-[1000px] mx-auto mt-[40px]">
            <h2 className="text-[22px] font-bold text-white mb-[20px]">Past Parking History</h2>
            <div className="flex flex-col gap-[16px]">
              {history.map((record: any) => (
                <div
                  key={record._id}
                  className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-[20px] flex items-center justify-between"
                >
                  <div>
                    <div className="text-[16px] font-bold text-white mb-[4px]">
                      Slot {record.slotNumber || record.slotId}
                    </div>
                    <div className="text-[14px] text-white/50">
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
                    className={`text-[12px] font-bold px-[12px] py-[6px] rounded-full ${
                      record.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/5 text-white/50 border border-white/10"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
