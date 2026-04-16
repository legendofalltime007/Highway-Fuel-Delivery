"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPlaceholder } from "@/components/map-placeholder";

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      <header className="p-4 flex items-center justify-between border-b border-border bg-card z-10">
        <div>
          <h2 className="font-bold text-lg">Driver Unit #42</h2>
          <p className="text-xs text-gray-400">140 / 200 Gal. Unleaded</p>
        </div>
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`px-4 py-2 rounded-full font-bold text-sm transition-all shadow-lg ${isOnline ? 'bg-primary text-black shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-secondary text-gray-400'}`}
        >
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </button>
      </header>

      <main className="flex-1 flex flex-col relative">
        <div className="absolute inset-0">
          <MapPlaceholder title={isOnline ? "Scanning for SOS Pings..." : "Map Disabled (Offline)"} />
        </div>

        {isOnline && (
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-4 animate-in slide-in-from-bottom-5">
            {/* Incoming Request */}
            <div className="bg-destructive/90 backdrop-blur-md rounded-2xl border-2 border-red-400 p-5 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded inline-block mb-1">🆘 NEW PING</div>
                  <h3 className="text-xl font-bold text-white tracking-wide">3.2 MILES AWAY</h3>
                  <p className="text-red-100 text-sm">I-95 South, MM 42</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">$65</p>
                  <p className="text-xs text-red-200">5 Gallons</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-[2] bg-white text-destructive font-bold text-lg hover:bg-gray-100 py-6" size="lg">ACCEPT</Button>
                <Button className="flex-[1] border border-white text-white bg-transparent hover:bg-white/10" variant="outline">REJECT</Button>
              </div>
            </div>
          </div>
        )}

        {!isOnline && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center p-6 text-gray-400 max-w-xs">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                😴
              </div>
              <h3 className="text-xl font-bold mb-2">You are Offline</h3>
              <p className="text-sm">Go online to receive emergency fuel requests and start earning.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
