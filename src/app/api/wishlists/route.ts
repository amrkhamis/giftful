import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function GET(request: NextRequest) {
  const user = await requireAuth();
  const showDeleted = request.nextUrl.searchParams.get("deleted") === "1";

  const wishlists = store.wishlists
    .filter((w) => w.user_id === user.id && (showDeleted ? w.deleted_at !== null : w.deleted_at === null))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((w) => ({
      ...w,
      item_count: store.items.filter((i) => i.wishlist_id === w.id).length,
    }));

  return Response.json(wishlists);
}

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  const body = await request.json();
  const { title, description, type, privacy, event_date } = body;

  if (!title || typeof title !== "string") {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const activeWishlists = store.wishlists.filter(
    (w) => w.user_id === user.id && w.deleted_at === null
  );
  const nextOrder = activeWishlists.length > 0
    ? Math.max(...activeWishlists.map((w) => w.sort_order)) + 1
    : 0;

  const wishlist = {
    id: store.genId("wl"),
    user_id: user.id,
    title,
    description: description ?? "",
    type: type ?? "wishlist",
    privacy: privacy ?? "public",
    event_date: event_date ?? null,
    sort_order: nextOrder,
    deleted_at: null,
    created_at: new Date().toISOString(),
  };

  store.wishlists.push(wishlist);

  return Response.json(wishlist, { status: 201 });
}
