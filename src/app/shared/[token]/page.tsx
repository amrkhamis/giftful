"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface WishlistItem {
  id: string;
  name: string;
  price: number | null;
  url: string | null;
  image_url: string | null;
  quantity: number;
  notes: string | null;
  is_starred: number;
  is_claimed: boolean;
}

interface Wishlist {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  event_date: string | null;
  user_id: string;
  owner_name?: string;
}

type ClaimMode = "choose" | "guest" | null;

export default function SharedWishlistPage() {
  const { token } = useParams<{ token: string }>();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [claimingItemId, setClaimingItemId] = useState<string | null>(null);
  const [claimMode, setClaimMode] = useState<ClaimMode>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [claimError, setClaimError] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch(`/api/shared/${token}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setWishlist(data.wishlist);
      setItems(data.items);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  function openClaimModal(itemId: string) {
    setClaimingItemId(itemId);
    setClaimMode("choose");
    setClaimError("");
    setGuestName("");
    setGuestEmail("");
  }

  function closeClaimModal() {
    setClaimingItemId(null);
    setClaimMode(null);
    setClaimError("");
  }

  async function handleClaimLoggedIn() {
    if (!claimingItemId) return;
    setClaimLoading(true);
    setClaimError("");
    try {
      const res = await fetch(`/api/items/${claimingItemId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json();
        setClaimError(data.error || "Failed to claim. Are you logged in?");
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === claimingItemId ? { ...item, is_claimed: true } : item
        )
      );
      closeClaimModal();
    } catch {
      setClaimError("Network error. Please try again.");
    } finally {
      setClaimLoading(false);
    }
  }

  async function handleClaimGuest() {
    if (!claimingItemId) return;
    if (!guestName.trim() || !guestEmail.trim()) {
      setClaimError("Please enter your name and email.");
      return;
    }
    setClaimLoading(true);
    setClaimError("");
    try {
      const res = await fetch(`/api/items/${claimingItemId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: guestName.trim(),
          guest_email: guestEmail.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setClaimError(data.error || "Failed to claim.");
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === claimingItemId ? { ...item, is_claimed: true } : item
        )
      );
      closeClaimModal();
    } catch {
      setClaimError("Network error. Please try again.");
    } finally {
      setClaimLoading(false);
    }
  }

  function toggleNotes(itemId: string) {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-subtle)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (notFound || !wishlist) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-subtle)] px-4">
        <div className="text-center">
          <div className="mb-4 text-5xl">🔍</div>
          <h1 className="mb-2 text-2xl font-bold text-[var(--color-text)]">
            Wishlist not found
          </h1>
          <p className="mb-6 text-[var(--color-text-muted)]">
            This link may have expired or the wishlist may no longer exist.
          </p>
          <Link
            href="/signup"
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Create your own wishlist
          </Link>
        </div>
      </div>
    );
  }

  const typeBadgeColors: Record<string, string> = {
    birthday: "bg-purple-100 text-purple-700",
    wedding: "bg-pink-100 text-pink-700",
    christmas: "bg-green-100 text-green-700",
    baby_shower: "bg-blue-100 text-blue-700",
    general: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
                {wishlist.title}
              </h1>
              {wishlist.owner_name && (
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Shared by {wishlist.owner_name}
                </p>
              )}
              {wishlist.description && (
                <p className="mt-2 text-[var(--color-text-muted)]">
                  {wishlist.description}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {wishlist.type && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    typeBadgeColors[wishlist.type] || typeBadgeColors.general
                  }`}
                >
                  {wishlist.type.replace("_", " ")}
                </span>
              )}
              {wishlist.event_date && (
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
                  {new Date(wishlist.event_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Items grid */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-3 text-4xl">🎁</div>
            <p className="text-[var(--color-text-muted)]">
              This wishlist is empty for now.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`relative flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
                  item.is_claimed
                    ? "border-gray-200 opacity-60"
                    : "border-[var(--color-border)]"
                }`}
              >
                {/* Star badge */}
                {item.is_starred === 1 && (
                  <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs text-white shadow">
                    ★
                  </div>
                )}

                {/* Claimed badge */}
                {item.is_claimed && (
                  <div className="absolute top-3 left-3 rounded-full bg-gray-600 px-2.5 py-0.5 text-xs font-medium text-white">
                    Already Claimed
                  </div>
                )}

                {/* Image or placeholder */}
                <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-lg bg-[var(--color-bg-subtle)]">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🎁</span>
                  )}
                </div>

                {/* Item details */}
                <h3 className="mb-1 font-semibold text-[var(--color-text)]">
                  {item.name}
                </h3>

                <div className="mb-2 flex items-center gap-2">
                  {item.price != null && (
                    <span className="text-sm font-medium text-[var(--color-primary)]">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  )}
                  {item.quantity > 1 && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
                      Qty: {item.quantity}
                    </span>
                  )}
                </div>

                {/* Notes */}
                {item.notes && (
                  <div className="mb-3">
                    <button
                      onClick={() => toggleNotes(item.id)}
                      className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                    >
                      {expandedNotes.has(item.id)
                        ? "Hide notes"
                        : "Show notes"}
                    </button>
                    {expandedNotes.has(item.id) && (
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {item.notes}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-auto">
                  {item.is_claimed ? (
                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-500"
                    >
                      Claimed
                    </button>
                  ) : (
                    <button
                      onClick={() => openClaimModal(item.id)}
                      className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                    >
                      Claim This Gift
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-xl border border-[var(--color-border)] bg-white p-6 text-center">
          <h3 className="mb-1 text-lg font-semibold text-[var(--color-text)]">
            Want to create your own wishlist?
          </h3>
          <p className="mb-4 text-sm text-[var(--color-text-muted)]">
            Sign up for free and start sharing your wishlists with friends and
            family.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Sign up for free
          </Link>
        </div>
      </div>

      {/* Claim modal */}
      {claimingItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            {claimMode === "choose" && (
              <>
                <h2 className="mb-1 text-lg font-semibold text-[var(--color-text)]">
                  Claim this gift
                </h2>
                <p className="mb-5 text-sm text-[var(--color-text-muted)]">
                  Do you have a Giftful account?
                </p>

                {claimError && (
                  <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {claimError}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleClaimLoggedIn}
                    disabled={claimLoading}
                    className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                  >
                    {claimLoading
                      ? "Claiming..."
                      : "Yes, I'm logged in"}
                  </button>
                  <button
                    onClick={() => {
                      setClaimMode("guest");
                      setClaimError("");
                    }}
                    disabled={claimLoading}
                    className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    No, claim as guest
                  </button>
                </div>

                <button
                  onClick={closeClaimModal}
                  className="mt-4 w-full text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Cancel
                </button>
              </>
            )}

            {claimMode === "guest" && (
              <>
                <h2 className="mb-1 text-lg font-semibold text-[var(--color-text)]">
                  Claim as guest
                </h2>
                <p className="mb-5 text-sm text-[var(--color-text-muted)]">
                  Enter your name and email so the wishlist owner knows who
                  claimed this gift.
                </p>

                {claimError && (
                  <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {claimError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                      Your name
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                      Your email
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                      placeholder="you@example.com"
                    />
                  </div>
                  <button
                    onClick={handleClaimGuest}
                    disabled={claimLoading}
                    className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                  >
                    {claimLoading ? "Claiming..." : "Claim Gift"}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setClaimMode("choose");
                    setClaimError("");
                  }}
                  className="mt-4 w-full text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
