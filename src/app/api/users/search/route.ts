import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function GET(request: Request) {
  const user = await requireAuth();
  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  if (!q || q.trim().length === 0) {
    return Response.json([]);
  }

  const lower = q.toLowerCase();

  const results = store.users
    .filter(
      (u) =>
        u.id !== user.id &&
        (u.display_name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower))
    )
    .slice(0, 20)
    .map((u) => ({
      id: u.id,
      display_name: u.display_name,
      email: u.email,
      privacy_setting: u.privacy_setting,
    }));

  return Response.json(results);
}
