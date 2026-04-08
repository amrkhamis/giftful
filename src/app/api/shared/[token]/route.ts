import { store } from "@/lib/mock-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const shareLink = store.shareLinks.find((sl) => sl.token === token);
  if (!shareLink) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const wishlist = store.wishlists.find(
    (w) => w.id === shareLink.wishlist_id && !w.deleted_at
  );
  if (!wishlist) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const owner = store.users.find((u) => u.id === wishlist.user_id);

  const items = store.items
    .filter((i) => i.wishlist_id === wishlist.id)
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
    .map((item) => ({
      ...item,
      is_claimed: store.claims.some((c) => c.item_id === item.id),
    }));

  return Response.json({
    wishlist: {
      ...wishlist,
      owner_display_name: owner?.display_name ?? null,
    },
    items,
  });
}
