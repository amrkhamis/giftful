"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setDisplayName(data.user.displayName || "");
          setPrivacy(data.user.defaultPrivacy || "public");
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast("");

    try {
      const res = await fetch("/api/auth/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          defaultPrivacy: privacy,
        }),
      });

      if (res.ok) {
        setToast("Settings saved successfully!");
      } else {
        setToast("Failed to save settings. Please try again.");
      }
    } catch {
      setToast("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(""), 3000);
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
    <div className="mx-auto max-w-lg">
      <h1 className="mb-8 text-2xl font-bold text-[var(--color-text)]">
        Settings
      </h1>

      {toast && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-sm ${
            toast.includes("success")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {toast}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Display Name */}
        <div>
          <label
            htmlFor="displayName"
            className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-sm transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>

        {/* Default Privacy */}
        <div>
          <label className="mb-3 block text-sm font-medium text-[var(--color-text)]">
            Default Privacy for New Lists
          </label>
          <div className="space-y-2.5">
            {[
              {
                value: "public",
                label: "Public",
                desc: "Anyone with the link can view",
              },
              {
                value: "friends_only",
                label: "Friends Only",
                desc: "Only your friends can view",
              },
              {
                value: "private",
                label: "Private",
                desc: "Only you can see this list",
              },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                  privacy === opt.value
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                    : "border-[var(--color-border)] hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  value={opt.value}
                  checked={privacy === opt.value}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="mt-0.5 accent-[var(--color-primary)]"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--color-text)]">
                    {opt.label}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {opt.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
