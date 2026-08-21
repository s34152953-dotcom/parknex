import Sidebar from "@/components/app-shell/Sidebar";
import TopBar from "@/components/app-shell/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-[#FBF8F3] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-[#FBF8F3] w-full min-w-0">{children}</main>
      </div>
    </div>
  );
}
