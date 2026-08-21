"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Car, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function VehicleRegistrationPage() {
  const router = useRouter();
  const supabase = createClient();

  const [regNumber, setRegNumber] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [vehicleType, setVehicleType] = useState("suv");
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber || !manufacturer || !model) {
      setErrorMsg("Please fill in registration number, manufacturer, and model.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        const { error } = await supabase.from("vehicles").insert({
          user_id: userData.user.id,
          reg_number: regNumber.toUpperCase(),
          manufacturer,
          model,
          color,
          vehicle_type: vehicleType,
          nickname,
          is_default: true,
        });

        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/my-car");
      }, 1000);
    } catch (err: any) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/my-car");
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] w-full p-6 sm:p-10 lg:p-12 bg-[#FBF8F3] flex flex-col items-center justify-start">
      <div className="w-full max-w-[540px]">
        {/* Back Link */}
        <Link
          href="/my-car"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Vehicles
        </Link>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-2xl border border-[rgba(80,60,40,0.08)] rounded-3xl p-7 sm:p-9 shadow-[0_12px_40px_rgba(80,50,20,0.04)]">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B] mb-5 shadow-xs">
            <Car className="w-6 h-6" strokeWidth={1.75} />
          </div>

          <h1 className="text-[24px] font-bold text-[#1C1917] tracking-tight">Register New Vehicle</h1>
          <p className="text-[13.5px] text-[#78716C] mt-1 mb-7">
            Link your vehicle plate to enable automated entry camera detection
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
            {/* Plate */}
            <div>
              <label className="block text-[12px] font-bold text-[#57534E] uppercase mb-2">
                License Plate / Registration *
              </label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. KA-01-MJ-2024"
                className="w-full h-12 px-4 rounded-xl bg-white border border-[#E2D9CC] text-[#1C1917] placeholder:text-[#A8A29E] text-[14px] uppercase tracking-wider focus:border-[#D84A2B] focus:ring-2 focus:ring-[#D84A2B]/20 focus:outline-none transition-all"
                required
              />
            </div>

            {/* Manufacturer & Model */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#57534E] uppercase mb-2">
                  Make / Brand *
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g. Hyundai, Tesla"
                  className="w-full h-12 px-4 rounded-xl bg-white border border-[#E2D9CC] text-[#1C1917] placeholder:text-[#A8A29E] text-[14px] focus:border-[#D84A2B] focus:ring-2 focus:ring-[#D84A2B]/20 focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#57534E] uppercase mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Creta, Model Y"
                  className="w-full h-12 px-4 rounded-xl bg-white border border-[#E2D9CC] text-[#1C1917] placeholder:text-[#A8A29E] text-[14px] focus:border-[#D84A2B] focus:ring-2 focus:ring-[#D84A2B]/20 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Color & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#57534E] uppercase mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Black, Deep Blue"
                  className="w-full h-12 px-4 rounded-xl bg-white border border-[#E2D9CC] text-[#1C1917] placeholder:text-[#A8A29E] text-[14px] focus:border-[#D84A2B] focus:ring-2 focus:ring-[#D84A2B]/20 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#57534E] uppercase mb-2">
                  Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-white border border-[#E2D9CC] text-[#1C1917] text-[14px] focus:border-[#D84A2B] focus:ring-2 focus:ring-[#D84A2B]/20 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="ev">Electric (EV)</option>
                  <option value="coupe">Coupe</option>
                </select>
              </div>
            </div>

            {errorMsg && (
              <p className="text-[13px] text-[#EF4444] font-semibold">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || success}
              className={`w-full min-h-[50px] rounded-xl text-[14.5px] font-semibold flex items-center justify-center gap-2 mt-3 shadow-md transition-all cursor-pointer ${
                success
                  ? "bg-[#10B981] text-white shadow-[#10B981]/20"
                  : "bg-[#D84A2B] text-white hover:bg-[#C23E21] active:scale-[0.98] shadow-[#D84A2B]/20"
              }`}
            >
              {success ? (
                <>
                  <Check className="w-5 h-5" />
                  Vehicle Registered!
                </>
              ) : isSubmitting ? (
                "Saving Vehicle..."
              ) : (
                "Save Vehicle"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
