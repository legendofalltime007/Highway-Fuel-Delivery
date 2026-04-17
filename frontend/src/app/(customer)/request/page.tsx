"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPlaceholder } from "@/components/map-placeholder";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function RequestFuelPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationText, setLocationText] = useState("Detecting your GPS...");
  const [highwayName, setHighwayName] = useState("NH-48 South");
  const [landmark, setLandmark] = useState("");
  const [fuelType, setFuelType] = useState("gasoline");
  const [gallons] = useState(5); // Fixed at 5 for MVP

  // Ensure user is authenticated to place order
  useEffect(() => {
    if (!sessionStorage.getItem("accessToken")) {
      alert("You must be logged in to request fuel.");
      router.push("/login");
    }
  }, [router]);

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    setUserLocation([lat, lng]);
    setLocationText(`${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
  }, []);

  const handleCheckout = async () => {
    if (!userLocation) {
      setError("Waiting for GPS location...");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fuelType,
          quantityGallons: gallons,
          customerLocation: {
            coordinates: [userLocation[1], userLocation[0]] // Longitude, Latitude for GeoJSON
          },
          deliveryAddress: `${highwayName} — ${landmark}`
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to dispatch driver. Try again.");
      }

      // Success! Navigate to tracker with real MongoDB Order ID
      router.push(`/track/${data.order._id}`);
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

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

        {error && (
          <div className="bg-destructive/20 border border-destructive p-3 rounded-lg text-red-200 text-sm mb-4">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold mb-2">Location Lock</h2>
            <p className="text-gray-400 text-sm mb-6">We're detecting your GPS coordinates. Adjust if needed.</p>
            <div className="h-[280px] rounded-xl overflow-hidden mb-6 border border-primary/30 relative">
              {/* Added key to force remount if needed, but placeholder should handle it */}
              <MapPlaceholder
                title={`GPS: ${locationText}`}
                showUserLocation={true}
                onLocationFound={handleLocationFound}
                radiusMeters={2000}
                zoom={14}
              />
            </div>
            <div className="space-y-4">
              <Input 
                 placeholder="Highway Name (e.g. I-95 North)" 
                 value={highwayName}
                 onChange={(e) => setHighwayName(e.target.value)}
              />
              <Input 
                 placeholder="Mile Marker or Landmark" 
                 value={landmark}
                 onChange={(e) => setLandmark(e.target.value)}
              />
              {userLocation && (
                <p className="text-xs text-primary font-mono">
                  📍 Coordinates: {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                </p>
              )}
            </div>
            <Button 
              className="w-full mt-8 h-12 text-lg" 
              onClick={() => {
                if(!userLocation) setError("Please wait for GPS lock before continuing.");
                else {
                  setError("");
                  setStep(2);
                }
              }}
            >
              Confirm Location
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold mb-2">Vehicle details</h2>
            <p className="text-gray-400 text-sm mb-6">What kind of fuel do you need?</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button 
                variant={fuelType === "gasoline" ? "default" : "outline"}
                onClick={() => setFuelType("gasoline")}
                className={`h-24 flex flex-col ${fuelType === "gasoline" ? "border-primary bg-primary/10 text-white" : ""}`}
              >
                <span className={`text-xl font-bold mb-1 ${fuelType === "gasoline" ? "text-primary" : "text-gray-300"}`}>Regular</span>
                <span className="text-xs opacity-70">Unleaded 87</span>
              </Button>
              <Button 
                variant={fuelType === "diesel" ? "default" : "outline"}
                onClick={() => setFuelType("diesel")}
                className={`h-24 flex flex-col ${fuelType === "diesel" ? "border-primary bg-primary/10 text-white" : ""}`}
              >
                <span className={`text-xl font-bold mb-1 ${fuelType === "diesel" ? "text-primary" : "text-gray-300"}`}>Diesel</span>
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
            <p className="text-gray-400 text-sm mb-6">$15 Emergency Dispatch Fee</p>
            
            <div className="p-4 border border-secondary rounded-xl bg-card mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Response Fee</span>
                <span>$15.00</span>
              </div>
              <div className="flex justify-between mb-2 pb-4 border-b border-secondary">
                <span className="text-gray-400">Est. {gallons} Gallons {fuelType === 'gasoline' ? '(@ $4.50)' : '(@ $5.00)'}</span>
                <span>${(gallons * (fuelType === 'gasoline' ? 4.50 : 5.00)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2">
                <span className="text-primary">Total Hold</span>
                <span>${(15 + gallons * (fuelType === 'gasoline' ? 4.50 : 5.00)).toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full h-14 text-xl py-6 tracking-wide mb-4" 
              variant="destructive"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "AUTHORIZING..." : "AUTHORIZE & DISPATCH"}
            </Button>
            <p className="text-xs text-center text-gray-500">Apple Pay / Google Pay verified.</p>
          </div>
        )}
      </main>
    </div>
  );
}
