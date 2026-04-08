export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
            Giftful
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Share wishlists with the people you love
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
