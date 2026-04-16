"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPlaceholder } from "@/components/map-placeholder";
import type { MapMarker } from "@/components/map/LiveMap";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Demo markers for active drivers and customers on the admin map
const adminMapMarkers: MapMarker[] = [
  { id: "d1", lat: 19.082, lng: 72.881, type: "driver", label: "🚛 Driver #11", info: "En Route — Gasoline 5 Gal" },
  { id: "d2", lat: 19.069, lng: 72.865, type: "driver", label: "🚛 Driver #12", info: "Online — Available" },
  { id: "d3", lat: 19.091, lng: 72.893, type: "driver", label: "🚛 Driver #13", info: "Fueling — Diesel 10 Gal" },
  { id: "d4", lat: 19.058, lng: 72.889, type: "driver", label: "🚛 Driver #14", info: "Online — Available" },
  { id: "c1", lat: 19.076, lng: 72.877, type: "customer", label: "📍 SOS #9081", info: "I-95 South MM 41 — Waiting" },
  { id: "c2", lat: 19.085, lng: 72.871, type: "customer", label: "📍 SOS #9082", info: "NH-48 North MM 12 — En Route" },
];

interface DashboardStats {
  totalCustomers: number;
  totalDrivers: number;
  onlineDrivers: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalVehicles: number;
  totalRevenue: number;
}

interface Order {
  _id: string;
  status: string;
  fuelType: string;
  quantityGallons: number;
  totalPrice: number;
  deliveryAddress: string;
  createdAt: string;
  customerId?: { name: string; phone: string };
  driverId?: { name: string; phone: string };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    const user = sessionStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);
    if (user) {
      setUserName(JSON.parse(user).name);
    }

    // Fetch dashboard stats
    fetch(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch(console.error);

    // Fetch recent orders
    fetch(`${API_URL}/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders.slice(0, 10));
      })
      .catch(console.error);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/login");
  };

  if (!isAuthenticated) return null;

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    accepted: "bg-blue-500/20 text-blue-400",
    "en-route": "bg-orange-500/20 text-orange-400",
    arrived: "bg-purple-500/20 text-purple-400",
    fueling: "bg-cyan-500/20 text-cyan-400",
    completed: "bg-primary/20 text-primary",
    cancelled: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6 pt-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider">COMMAND CENTER</h1>
          <p className="text-primary font-mono text-sm tracking-widest uppercase">
            Welcome, {userName || "Admin"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm font-mono bg-card px-4 py-2 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary hidden md:inline-block"></span>
              {stats?.onlineDrivers ?? 0} Drivers Online
            </div>
            <div className="w-px h-4 bg-secondary"></div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive hidden md:inline-block"></span>
              {stats?.activeOrders ?? 0} Active Orders
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-gray-400 border-secondary hover:text-white hover:border-destructive">
            Logout
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={stats?.totalCustomers ?? 0} />
        <StatCard label="Total Drivers" value={stats?.totalDrivers ?? 0} />
        <StatCard label="Completed Orders" value={stats?.completedOrders ?? 0} />
        <StatCard label="Total Revenue" value={`$${(stats?.totalRevenue ?? 0).toLocaleString()}`} highlight />
      </div>

      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Radar View */}
        <div className="lg:col-span-2 border border-border rounded-2xl overflow-hidden relative shadow-2xl bg-black">
          <MapPlaceholder title="Global Operations Radar" center={[19.076, 72.877]} zoom={13} markers={adminMapMarkers} />
          <div className="absolute top-4 left-4 right-4 flex gap-4 pointer-events-none">
            <div className="bg-card/80 backdrop-blur border border-secondary p-4 rounded-xl">
              <p className="text-xs text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold font-mono">{stats?.totalOrders ?? 0}</p>
            </div>
            <div className="bg-card/80 backdrop-blur border border-secondary p-4 rounded-xl">
              <p className="text-xs text-gray-400">Vehicles</p>
              <p className="text-2xl font-bold font-mono text-primary">{stats?.totalVehicles ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-card rounded-2xl border border-border p-4 flex flex-col h-full overflow-hidden">
          <h3 className="font-bold text-lg mb-4 text-white p-2">
            {orders.length > 0 ? "Recent Orders" : "Live Incident Log"}
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scroll pb-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <Card key={order._id} className={`bg-background/50 border ${order.status === "en-route" ? "border-destructive shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-secondary"}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${statusColor[order.status] || "bg-gray-500/20 text-gray-400"}`}>
                        {order.status}
                      </span>
                      <span className="font-mono text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-bold text-white text-sm">{order.fuelType.toUpperCase()} — {order.quantityGallons} Gal</p>
                    <p className="text-xs text-gray-400 mb-3 truncate">{order.deliveryAddress}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-secondary">
                      <span className="text-xs text-primary font-mono">${order.totalPrice.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">
                        {order.customerId?.name ?? "Unknown Customer"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm">No orders yet</p>
                <p className="text-xs text-gray-600 mt-1">Orders will appear here in real-time</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? "border-primary/30 bg-primary/5" : "border-secondary bg-card/50"}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${highlight ? "text-primary" : "text-white"}`}>{value}</p>
    </div>
  );
}
