import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  const { id: wishlistId } = await params;

  const wishlist = store.wishlists.find(
    (w) => w.id === wishlistId && w.deleted_at === null
  );

  if (!wishlist) {
    return Response.json({ error: "Wishlist not found" }, { status: 404 });
  }

  if (wishlist.user_id !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, price, url, image_url, images_json, notes, quantity, is_starred } = body;

  if (!name || typeof name !== "string") {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const existing = store.items.filter((i) => i.wishlist_id === wishlistId);
  const nextOrder = existing.length > 0
    ? Math.max(...existing.map((i) => i.sort_order)) + 1
    : 0;

  const item = {
    id: store.genId("item"),
    wishlist_id: wishlistId,
    name,
    price: price ?? null,
    url: url ?? "",
    image_url: image_url ?? "",
    images_json: images_json ?? "[]",
    notes: notes ?? "",
    quantity: quantity ?? 1,
    is_starred: is_starred ?? 0,
    sort_order: nextOrder,
    created_at: new Date().toISOString(),
  };

  store.items.push(item);

  return Response.json(item, { status: 201 });
}
