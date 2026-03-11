"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError(res.ok ? "Invalid response" : "Sign up failed. Try again.");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Sign up failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-xl font-semibold text-zinc-100 mb-4">Sign up</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-[280px] space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password (min 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium"
        >
          {loading ? "..." : "Sign up"}
        </button>
      </form>
      <Link href="/login" className="mt-4 text-zinc-500 hover:text-zinc-300 text-sm">
        Already have an account? Log in
      </Link>
    </main>
  );
}
