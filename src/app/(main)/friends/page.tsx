"use client";

import { useEffect, useState, useCallback } from "react";

interface SearchUser {
  id: string;
  display_name: string;
  email: string;
  privacy_setting: string;
}

interface FriendWishlist {
  id: string;
  title: string;
  type: string | null;
  event_date: string | null;
}

interface Friend {
  user: SearchUser;
  wishlists: FriendWishlist[];
}

interface ExpandedWishlist {
  items: Array<{
    id: string;
    name: string;
    price: number | null;
    image_url: string | null;
    quantity: number;
    is_starred: number;
  }>;
  loading: boolean;
}

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followLoading, setFollowLoading] = useState<Set<string>>(new Set());

  const [expandedWishlists, setExpandedWishlists] = useState<
    Record<string, ExpandedWishlist>
  >({});

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch("/api/friends");
      if (!res.ok) return;
      const data: Friend[] = await res.json();
      setFriends(data);
      setFollowingIds(new Set(data.map((f) => f.user.id)));
    } catch {
      // silently fail
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch {
        // silently fail
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  async function handleFollow(userId: string) {
    setFollowLoading((prev) => new Set(prev).add(userId));
    try {
      const res = await fetch(`/api/follows/${userId}`, { method: "POST" });
      if (res.ok) {
        setFollowingIds((prev) => new Set(prev).add(userId));
        fetchFriends();
      }
    } catch {
      // silently fail
    } finally {
      setFollowLoading((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }

  async function handleUnfollow(userId: string) {
    setFollowLoading((prev) => new Set(prev).add(userId));
    try {
      const res = await fetch(`/api/follows/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        setFriends((prev) => prev.filter((f) => f.user.id !== userId));
      }
    } catch {
      // silently fail
    } finally {
      setFollowLoading((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }

  async function toggleWishlistExpand(wishlistId: string) {
    if (expandedWishlists[wishlistId]) {
      setExpandedWishlists((prev) => {
        const next = { ...prev };
        delete next[wishlistId];
        return next;
      });
      return;
    }

    setExpandedWishlists((prev) => ({
      ...prev,
      [wishlistId]: { items: [], loading: true },
    }));

    try {
      const res = await fetch(`/api/wishlists/${wishlistId}/items`);
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.items || [];
        setExpandedWishlists((prev) => ({
          ...prev,
          [wishlistId]: { items, loading: false },
        }));
      } else {
        setExpandedWishlists((prev) => ({
          ...prev,
          [wishlistId]: { items: [], loading: false },
        }));
      }
    } catch {
      setExpandedWishlists((prev) => ({
        ...prev,
        [wishlistId]: { items: [], loading: false },
      }));
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-text)]">
        Friends
      </h1>

      {/* Search bar */}
      <div className="mb-8">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full rounded-xl border border-[var(--color-border)] py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>

        {/* Search results */}
        {searchQuery.trim() && (
          <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-white">
            {searchLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-6 text-center text-sm text-[var(--color-text-muted)]">
                No users found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {searchResults.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {user.display_name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {user.email}
                      </p>
                    </div>
                    {followingIds.has(user.id) ? (
                      <button
                        onClick={() => handleUnfollow(user.id)}
                        disabled={followLoading.has(user.id)}
                        className="rounded-lg border border-[var(--color-border)] px-4 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {followLoading.has(user.id)
                          ? "..."
                          : "Unfollow"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(user.id)}
                        disabled={followLoading.has(user.id)}
                        className="rounded-lg bg-[var(--color-primary)] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                      >
                        {followLoading.has(user.id) ? "..." : "Follow"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* My Friends section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
          My Friends
        </h2>

        {friendsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
          </div>
        ) : friends.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white py-12 text-center">
            <div className="mb-3 text-4xl">👋</div>
            <p className="text-sm font-medium text-[var(--color-text)]">
              You&apos;re not following anyone yet.
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Search for friends above!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {friends.map((friend) => (
              <div
                key={friend.user.id}
                className="rounded-xl border border-[var(--color-border)] bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text)]">
                      {friend.user.display_name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {friend.user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnfollow(friend.user.id)}
                    disabled={followLoading.has(friend.user.id)}
                    className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    Unfollow
                  </button>
                </div>

                {/* Public wishlists */}
                {friend.wishlists.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {friend.wishlists.map((wl) => (
                      <div key={wl.id}>
                        <button
                          onClick={() => toggleWishlistExpand(wl.id)}
                          className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-bg-subtle)]"
                        >
                          <svg
                            className={`h-3.5 w-3.5 text-[var(--color-text-muted)] transition-transform ${
                              expandedWishlists[wl.id]
                                ? "rotate-90"
                                : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <span className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                            {wl.title}
                          </span>
                          {wl.type && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                              {wl.type.replace("_", " ")}
                            </span>
                          )}
                          {wl.event_date && (
                            <span className="text-xs text-[var(--color-text-muted)]">
                              {new Date(wl.event_date).toLocaleDateString()}
                            </span>
                          )}
                        </button>

                        {/* Expanded inline view */}
                        {expandedWishlists[wl.id] && (
                          <div className="ml-6 mt-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3">
                            {expandedWishlists[wl.id].loading ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                              </div>
                            ) : expandedWishlists[wl.id].items.length ===
                              0 ? (
                              <p className="py-2 text-center text-xs text-[var(--color-text-muted)]">
                                No items in this wishlist yet.
                              </p>
                            ) : (
                              <ul className="space-y-2">
                                {expandedWishlists[wl.id].items.map(
                                  (item) => (
                                    <li
                                      key={item.id}
                                      className="flex items-center gap-3"
                                    >
                                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                                        {item.image_url ? (
                                          <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <span className="text-lg">
                                            🎁
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium text-[var(--color-text)]">
                                          {item.is_starred === 1 && (
                                            <span className="mr-1 text-amber-400">
                                              ★
                                            </span>
                                          )}
                                          {item.name}
                                        </p>
                                      </div>
                                      {item.price != null && (
                                        <span className="text-xs font-medium text-[var(--color-primary)]">
                                          $
                                          {Number(item.price).toFixed(
                                            2
                                          )}
                                        </span>
                                      )}
                                      {item.quantity > 1 && (
                                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
                                          x{item.quantity}
                                        </span>
                                      )}
                                    </li>
                                  )
                                )}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                    No public wishlists yet.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
