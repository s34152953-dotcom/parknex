import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#FBF8F3] selection:bg-[#D84A2B]/20 selection:text-[#D84A2B] overflow-x-hidden">
      <Navbar />
      <Hero />
    </main>
  );
}
