import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/mock-store";
import { nanoid } from "nanoid";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  const { id } = await params;

  const wishlist = store.wishlists.find(
    (w) => w.id === id && w.deleted_at === null
  );

  if (!wishlist) {
    return Response.json({ error: "Wishlist not found" }, { status: 404 });
  }

  if (wishlist.user_id !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = store.shareLinks.find((sl) => sl.wishlist_id === id);

  if (existing) {
    return Response.json({
      token: existing.token,
      url: `/shared/${existing.token}`,
    });
  }

  const token = nanoid(12);
  const link = {
    id: store.genId("sl"),
    wishlist_id: id,
    token,
  };

  store.shareLinks.push(link);

  return Response.json({ token, url: `/shared/${token}` });
}
