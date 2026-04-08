import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold text-[var(--color-primary)]">
          Giftful
        </span>
        <Link
          href="/login"
          className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          Log In
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex items-center rounded-full bg-rose-50 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)]">
            Never give a bad gift again
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
            Create &amp; Share
            <span className="block text-[var(--color-primary)]">
              Wishlists
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-[var(--color-text-muted)]">
            Share your gift ideas with friends and family. Coordinate who is
            buying what, avoid duplicates, and make every occasion special.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-primary)] px-8 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[var(--color-border)] px-8 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-gray-50"
            >
              Log In
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-[var(--color-text-muted)]">
        Giftful &mdash; Thoughtful gifting made simple.
      </footer>
    </div>
  );
}
