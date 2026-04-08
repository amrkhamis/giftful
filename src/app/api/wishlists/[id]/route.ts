import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  const { id } = await params;

  const wishlist = store.wishlists.find((w) => w.id === id && w.deleted_at === null);

  if (!wishlist) {
    return Response.json({ error: "Wishlist not found" }, { status: 404 });
  }

  const isOwner = wishlist.user_id === user.id;
  const rawItems = store.items
    .filter((i) => i.wishlist_id === id)
    .sort((a, b) => a.sort_order - b.sort_order);

  let items;
  if (isOwner) {
    items = rawItems;
  } else {
    items = rawItems.map((item) => {
      const claim = store.claims.find((c) => c.item_id === item.id);
      return {
        ...item,
        is_claimed: !!claim,
        claimer_user_id: claim?.claimer_user_id ?? null,
        claimer_guest_name: claim?.claimer_guest_name ?? null,
      };
    });
  }

  return Response.json({ ...wishlist, items });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  const { id } = await params;

  const wishlist = store.wishlists.find((w) => w.id === id);

  if (!wishlist) {
    return Response.json({ error: "Wishlist not found" }, { status: 404 });
  }

  if (wishlist.user_id !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const allowed = ["title", "description", "type", "privacy", "event_date", "deleted_at"];
  let updated = false;

  for (const key of allowed) {
    if (key in body) {
      (wishlist as unknown as Record<string, unknown>)[key] = body[key];
      updated = true;
    }
  }

  if (!updated) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  return Response.json(wishlist);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  const { id } = await params;

  const wishlist = store.wishlists.find((w) => w.id === id && w.deleted_at === null);

  if (!wishlist) {
    return Response.json({ error: "Wishlist not found" }, { status: 404 });
  }

  if (wishlist.user_id !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  wishlist.deleted_at = new Date().toISOString();

  return Response.json({ success: true });
}
