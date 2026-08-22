"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Car, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RegisterVehicle() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userEmail = session?.user?.email || "";
  const existingUser = useQuery(api.users.getUser, userEmail ? { email: userEmail } : "skip");
  const updateVehicleMutation = useMutation(api.users.updateVehicleDetails);

  const [vehicle, setVehicle] = useState("");
  const [vehicleType, setVehicleType] = useState<"sedan" | "suv" | "hatchback" | "ev" | "motorcycle">("sedan");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColour, setVehicleColour] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (existingUser) {
      if (existingUser.vehicleNumber) setVehicle(existingUser.vehicleNumber);
      if (existingUser.vehicleType) setVehicleType(existingUser.vehicleType as any);
      if (existingUser.vehicleMake) setVehicleMake(existingUser.vehicleMake);
      if (existingUser.vehicleModel) setVehicleModel(existingUser.vehicleModel);
      if (existingUser.vehicleColour) setVehicleColour(existingUser.vehicleColour);
      if (existingUser.phoneNumber) setPhoneNumber(existingUser.phoneNumber);
    }
  }, [existingUser]);

  if (status === "loading") {
    return <div className="p-8 text-center text-[#70675F]">Loading customer session...</div>;
  }
  if (!session) {
    router.push("/customer/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlate = vehicle.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().trim();
    if (!cleanPlate) {
      setErrorMsg("Please enter a valid license plate number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await updateVehicleMutation({
        email: userEmail,
        vehicleNumber: cleanPlate,
        vehicleType,
        vehicleMake: vehicleMake.trim() || undefined,
        vehicleModel: vehicleModel.trim() || undefined,
        vehicleColour: vehicleColour.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      router.push("/customer/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update vehicle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-4 text-[#241F1B] selection:bg-[#F9E3DE] selection:text-[#C93B2F]">
      <div className="max-w-lg w-full bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(70,48,35,0.07)] border border-[#DED3C7] flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-[#DED3C7] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#241F1B]">
                {existingUser?.vehicleNumber ? "Edit Vehicle Details" : "Register Your Vehicle"}
              </h2>
              <p className="text-[#70675F] text-[13px] mt-0.5">
                Manage your vehicle profile and parking assignment preferences
              </p>
            </div>
          </div>
          <Link
            href="/customer/dashboard"
            className="text-[12.5px] font-bold text-[#70675F] hover:text-[#241F1B] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#C93B2F]/10 border border-[#C93B2F]/30 text-[#C93B2F] text-[13px] font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-bold text-[#241F1B] mb-1.5">
              License Plate Number <span className="text-[#C93B2F]">*</span>
            </label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value.toUpperCase())}
              placeholder="e.g. MH02AB1234"
              required
              className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] font-mono text-[14px] font-bold uppercase focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#241F1B] mb-1.5">Vehicle Class / Type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as any)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] text-[13.5px] font-medium focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none"
            >
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="hatchback">Hatchback</option>
              <option value="ev">Electric Vehicle (EV)</option>
              <option value="motorcycle">Motorcycle / Two-Wheeler</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-[#241F1B] mb-1.5">Make / Brand</label>
              <input
                type="text"
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                placeholder="e.g. Tata, Hyundai"
                className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] text-[13.5px] focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#241F1B] mb-1.5">Model</label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. Nexon EV, Creta"
                className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] text-[13.5px] focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-[#241F1B] mb-1.5">Vehicle Colour</label>
              <input
                type="text"
                value={vehicleColour}
                onChange={(e) => setVehicleColour(e.target.value)}
                placeholder="e.g. Silver, White, Black"
                className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] text-[13.5px] focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#241F1B] mb-1.5">Contact Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] font-mono text-[13.5px] focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !vehicle.trim()}
            className="w-full h-11 rounded-xl bg-[#C93B2F] text-white font-bold text-[14px] hover:bg-[#A92E25] transition-colors disabled:opacity-50 mt-2 cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Vehicle...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{existingUser?.vehicleNumber ? "Update Vehicle Details" : "Save & Continue"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
