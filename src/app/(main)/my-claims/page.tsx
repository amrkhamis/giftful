"use client";

import { useEffect, useState, useCallback } from "react";

interface ClaimedItem {
  claim_id: string;
  claimed_at: string;
  item_id: string;
  item_name: string;
  price: number | null;
  url: string | null;
  image_url: string | null;
  quantity: number;
  wishlist_id: string;
  wishlist_title: string;
  wishlist_owner_id: string;
}

interface GroupedClaims {
  wishlist_id: string;
  wishlist_title: string;
  items: ClaimedItem[];
}

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<ClaimedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unclaimLoading, setUnclaimLoading] = useState<Set<string>>(new Set());

  const fetchClaims = useCallback(async () => {
    try {
      const res = await fetch("/api/my-claims");
      if (res.ok) {
        const data = await res.json();
        setClaims(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  async function handleUnclaim(itemId: string) {
    setUnclaimLoading((prev) => new Set(prev).add(itemId));
    try {
      const res = await fetch(`/api/items/${itemId}/claim`, {
        method: "DELETE",
      });
      if (res.ok) {
        setClaims((prev) => prev.filter((c) => c.item_id !== itemId));
      }
    } catch {
      // silently fail
    } finally {
      setUnclaimLoading((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }

  // Group claims by wishlist
  const grouped: GroupedClaims[] = [];
  const seen = new Map<string, number>();
  for (const claim of claims) {
    const idx = seen.get(claim.wishlist_id);
    if (idx !== undefined) {
      grouped[idx].items.push(claim);
    } else {
      seen.set(claim.wishlist_id, grouped.length);
      grouped.push({
        wishlist_id: claim.wishlist_id,
        wishlist_title: claim.wishlist_title,
        items: [claim],
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-text)]">
        My Claims
      </h1>

      {claims.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white py-16 text-center">
          <div className="mb-3 text-4xl">🎁</div>
          <p className="text-sm font-medium text-[var(--color-text)]">
            You haven&apos;t claimed any gifts yet.
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            When you claim a gift from a friend&apos;s wishlist, it will appear
            here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div
              key={group.wishlist_id}
              className="rounded-xl border border-[var(--color-border)] bg-white"
            >
              {/* Wishlist header */}
              <div className="border-b border-[var(--color-border)] px-5 py-3">
                <h2 className="text-sm font-semibold text-[var(--color-text)]">
                  {group.wishlist_title}
                </h2>
              </div>

              {/* Items */}
              <ul className="divide-y divide-[var(--color-border)]">
                {group.items.map((item) => (
                  <li
                    key={item.claim_id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    {/* Image */}
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--color-bg-subtle)]">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">🎁</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-[var(--color-text)]">
                        {item.item_name}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
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
                        <span className="text-xs text-[var(--color-text-muted)]">
                          Claimed{" "}
                          {new Date(item.claimed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] transition-colors hover:bg-gray-50"
                        >
                          Purchase
                        </a>
                      )}
                      <button
                        onClick={() => handleUnclaim(item.item_id)}
                        disabled={unclaimLoading.has(item.item_id)}
                        className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                      >
                        {unclaimLoading.has(item.item_id)
                          ? "..."
                          : "Unclaim"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
