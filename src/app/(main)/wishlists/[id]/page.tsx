"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

/* ---------- Types ---------- */

interface WishlistItem {
  id: string;
  name: string;
  price: number | null;
  url: string;
  image_url: string;
  notes: string;
  quantity: number;
  is_starred: number;
  sort_order: number;
}

interface Wishlist {
  id: string;
  title: string;
  description: string;
  type: string;
  privacy: string;
  event_date: string | null;
  items: WishlistItem[];
}

interface ScrapeResult {
  title: string | null;
  price: number | null;
  images: string[];
}

/* ---------- Small Components ---------- */

const typeBadgeColors: Record<string, string> = {
  wishlist: "bg-rose-100 text-rose-700",
  registry: "bg-violet-100 text-violet-700",
  personal: "bg-amber-100 text-amber-700",
};

const privacyLabels: Record<string, string> = {
  public: "Public",
  friends_only: "Friends Only",
  private: "Private",
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-5 w-5 ${filled ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

/* ---------- Main Page ---------- */

export default function WishlistDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const wishlistId = params.id;

  // Core state
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inline editing (title / description)
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Settings modal
  const [showSettings, setShowSettings] = useState(false);
  const [settingsType, setSettingsType] = useState("wishlist");
  const [settingsPrivacy, setSettingsPrivacy] = useState("public");
  const [settingsDate, setSettingsDate] = useState("");

  // Share
  const [shareUrl, setShareUrl] = useState("");
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copied, setCopied] = useState(false);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Add item
  const [addTab, setAddTab] = useState<"url" | "manual">("url");
  const [urlInput, setUrlInput] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeData, setScrapeData] = useState<ScrapeResult | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [scrapeName, setScrapeName] = useState("");
  const [scrapePrice, setScrapePrice] = useState("");
  const [scrapeNotes, setScrapeNotes] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  // Items
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");
  const [editItemNotes, setEditItemNotes] = useState("");
  const [editItemQuantity, setEditItemQuantity] = useState("1");
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  /* ---------- Data Fetching ---------- */

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch(`/api/wishlists/${wishlistId}`);
      if (!res.ok) {
        setError("Wishlist not found");
        return;
      }
      const data = await res.json();
      setWishlist(data);
    } catch {
      setError("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, [wishlistId]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  /* ---------- Inline Edit Handlers ---------- */

  function startEditTitle() {
    if (!wishlist) return;
    setTitleDraft(wishlist.title);
    setEditingTitle(true);
    setTimeout(() => titleRef.current?.focus(), 0);
  }

  async function saveTitle() {
    setEditingTitle(false);
    if (!wishlist || titleDraft.trim() === wishlist.title) return;
    if (!titleDraft.trim()) return;
    await fetch(`/api/wishlists/${wishlistId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleDraft.trim() }),
    });
    setWishlist({ ...wishlist, title: titleDraft.trim() });
  }

  function startEditDesc() {
    if (!wishlist) return;
    setDescDraft(wishlist.description);
    setEditingDesc(true);
    setTimeout(() => descRef.current?.focus(), 0);
  }

  async function saveDesc() {
    setEditingDesc(false);
    if (!wishlist || descDraft.trim() === wishlist.description) return;
    await fetch(`/api/wishlists/${wishlistId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: descDraft.trim() }),
    });
    setWishlist({ ...wishlist, description: descDraft.trim() });
  }

  /* ---------- Settings ---------- */

  function openSettings() {
    if (!wishlist) return;
    setSettingsType(wishlist.type);
    setSettingsPrivacy(wishlist.privacy);
    setSettingsDate(wishlist.event_date ?? "");
    setShowSettings(true);
  }

  async function saveSettings() {
    if (!wishlist) return;
    const res = await fetch(`/api/wishlists/${wishlistId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: settingsType,
        privacy: settingsPrivacy,
        event_date: settingsDate || null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setWishlist({ ...wishlist, ...updated });
    }
    setShowSettings(false);
  }

  /* ---------- Share ---------- */

  async function handleShare() {
    const res = await fetch(`/api/wishlists/${wishlistId}/share`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      const fullUrl = `${window.location.origin}${data.url}`;
      setShareUrl(fullUrl);
      setShowSharePanel(true);
      setCopied(false);
    }
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function nativeShare() {
    if (navigator.share) {
      navigator.share({
        title: wishlist?.title ?? "My Wishlist",
        url: shareUrl,
      });
    }
  }

  /* ---------- Delete Wishlist ---------- */

  async function handleDeleteWishlist() {
    await fetch(`/api/wishlists/${wishlistId}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  /* ---------- URL Scrape ---------- */

  async function handleScrapeUrl() {
    if (!urlInput.trim()) return;
    setScraping(true);
    setScrapeData(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (res.ok) {
        const data: ScrapeResult = await res.json();
        setScrapeData(data);
        setScrapeName(data.title ?? "");
        setScrapePrice(data.price != null ? String(data.price) : "");
        setSelectedImage(data.images[0] ?? "");
        setScrapeNotes("");
      }
    } catch {
      // ignore
    } finally {
      setScraping(false);
    }
  }

  /* ---------- Add Item ---------- */

  async function addItemFromScrape() {
    if (!scrapeName.trim()) return;
    setAddingItem(true);
    try {
      const res = await fetch(`/api/wishlists/${wishlistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: scrapeName.trim(),
          price: scrapePrice ? parseFloat(scrapePrice) : null,
          url: urlInput.trim(),
          image_url: selectedImage,
          images_json: JSON.stringify(scrapeData?.images ?? []),
          notes: scrapeNotes.trim(),
        }),
      });
      if (res.ok) {
        setUrlInput("");
        setScrapeData(null);
        setScrapeName("");
        setScrapePrice("");
        setScrapeNotes("");
        setSelectedImage("");
        await fetchWishlist();
      }
    } catch {
      // ignore
    } finally {
      setAddingItem(false);
    }
  }

  async function addItemManual() {
    if (!manualName.trim()) return;
    setAddingItem(true);
    try {
      const res = await fetch(`/api/wishlists/${wishlistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: manualName.trim(),
          price: manualPrice ? parseFloat(manualPrice) : null,
          notes: manualNotes.trim(),
        }),
      });
      if (res.ok) {
        setManualName("");
        setManualPrice("");
        setManualNotes("");
        await fetchWishlist();
      }
    } catch {
      // ignore
    } finally {
      setAddingItem(false);
    }
  }

  /* ---------- Item Actions ---------- */

  async function toggleStar(item: WishlistItem) {
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_starred: item.is_starred ? 0 : 1 }),
    });
    if (res.ok) {
      await fetchWishlist();
    }
  }

  function startEditItem(item: WishlistItem) {
    setEditingItemId(item.id);
    setEditItemName(item.name);
    setEditItemPrice(item.price != null ? String(item.price) : "");
    setEditItemNotes(item.notes ?? "");
    setEditItemQuantity(String(item.quantity ?? 1));
  }

  async function saveEditItem() {
    if (!editingItemId || !editItemName.trim()) return;
    await fetch(`/api/items/${editingItemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editItemName.trim(),
        price: editItemPrice ? parseFloat(editItemPrice) : null,
        notes: editItemNotes.trim(),
        quantity: parseInt(editItemQuantity) || 1,
      }),
    });
    setEditingItemId(null);
    await fetchWishlist();
  }

  async function deleteItem() {
    if (!deleteItemId) return;
    await fetch(`/api/items/${deleteItemId}`, { method: "DELETE" });
    setDeleteItemId(null);
    await fetchWishlist();
  }

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-[var(--color-text-muted)]">
          {error || "Wishlist not found"}
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 text-sm text-[var(--color-primary)] hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const filteredItems = showStarredOnly
    ? wishlist.items.filter((i) => i.is_starred)
    : wishlist.items;

  return (
    <div>
      {/* Back link */}
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 flex items-center gap-1 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Dashboard
      </button>

      {/* ===== HEADER SECTION ===== */}
      <div className="mb-8 rounded-xl border border-[var(--color-border)] bg-white p-6">
        {/* Title */}
        <div className="mb-2">
          {editingTitle ? (
            <input
              ref={titleRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === "Enter" && saveTitle()}
              className="w-full border-b-2 border-[var(--color-primary)] bg-transparent text-2xl font-bold text-[var(--color-text)] outline-none"
            />
          ) : (
            <h1
              onClick={startEditTitle}
              className="cursor-pointer text-2xl font-bold text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]"
              title="Click to edit"
            >
              {wishlist.title}
            </h1>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          {editingDesc ? (
            <textarea
              ref={descRef}
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              onBlur={saveDesc}
              rows={2}
              className="w-full border-b-2 border-[var(--color-primary)] bg-transparent text-sm text-[var(--color-text-muted)] outline-none"
            />
          ) : (
            <p
              onClick={startEditDesc}
              className="cursor-pointer text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
              title="Click to edit"
            >
              {wishlist.description || "Add a description..."}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
              typeBadgeColors[wishlist.type] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {wishlist.type}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {privacyLabels[wishlist.privacy] ?? wishlist.privacy}
          </span>
          {wishlist.event_date && (
            <span className="text-xs text-[var(--color-text-muted)]">
              {new Date(wishlist.event_date).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openSettings}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-gray-50"
          >
            Edit Settings
          </button>
          <button
            onClick={handleShare}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-gray-50"
          >
            Share
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Delete List
          </button>
        </div>
      </div>

      {/* ===== SHARE PANEL ===== */}
      {showSharePanel && (
        <div className="mb-8 rounded-xl border border-[var(--color-border)] bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Share Link</h3>
            <button
              onClick={() => setShowSharePanel(false)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-gray-50 px-3 py-2 text-sm text-[var(--color-text)]"
            />
            <button
              onClick={copyShareLink}
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                onClick={nativeShare}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-gray-50"
              >
                Share
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION ===== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
              Delete this wishlist?
            </h3>
            <p className="mb-5 text-sm text-[var(--color-text-muted)]">
              This will move the list to Recently Deleted. You can restore it from the dashboard.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWishlist}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SETTINGS MODAL ===== */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
              Edit Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Type
                </label>
                <select
                  value={settingsType}
                  onChange={(e) => setSettingsType(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
                >
                  <option value="wishlist">Wishlist</option>
                  <option value="registry">Registry</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Privacy
                </label>
                <select
                  value={settingsPrivacy}
                  onChange={(e) => setSettingsPrivacy(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
                >
                  <option value="public">Public</option>
                  <option value="friends_only">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Event Date
                </label>
                <input
                  type="date"
                  value={settingsDate}
                  onChange={(e) => setSettingsDate(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD ITEM SECTION ===== */}
      <div className="mb-8 rounded-xl border border-[var(--color-border)] bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
          Add Item
        </h2>

        {/* Tab toggle */}
        <div className="mb-4 flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setAddTab("url")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              addTab === "url"
                ? "bg-white text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Paste URL
          </button>
          <button
            onClick={() => setAddTab("manual")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              addTab === "manual"
                ? "bg-white text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Add Manually
          </button>
        </div>

        {/* URL Tab */}
        {addTab === "url" && (
          <div>
            <div className="mb-4 flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/product..."
                onKeyDown={(e) => e.key === "Enter" && handleScrapeUrl()}
                className="flex-1 rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-sm transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
              <button
                onClick={handleScrapeUrl}
                disabled={scraping || !urlInput.trim()}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
              >
                {scraping ? "Loading..." : "Add"}
              </button>
            </div>

            {/* Scrape preview */}
            {scrapeData && (
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
                {/* Image picker */}
                {scrapeData.images.length > 0 && (
                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-medium text-[var(--color-text-muted)]">
                      Choose image
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {scrapeData.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(img)}
                          className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                            selectedImage === img
                              ? "border-[var(--color-primary)]"
                              : "border-transparent hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={img}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <input
                    value={scrapeName}
                    onChange={(e) => setScrapeName(e.target.value)}
                    placeholder="Item name"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
                  />
                  <input
                    value={scrapePrice}
                    onChange={(e) => setScrapePrice(e.target.value)}
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
                  />
                  <textarea
                    value={scrapeNotes}
                    onChange={(e) => setScrapeNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    rows={2}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
                  />
                  <button
                    onClick={addItemFromScrape}
                    disabled={addingItem || !scrapeName.trim()}
                    className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                  >
                    {addingItem ? "Saving..." : "Save to List"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Tab */}
        {addTab === "manual" && (
          <div className="space-y-3">
            <input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Item name *"
              className="w-full rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-sm transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
            <input
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value)}
              placeholder="Price (optional)"
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-sm transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
            <textarea
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-sm transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
            <button
              onClick={addItemManual}
              disabled={addingItem || !manualName.trim()}
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
            >
              {addingItem ? "Adding..." : "Add Item"}
            </button>
          </div>
        )}
      </div>

      {/* ===== ITEMS LIST ===== */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Items ({wishlist.items.length})
          </h2>
          <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={showStarredOnly}
              onChange={(e) => setShowStarredOnly(e.target.checked)}
              className="accent-[var(--color-primary)]"
            />
            Starred only
          </label>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] py-10 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              {showStarredOnly
                ? "No starred items yet."
                : "No items yet. Add one above!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[var(--color-border)] bg-white p-4 transition-all hover:border-rose-200"
              >
                {editingItemId === item.id ? (
                  /* Inline edit mode */
                  <div className="space-y-3">
                    <input
                      value={editItemName}
                      onChange={(e) => setEditItemName(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
                      placeholder="Name"
                    />
                    <div className="flex gap-3">
                      <input
                        value={editItemPrice}
                        onChange={(e) => setEditItemPrice(e.target.value)}
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        className="w-32 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
                      />
                      <input
                        value={editItemQuantity}
                        onChange={(e) => setEditItemQuantity(e.target.value)}
                        type="number"
                        min="1"
                        placeholder="Qty"
                        className="w-20 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
                      />
                    </div>
                    <textarea
                      value={editItemNotes}
                      onChange={(e) => setEditItemNotes(e.target.value)}
                      rows={2}
                      placeholder="Notes"
                      className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEditItem}
                        className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingItemId(null)}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate font-medium text-[var(--color-text)]">
                              {item.name}
                            </h3>
                            {item.quantity > 1 && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                x{item.quantity}
                              </span>
                            )}
                            {item.is_starred ? (
                              <StarIcon filled />
                            ) : null}
                          </div>
                          {item.price != null && (
                            <p className="text-sm font-medium text-[var(--color-primary)]">
                              ${Number(item.price).toFixed(2)}
                            </p>
                          )}
                          {item.notes && (
                            <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                              {item.notes}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-shrink-0 items-center gap-1">
                          <button
                            onClick={() => toggleStar(item)}
                            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                            title={item.is_starred ? "Unstar" : "Star"}
                          >
                            <StarIcon filled={!!item.is_starred} />
                          </button>
                          <button
                            onClick={() => startEditItem(item)}
                            className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-gray-100 hover:text-[var(--color-text)]"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteItemId(item.id)}
                            className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== DELETE ITEM CONFIRMATION ===== */}
      {deleteItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
              Delete this item?
            </h3>
            <p className="mb-5 text-sm text-[var(--color-text-muted)]">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteItemId(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteItem}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
