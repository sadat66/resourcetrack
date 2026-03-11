"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <span className="text-zinc-500">Loading...</span>
      </main>
    );
  }

  if (user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-zinc-500 mb-4">Logged in as {user.email}</p>
        <Link
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Go to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-semibold text-zinc-100 mb-2">
        ResourceTrack
      </h1>
      <p className="text-zinc-500 text-sm mb-6 text-center max-w-xs">
        Track YouTube videos and links for your web dev progress.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
