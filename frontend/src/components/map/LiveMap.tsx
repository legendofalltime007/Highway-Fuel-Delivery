"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for Leaflet in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom icons for different marker types
const customerIcon = L.divIcon({
  html: `<div style="background:#ef4444;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(239,68,68,0.8);"></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const driverIcon = L.divIcon({
  html: `<div style="background:#facc15;width:24px;height:24px;border-radius:50%;border:3px solid #000;box-shadow:0 0 15px rgba(250,204,21,0.6);display:flex;align-items:center;justify-content:center;font-size:12px;">🚛</div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to re-center the map when position changes
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

// Component to get user's current GPS location
function LocationDetector({
  onLocationFound,
}: {
  onLocationFound: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 15 });
    map.on("locationfound", (e) => {
      onLocationFound(e.latlng.lat, e.latlng.lng);
    });
  }, [map, onLocationFound]);

  return null;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: "customer" | "driver" | "default";
  label?: string;
  info?: string;
}

interface LiveMapProps {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  markers?: MapMarker[];
  showUserLocation?: boolean;
  onLocationFound?: (lat: number, lng: number) => void;
  radiusMeters?: number;
  className?: string;
  darkMode?: boolean;
}

export default function LiveMap({
  center = [19.076, 72.8777], // Default: Mumbai
  zoom = 13,
  markers = [],
  showUserLocation = false,
  onLocationFound,
  radiusMeters,
  className = "",
  darkMode = true,
}: LiveMapProps) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  // Dark-themed map tiles
  const tileUrl = darkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution = darkMode
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  const handleLocationFound = (lat: number, lng: number) => {
    setUserPos([lat, lng]);
    onLocationFound?.(lat, lng);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "customer":
        return customerIcon;
      case "driver":
        return driverIcon;
      default:
        return defaultIcon;
    }
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className={`w-full h-full min-h-[250px] z-0 ${className}`}
      style={{ background: darkMode ? "#1a1c23" : "#f0f0f0" }}
    >
      <TileLayer url={tileUrl} attribution={tileAttribution} />

      {/* Detect user location */}
      {showUserLocation && (
        <LocationDetector onLocationFound={handleLocationFound} />
      )}

      {/* User location marker */}
      {userPos && (
        <>
          <Marker position={userPos} icon={customerIcon}>
            <Popup>
              <span style={{ color: "#000", fontWeight: "bold" }}>📍 Your Location</span>
            </Popup>
          </Marker>
          {radiusMeters && (
            <Circle
              center={userPos}
              radius={radiusMeters}
              pathOptions={{
                color: "#facc15",
                fillColor: "#facc15",
                fillOpacity: 0.08,
                weight: 1,
              }}
            />
          )}
        </>
      )}

      {/* Additional markers */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={getIcon(marker.type)}
        >
          <Popup>
            <div style={{ color: "#000" }}>
              <strong>{marker.label || "Location"}</strong>
              {marker.info && <p style={{ margin: "4px 0 0", fontSize: "12px" }}>{marker.info}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
