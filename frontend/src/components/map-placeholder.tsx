"use client";

import dynamic from "next/dynamic";
import type { MapMarker } from "./map/LiveMap";

// Dynamic import to avoid SSR issues with Leaflet
const LiveMap = dynamic(() => import("./map/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[250px] bg-[#1a1c23] flex items-center justify-center rounded-xl border border-secondary shadow-inner relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#facc15 1px, transparent 1px), linear-gradient(90deg, #facc15 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="z-10 flex flex-col items-center gap-3">
        <div className="w-5 h-5 bg-primary rounded-full border-4 border-black animate-bounce shadow-[0_0_15px_#facc15]"></div>
        <p className="font-mono text-sm text-primary/70 uppercase tracking-widest">Loading Map...</p>
      </div>
    </div>
  ),
});

interface MapPlaceholderProps {
  title?: string;
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  showUserLocation?: boolean;
  onLocationFound?: (lat: number, lng: number) => void;
  radiusMeters?: number;
  className?: string;
}

export function MapPlaceholder({
  title,
  center,
  zoom,
  markers = [],
  showUserLocation = false,
  onLocationFound,
  radiusMeters,
  className,
}: MapPlaceholderProps) {
  return (
    <div className={`w-full h-full min-h-[250px] relative overflow-hidden ${className || ""}`}>
      <LiveMap
        center={center}
        zoom={zoom}
        markers={markers}
        showUserLocation={showUserLocation}
        onLocationFound={onLocationFound}
        radiusMeters={radiusMeters}
        darkMode={true}
      />
      {title && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-secondary">
          <p className="font-mono text-xs text-primary/80 uppercase tracking-widest">{title}</p>
        </div>
      )}
    </div>
  );
}
