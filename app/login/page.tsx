"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#9f491e] via-[#c96b22] to-[#9f491e] text-white p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-8 shadow-xl backdrop-blur-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome back</h1>

        <label className="block text-sm mb-1 text-white/80">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none focus:border-white/50"
        />

        <label className="block text-sm mb-1 text-white/80">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none focus:border-white/50"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-amber-300 to-orange-400 text-[#5c2a10] font-semibold py-2.5 disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log In"}
        </button>

        {error && <p className="mt-4 text-sm text-center text-red-200">{error}</p>}

        <p className="mt-6 text-sm text-center text-white/70">
          New here?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}