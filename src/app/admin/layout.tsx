import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050507] text-[#F5F7FA] flex antialiased">
      {/* Admin Left Sidebar */}
      <AdminSidebar />

      {/* Main Operations Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 w-full min-w-0 overflow-y-auto bg-[#050507]">
          {children}
        </main>
      </div>
    </div>
  );
}
