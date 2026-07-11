import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${BASE}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

export default function Login() {
  const { login, user } = useAuth();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiPost("/auth/login", { email, password });
      login(data.token, data.user);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-black"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.9) 100%), url(https://assets.nflxext.com/ffe/siteui/vlv3/9d3533b2-0e60-4436-96e6-9f8b5bf2a5f6/web/IN-en-20250707-TRIFECTA-perspective_ef1e07cf-f22e-4ca8-b6fc-2ddd3e564dd2_large.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md mx-4">
        <div className="mb-8 text-center">
          <Link href="/">
            <span className="text-4xl font-bold text-primary tracking-tight">MovieFlix</span>
          </Link>
        </div>

        <div className="bg-black/80 rounded-lg p-10 backdrop-blur-sm border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-8">Sign In</h1>

          {error && (
            <div
              className="bg-orange-600/90 text-white text-sm rounded px-4 py-3 mb-6"
              data-testid="auth-error"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-400 rounded px-4 py-4 focus:outline-none focus:border-white transition-colors"
                data-testid="input-email"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-400 rounded px-4 py-4 focus:outline-none focus:border-white transition-colors"
                data-testid="input-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded transition-colors disabled:opacity-50"
              data-testid="btn-submit"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-zinc-400 text-sm">
            New to MovieFlix?{" "}
            <Link href="/signup" className="text-white hover:underline font-medium">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
