"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Wishlist {
  id: string;
  title: string;
  description: string;
  type: string;
  privacy: string;
  event_date: string | null;
  item_count: number;
  deleted_at: string | null;
}

const typeBadgeColors: Record<string, string> = {
  wishlist: "bg-rose-100 text-rose-700",
  registry: "bg-violet-100 text-violet-700",
  personal: "bg-amber-100 text-amber-700",
};

function daysUntil(dateStr: string): number | null {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

function countdownLabel(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days === null) return "";
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return "Today!";
  if (days === 1) return "Tomorrow";
  return `${days} days away`;
}

function PrivacyIcon({ privacy }: { privacy: string }) {
  if (privacy === "private") {
    return (
      <svg
        className="h-4 w-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    );
  }
  if (privacy === "friends_only") {
    return (
      <svg
        className="h-4 w-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    );
  }
  return (
    <svg
      className="h-4 w-4 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [deleted, setDeleted] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchWishlists() {
    try {
      const res = await fetch("/api/wishlists");
      if (res.ok) {
        const data = await res.json();
        setWishlists(data);
      }
    } catch {
      // ignore
    }
  }

  async function fetchDeleted() {
    try {
      const res = await fetch("/api/wishlists?deleted=1");
      if (res.ok) {
        const data = await res.json();
        setDeleted(data);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    Promise.all([fetchWishlists(), fetchDeleted()]).finally(() =>
      setLoading(false)
    );
  }, []);

  async function handleRestore(id: string) {
    const res = await fetch(`/api/wishlists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleted_at: null }),
    });
    if (res.ok) {
      await Promise.all([fetchWishlists(), fetchDeleted()]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          My Wishlists
        </h1>
        <button
          onClick={() => router.push("/wishlists/new")}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          + Create New List
        </button>
      </div>

      {/* Wishlists Grid */}
      {wishlists.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] py-16 text-center">
          <p className="text-lg text-[var(--color-text-muted)]">
            No wishlists yet — create your first one!
          </p>
          <button
            onClick={() => router.push("/wishlists/new")}
            className="mt-4 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Create Wishlist
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlists.map((wl) => (
            <button
              key={wl.id}
              onClick={() => router.push(`/wishlists/${wl.id}`)}
              className="group rounded-xl border border-[var(--color-border)] bg-white p-5 text-left transition-all hover:border-rose-200 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                  {wl.title}
                </h2>
                <PrivacyIcon privacy={wl.privacy} />
              </div>

              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    typeBadgeColors[wl.type] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {wl.type}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {wl.item_count} {wl.item_count === 1 ? "item" : "items"}
                </span>
              </div>

              {wl.event_date && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                  <span>
                    {new Date(wl.event_date).toLocaleDateString()} &middot;{" "}
                    {countdownLabel(wl.event_date)}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Recently Deleted */}
      {deleted.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-muted)]">
            Recently Deleted
          </h2>
          <div className="space-y-3">
            {deleted.map((wl) => (
              <div
                key={wl.id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-gray-50 px-4 py-3"
              >
                <div>
                  <span className="font-medium text-[var(--color-text-muted)]">
                    {wl.title}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {wl.item_count} {wl.item_count === 1 ? "item" : "items"}
                  </span>
                </div>
                <button
                  onClick={() => handleRestore(wl.id)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-light)]"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
