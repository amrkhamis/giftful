import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  const { id } = await params;

  const item = store.items.find((i) => i.id === id);
  if (!item) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  const wishlist = store.wishlists.find((w) => w.id === item.wishlist_id);
  if (!wishlist || wishlist.user_id !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const allowed = ["name", "price", "url", "image_url", "notes", "quantity", "is_starred"];
  let updated = false;

  for (const key of allowed) {
    if (key in body) {
      (item as unknown as Record<string, unknown>)[key] = body[key];
      updated = true;
    }
  }

  if (!updated) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  return Response.json(item);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  const { id } = await params;

  const item = store.items.find((i) => i.id === id);
  if (!item) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  const wishlist = store.wishlists.find((w) => w.id === item.wishlist_id);
  if (!wishlist || wishlist.user_id !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const idx = store.items.indexOf(item);
  store.items.splice(idx, 1);

  return Response.json({ success: true });
}
