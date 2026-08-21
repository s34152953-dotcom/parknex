import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#1C1917] flex">
      {/* Admin Left Sidebar */}
      <AdminSidebar />

      {/* Main Operations Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar />
        <main className="flex-1 w-full min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
