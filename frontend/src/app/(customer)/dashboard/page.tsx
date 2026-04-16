import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-2xl font-bold">Good evening.</h1>
          <p className="text-gray-400 text-sm">1 Vehicle Registered</p>
        </div>
        <div className="w-10 h-10 bg-secondary rounded-full"></div>
      </header>

      <main className="max-w-3xl mx-auto space-y-6">
        {/* Warning CTA */}
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="relative z-10 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-destructive">Emergency Ready</h2>
              <p className="text-sm text-gray-300">Your payment and vehicle are set up for 1-tap SOS response.</p>
            </div>
            <Link href="/request">
              <Button variant="destructive" className="w-full">TEST SOS PING</Button>
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4 text-white">Recent Activity</h3>
          <div className="space-y-3">
            <Card className="bg-card/50">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">ORD-7731 (Completed)</p>
                  <p className="text-xs text-gray-400">Oct 12 • I-95 Mile 44</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">$68.42</p>
                  <p className="text-xs text-gray-400">Regular Gas</p>
                </div>
              </CardContent>
            </Card>
            <p className="text-center text-sm text-gray-500 py-4 font-mono">No other past incidents.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
