"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Order {
  _id: string;
  status: string;
  fuelType: string;
  quantityGallons: number;
  totalPrice: number;
  deliveryAddress: string;
  createdAt: string;
  driverId?: { name: string; phone: string };
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    const user = sessionStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (user) {
      try {
        setUserName(JSON.parse(user).name);
      } catch {}
    }

    fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/login");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const statusColor: Record<string, string> = {
    pending: "text-yellow-400",
    accepted: "text-blue-400",
    "en-route": "text-orange-400",
    arrived: "text-purple-400",
    fueling: "text-cyan-400",
    completed: "text-primary",
    cancelled: "text-gray-400",
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-2xl font-bold">{getGreeting()}, {userName || "there"}.</h1>
          <p className="text-gray-400 text-sm">{orders.length} Order{orders.length !== 1 ? "s" : ""} on file</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-gray-400 border border-secondary rounded-lg hover:text-white hover:border-destructive transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="max-w-3xl mx-auto space-y-6">
        {/* Emergency CTA */}
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="relative z-10 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-destructive">Emergency Ready</h2>
              <p className="text-sm text-gray-300">Your payment and vehicle are set up for 1-tap SOS response.</p>
            </div>
            <Link
              href="/request"
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-bold tracking-wider h-10 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-colors"
            >
              REQUEST FUEL NOW
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-white">Recent Activity</h3>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Loading orders...</p>
              </div>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <Card key={order._id} className="bg-card/50 border-secondary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-white">
                          {order.fuelType.toUpperCase()} — {order.quantityGallons} Gal
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.deliveryAddress}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${order.totalPrice.toFixed(2)}</p>
                        <p className={`text-xs font-semibold uppercase ${statusColor[order.status] || "text-gray-400"}`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-secondary">
                      <span className="text-xs text-gray-500 font-mono">
                        {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}
                      </span>
                      {order.driverId && (
                        <span className="text-xs text-gray-400">Driver: {order.driverId.name}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm text-gray-500">No orders yet</p>
                <p className="text-xs text-gray-600 mt-1">Request fuel to see your order history here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
