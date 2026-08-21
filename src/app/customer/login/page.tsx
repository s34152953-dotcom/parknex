"use client";

import { signIn } from "next-auth/react";

export default function CustomerLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF8F3] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(80,50,20,0.03)] border border-[#EAE3D9] text-center">
        <h1 className="text-2xl font-bold text-[#1C1917] mb-2">Welcome to ParkNex</h1>
        <p className="text-[#78716C] mb-8 text-sm">Sign in to manage your vehicle and view your real-time parking location.</p>
        
        <button
          onClick={() => signIn("google", { callbackUrl: "/customer/register-vehicle" })}
          className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-[#E2D9CC] rounded-2xl text-[#1C1917] font-semibold hover:bg-[#FAF7F2] transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
