import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[var(--color-page)] selection:bg-[var(--color-accent)]/20 selection:text-[var(--color-accent)] overflow-x-hidden w-full max-w-[100vw]">
      <Navbar />
      <Hero />
    </main>
  );
}
