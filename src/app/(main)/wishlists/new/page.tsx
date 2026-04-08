"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewWishlistPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("wishlist");
  const [privacy, setPrivacy] = useState("public");
  const [eventDate, setEventDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type,
          privacy,
          event_date: eventDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create wishlist");
        return;
      }

      const wishlist = await res.json();
      router.push(`/wishlists/${wishlist.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 flex items-center gap-1 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        Back to Dashboard
      </button>

      <h1 className="mb-8 text-2xl font-bold text-[var(--color-text)]">
        Create New Wishlist
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
          >
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Birthday Wishes, Wedding Registry"
            className="w-full rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-sm transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Add a note for your friends..."
            className="w-full rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-sm transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>

        {/* Type */}
        <div>
          <label
            htmlFor="type"
            className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
          >
            Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-sm transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
          >
            <option value="wishlist">Wishlist</option>
            <option value="registry">Registry</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        {/* Privacy */}
        <div>
          <label
            htmlFor="privacy"
            className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
          >
            Privacy
          </label>
          <select
            id="privacy"
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-sm transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
          >
            <option value="public">Public</option>
            <option value="friends_only">Friends Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Event Date */}
        <div>
          <label
            htmlFor="event_date"
            className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
          >
            Event Date{" "}
            <span className="text-[var(--color-text-muted)]">(optional)</span>
          </label>
          <input
            id="event_date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-sm transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Wishlist"}
        </button>
      </form>
    </div>
  );
}
