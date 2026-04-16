"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPlaceholder } from "@/components/map-placeholder";
import type { MapMarker } from "@/components/map/LiveMap";

export default function TrackOrderPage({ params }: { params: { orderId: string } }) {
  const [eta, setEta] = useState(12);
  const [driverPos, setDriverPos] = useState<[number, number]>([19.082, 72.881]);

  // Simulate driver moving closer every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPos((prev) => [
        prev[0] - 0.0008 + Math.random() * 0.0003,
        prev[1] - 0.0005 + Math.random() * 0.0003,
      ]);
      setEta((prev) => Math.max(1, prev - 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const markers: MapMarker[] = [
    {
      id: "customer",
      lat: 19.076,
      lng: 72.8777,
      type: "customer",
      label: "📍 Your Location",
      info: "Waiting for fuel delivery",
    },
    {
      id: "driver",
      lat: driverPos[0],
      lng: driverPos[1],
      type: "driver",
      label: "🚛 Mike R.",
      info: `ETA: ${eta} min — White Ford F-250`,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#111] relative">
      {/* Full-screen live map */}
      <div className="absolute inset-0 z-0">
        <MapPlaceholder
          title={`Live Radar — ETA: ${eta} Min`}
          center={[19.079, 72.879]}
          zoom={14}
          markers={markers}
        />
      </div>

      <div className="z-[1000] flex flex-col justify-between h-full pointer-events-none p-4">
        {/* Top bar */}
        <header className="pointer-events-auto flex justify-between items-start mt-2">
          <div className="bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-secondary w-[60%]">
            <h3 className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Truck En Route</h3>
            <p className="text-3xl font-extrabold text-white">{eta} <span className="text-sm font-normal text-gray-400">min</span></p>
            <p className="text-xs text-gray-400 mt-1">{(eta * 0.35).toFixed(1)} miles away</p>
          </div>
          <Link href="/dashboard">
             <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur pointer-events-auto">End</Button>
          </Link>
        </header>

        {/* Bottom card */}
        <div className="pointer-events-auto bg-background/95 backdrop-blur-xl border border-border p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] -mx-4 pb-10">
          <div className="w-12 h-1.5 bg-secondary rounded-full mx-auto mb-6"></div>
          
          <div className="flex items-center justify-between border-b border-border pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/50">
                <span className="font-bold text-gray-400">D</span>
              </div>
              <div>
                <h4 className="font-bold text-lg">Mike R.</h4>
                <p className="text-sm text-gray-400 font-mono">White Ford F-250</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="secondary" className="rounded-full w-12 h-12">💬</Button>
              <Button size="icon" className="rounded-full w-12 h-12 bg-primary text-black hover:bg-primary/80">📞</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Order number</span>
              <span className="font-mono text-white">{params.orderId || "ORD-9082"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Safety Pin</span>
              <span className="font-mono text-primary font-bold tracking-widest text-lg">8492</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
