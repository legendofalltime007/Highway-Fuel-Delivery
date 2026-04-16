"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed.");
        setLoading(false);
        return;
      }

      // Store tokens and user info in sessionStorage
      sessionStorage.setItem("accessToken", data.accessToken);
      sessionStorage.setItem("refreshToken", data.refreshToken);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.setItem("isLoggedIn", "true");

      // Redirect based on role
      switch (data.user.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "driver":
          router.push("/driver/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (err) {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="z-10 w-full max-w-md p-8 rounded-2xl border border-secondary bg-card/50 backdrop-blur-md shadow-2xl relative">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-primary rounded-xl mx-auto mb-6 flex items-center justify-center rotate-45 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
            <div className="w-4 h-4 bg-black rounded-sm" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Systems Login</h1>
          <p className="text-gray-400 text-sm">Enter your operator credentials</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-black/50 border border-secondary rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="admin@highwayfuel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-black/50 border border-secondary rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            size="lg" 
            disabled={loading}
            className="w-full py-6 text-lg font-bold rounded-xl mt-4 bg-primary hover:bg-white text-black transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                Authenticating...
              </span>
            ) : (
              "Authenticate"
            )}
          </Button>

          <div className="text-center pt-4 border-t border-secondary">
            <p className="text-xs text-gray-500 mb-3">Default Admin: admin@highwayfuel.com / admin123</p>
            <Button variant="link" className="text-gray-500 mb-0" onClick={() => router.push("/")}>Return to Home</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
