import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { SidebarProvider } from "@/context/SidebarContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#FAF7F2] text-[#241F1B] flex antialiased">
        {/* Admin Sidebar (Desktop Sticky + Mobile Off-Canvas Drawer) */}
        <AdminSidebar />

        {/* Main Operations Content */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <AdminTopBar />
          <main className="flex-1 w-full min-w-0 overflow-y-auto bg-[#FAF7F2]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
