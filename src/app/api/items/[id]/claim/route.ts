import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  const { id: itemId } = await params;
  const body = await request.json();

  const item = store.items.find((i) => i.id === itemId);
  if (!item) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  const wishlist = store.wishlists.find(
    (w) => w.id === item.wishlist_id && w.deleted_at === null
  );
  if (!wishlist) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  // Prevent owner from claiming their own items
  if (user && wishlist.user_id === user.id) {
    return Response.json({ error: "Cannot claim your own item" }, { status: 403 });
  }

  // If not logged in, require guest info
  if (!user) {
    if (!body.guest_name || !body.guest_email) {
      return Response.json(
        { error: "Guest name and email are required" },
        { status: 400 }
      );
    }
  }

  // Check if already claimed
  const existingClaim = store.claims.find((c) => c.item_id === itemId);
  if (existingClaim) {
    return Response.json({ error: "Item is already claimed" }, { status: 409 });
  }

  const claim = {
    id: store.genId("claim"),
    item_id: itemId,
    claimer_user_id: user?.id ?? null,
    claimer_guest_name: body.guest_name ?? null,
    claimer_guest_email: body.guest_email ?? null,
    claimed_at: new Date().toISOString(),
  };

  store.claims.push(claim);

  return Response.json(claim, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  const { id: itemId } = await params;

  const claim = store.claims.find((c) => c.item_id === itemId);
  if (!claim) {
    return Response.json({ error: "No claim found" }, { status: 404 });
  }

  // Check if the requester is the claimer
  let authorized = false;

  if (user && claim.claimer_user_id === user.id) {
    authorized = true;
  }

  if (!authorized) {
    const body = await request.json().catch(() => ({}));
    if (body.guest_email && claim.claimer_guest_email === body.guest_email) {
      authorized = true;
    }
  }

  if (!authorized) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const idx = store.claims.indexOf(claim);
  store.claims.splice(idx, 1);

  return Response.json({ success: true });
}
