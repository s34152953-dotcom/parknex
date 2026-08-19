import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProcessFlowStrip from "@/components/landing/ProcessFlowStrip";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-sp-black flex flex-col justify-between selection:bg-sp-blue selection:text-white">
      <Navbar />
      <Hero />
      <ProcessFlowStrip />
    </main>
  );
}
