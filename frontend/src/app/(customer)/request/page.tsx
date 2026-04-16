"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPlaceholder } from "@/components/map-placeholder";

export default function RequestFuelPage() {
  const [step, setStep] = useState(1);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationText, setLocationText] = useState("Detecting your GPS...");

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    setUserLocation([lat, lng]);
    setLocationText(`${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background flare */}
      <div className="absolute top-[-30%] right-[-20%] w-[60%] h-[60%] bg-destructive/10 blur-[150px] rounded-full pointer-events-none"></div>

      <header className="p-4 flex items-center justify-between border-b border-border bg-card/60 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-sm">Emergency Dispatch</span>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">Cancel</Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col p-4 z-10 max-w-md w-full mx-auto">
        <div className="flex gap-2 mb-6 mt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold mb-2">Location Lock</h2>
            <p className="text-gray-400 text-sm mb-6">We're detecting your GPS coordinates. Adjust if needed.</p>
            <div className="h-[280px] rounded-xl overflow-hidden mb-6 border border-primary/30">
              <MapPlaceholder
                title={`GPS: ${locationText}`}
                showUserLocation={true}
                onLocationFound={handleLocationFound}
                radiusMeters={2000}
                zoom={14}
              />
            </div>
            <div className="space-y-4">
              <Input placeholder="Highway Name (e.g. I-95 North)" defaultValue="NH-48 South" />
              <Input placeholder="Mile Marker or Landmark" />
              {userLocation && (
                <p className="text-xs text-primary font-mono">
                  📍 Coordinates: {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                </p>
              )}
            </div>
            <Button className="w-full mt-8 h-12 text-lg" onClick={() => setStep(2)}>Confirm Location</Button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold mb-2">Vehicle details</h2>
            <p className="text-gray-400 text-sm mb-6">What kind of fuel do you need?</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button variant="outline" className="h-24 flex flex-col border-primary bg-primary/10">
                <span className="text-xl font-bold mb-1">Regular</span>
                <span className="text-xs opacity-70">Unleaded 87</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col">
                <span className="text-xl font-bold mb-1 text-gray-300">Diesel</span>
                <span className="text-xs opacity-50">Heavy duty</span>
              </Button>
            </div>

            <div className="space-y-4">
              <Input placeholder="Vehicle Make (e.g. Honda)" />
              <Input placeholder="Vehicle Color" />
              <Input placeholder="License Plate (Optional)" />
            </div>
            <div className="flex gap-4 mt-8">
              <Button variant="ghost" className="h-12 flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="h-12 flex-[2] text-lg" onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold mb-2">Payment</h2>
            <p className="text-gray-400 text-sm mb-6">$50 Emergency Fee + $4.20/gallon</p>
            
            <div className="p-4 border border-secondary rounded-xl bg-card mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Response Fee</span>
                <span>$50.00</span>
              </div>
              <div className="flex justify-between mb-4 pb-4 border-b border-secondary">
                <span className="text-gray-400">Est. 5 Gallons</span>
                <span>$21.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span className="text-primary">Total Hold</span>
                <span>$71.00</span>
              </div>
            </div>

            <Button className="w-full h-14 text-xl py-6 tracking-wide mb-4" variant="destructive">
              <Link href="/track/ORD-9082">AUTHORIZE & DISPATCH</Link>
            </Button>
            <p className="text-xs text-center text-gray-500">Apple Pay / Google Pay verified.</p>
          </div>
        )}
      </main>
    </div>
  );
}
