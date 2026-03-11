"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SECTIONS, type SectionValue } from "@/lib/sections";

type Resource = {
  id: string;
  title: string;
  url: string;
  type: "youtube" | "link";
  section: string;
  thumbnail: string | null;
  done: boolean;
  createdAt: string;
};

const SECTION_ORDER: SectionValue[] = [
  "frontend",
  "backend",
  "database",
  "fundamentals",
  "interview-prep",
  "other",
];

function sectionLabel(value: string): string {
  return SECTIONS.find((s) => s.value === value)?.label ?? value;
}

export default function DashboardPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [section, setSection] = useState<SectionValue>("other");
  const [adding, setAdding] = useState(false);
  const [dragOverSection, setDragOverSection] = useState<SectionValue | null>(null);

  function load() {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null));
    fetch("/api/resources")
      .then((r) => {
        if (r.status === 401) return [];
        return r.json();
      })
      .then((data) => setResources(Array.isArray(data) ? data : []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), url: url.trim(), section }),
      });
      if (res.ok) {
        const item = await res.json();
        setResources((prev) => [item, ...prev]);
        setTitle("");
        setUrl("");
      }
    } finally {
      setAdding(false);
    }
  }

  async function toggleDone(id: string, current: boolean) {
    const res = await fetch(`/api/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !current }),
    });
    if (res.ok) {
      const updated = await res.json();
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, done: updated.done } : r))
      );
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    if (res.ok) setResources((prev) => prev.filter((r) => r.id !== id));
  }

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }

  async function moveToSection(id: string, nextSection: SectionValue) {
    const res = await fetch(`/api/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: nextSection }),
    });
    if (res.ok) {
      const updated = await res.json();
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, section: updated.section } : r))
      );
    }
  }

  function onDragOverSection(e: React.DragEvent, sec: SectionValue) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverSection !== sec) setDragOverSection(sec);
  }

  function onDragLeaveSection(sec: SectionValue) {
    if (dragOverSection === sec) setDragOverSection(null);
  }

  async function onDropToSection(e: React.DragEvent, sec: SectionValue) {
    e.preventDefault();
    setDragOverSection(null);
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    const current = resources.find((r) => r.id === id);
    if (current && (current.section || "other") === sec) return;
    await moveToSection(id, sec);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const bySection = SECTION_ORDER.map((sec) => ({
    section: sec,
    label: sectionLabel(sec),
    items: resources.filter((r) => (r.section || "other") === sec),
  }));

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <span className="text-zinc-500">Loading...</span>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-zinc-500 mb-4">You need to log in.</p>
        <Link href="/login" className="text-blue-400 hover:underline">
          Log in
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col max-w-2xl mx-auto">
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
        <Link href="/" className="text-zinc-100 font-medium">
          ResourceTrack
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 text-sm">{user.email}</span>
          <button
            type="button"
            onClick={logout}
            className="text-zinc-500 hover:text-zinc-300 text-sm"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="p-4 flex-1">
        <form onSubmit={handleAdd} className="space-y-2 mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="url"
              placeholder="URL (YouTube or any link)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={section}
              onChange={(e) => setSection(e.target.value as SectionValue)}
              className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {SECTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={adding}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium whitespace-nowrap"
            >
              Add
            </button>
          </div>
        </form>

        {resources.length === 0 && (
          <p className="text-zinc-500 text-sm py-8 text-center">
            No resources yet. Add a YouTube video or link above.
          </p>
        )}

        <div className="space-y-8">
          {bySection.map(({ section: sec, label, items }) => (
            <section
              key={sec}
              onDragOver={(e) => onDragOverSection(e, sec)}
              onDragLeave={() => onDragLeaveSection(sec)}
              onDrop={(e) => onDropToSection(e, sec)}
              className={
                dragOverSection === sec
                  ? "rounded-lg outline outline-1 outline-blue-500/50"
                  : undefined
              }
            >
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                {label}
              </h2>
              <ul className="space-y-2">
                {items.length === 0 && (
                  <li className="text-zinc-600 text-sm py-3 text-center border border-dashed border-zinc-800 rounded-lg">
                    Drop here
                  </li>
                )}
                {items.map((r) => (
                  <li
                    key={r.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, r.id)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 cursor-grab active:cursor-grabbing"
                  >
                    <button
                      type="button"
                      onClick={() => toggleDone(r.id, r.done)}
                      className="shrink-0 w-5 h-5 rounded border border-zinc-600 flex items-center justify-center hover:border-blue-500 focus:outline-none"
                      aria-label={r.done ? "Mark undone" : "Mark done"}
                    >
                      {r.done && (
                        <span className="text-blue-500 text-sm leading-none">✓</span>
                      )}
                    </button>
                    {r.thumbnail ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 w-20 h-11 rounded overflow-hidden bg-zinc-800 block"
                      >
                        <img
                          src={r.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ) : (
                      <span className="shrink-0 w-20 h-11 rounded bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">
                        link
                      </span>
                    )}
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 min-w-0 text-sm truncate ${
                        r.done
                          ? "text-zinc-500 line-through"
                          : "text-zinc-200 hover:text-blue-400"
                      }`}
                    >
                      {r.title}
                    </a>
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      className="shrink-0 text-zinc-500 hover:text-red-400 text-xs"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
