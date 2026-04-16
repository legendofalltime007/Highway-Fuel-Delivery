import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 py-8 md:p-24 overflow-x-hidden bg-background">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

      <header className="w-full max-w-4xl flex justify-between items-center z-10 mb-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md rotate-45 flex items-center justify-center shadow-[0_0_10px_rgba(250,204,21,0.5)]">
            <div className="w-3 h-3 bg-black rounded-sm" />
          </div>
          <span className="font-bold text-xl tracking-tight uppercase">HighwayFuel</span>
        </div>
        <nav className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="hidden sm:inline-flex">Admin</Button>
          </Link>
        </nav>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center rounded-full border border-primary/30 px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary mb-8 animate-fade-in">
          🔥 24/7 Emergency Dispatch
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
          Stranded & <br/> Out of Gas?
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12">
          Don't abandon your vehicle on a dangerous shoulder. We deliver fuel to you on the highway within minutes.
        </p>

        <Link href="/request">
          <Button variant="destructive" size="lg" className="w-[80vw] max-w-sm rounded-full py-8 text-2xl animate-pulse">
            EMERGENCY FUEL
          </Button>
        </Link>
        <p className="mt-4 text-sm text-gray-500 font-mono tracking-widest uppercase">Tap for immediate rescue</p>
      </main>

      <div className="mt-32 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
        <FeatureCard title="GPS Locator" desc="Auto-detects your highway mile marker instantly." />
        <FeatureCard title="Rapid Dispatch" desc="Drivers dispatched before payment is even verified." />
        <FeatureCard title="Live Tracking" desc="Watch your rescue truck arrive on a live radar." />
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-secondary bg-card/30 backdrop-blur-sm shadow-xl">
      <h3 className="text-xl font-bold mb-2 text-primary">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
    </div>
  )
}
