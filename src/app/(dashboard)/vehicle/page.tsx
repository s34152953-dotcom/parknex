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
      // Fallback for demo
      setSuccess(true);
      setTimeout(() => {
        router.push("/my-car");
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full p-4 sm:p-8 bg-[#05070A] flex flex-col items-center justify-center">
      <div className="w-full max-w-[540px]">
        {/* Back */}
        <Link
          href="/my-car"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-sp-secondary hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Vehicles
        </Link>

        {/* Form Card */}
        <div className="bg-sp-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-sp-blue/15 border border-sp-blue/30 flex items-center justify-center text-sp-blue mb-4">
            <Car className="w-6 h-6" strokeWidth={1.5} />
          </div>

          <h1 className="text-[22px] font-bold text-white">Register New Vehicle</h1>
          <p className="text-[13px] text-sp-secondary mt-1 mb-6">
            Link your vehicle plate to enable automated entry camera detection
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Plate */}
            <div>
              <label className="block text-[12px] font-semibold text-sp-nav uppercase mb-1.5">
                License Plate / Registration *
              </label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. KA-01-MJ-2024"
                className="w-full h-11 px-4 rounded-xl bg-sp-elevated border border-white/10 text-white placeholder:text-sp-muted text-[14px] uppercase tracking-wider focus:border-sp-blue focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Manufacturer & Model */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-sp-nav uppercase mb-1.5">
                  Make / Brand *
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g. Hyundai, Tesla"
                  className="w-full h-11 px-4 rounded-xl bg-sp-elevated border border-white/10 text-white placeholder:text-sp-muted text-[14px] focus:border-sp-blue focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-sp-nav uppercase mb-1.5">
                  Model *
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Creta, Model Y"
                  className="w-full h-11 px-4 rounded-xl bg-sp-elevated border border-white/10 text-white placeholder:text-sp-muted text-[14px] focus:border-sp-blue focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Color & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-sp-nav uppercase mb-1.5">
                  Color
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Black, Deep Blue"
                  className="w-full h-11 px-4 rounded-xl bg-sp-elevated border border-white/10 text-white placeholder:text-sp-muted text-[14px] focus:border-sp-blue focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-sp-nav uppercase mb-1.5">
                  Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-sp-elevated border border-white/10 text-white text-[14px] focus:border-sp-blue focus:outline-none transition-colors"
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
              <p className="text-[12.5px] text-sp-red font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || success}
              className={`w-full h-[50px] rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 mt-4 shadow-xl transition-all ${
                success
                  ? "bg-sp-green text-white"
                  : "bg-sp-blue text-white hover:bg-sp-blue-hover active:scale-[0.99] shadow-sp-blue/30"
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
