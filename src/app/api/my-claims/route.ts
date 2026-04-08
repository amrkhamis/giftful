import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function GET() {
  try {
    const user = await requireAuth();

    const claims = store.claims
      .filter((c) => c.claimer_user_id === user.id)
      .sort((a, b) => b.claimed_at.localeCompare(a.claimed_at))
      .map((claim) => {
        const item = store.items.find((i) => i.id === claim.item_id);
        const wishlist = item
          ? store.wishlists.find((w) => w.id === item.wishlist_id)
          : null;

        return {
          claim_id: claim.id,
          claimed_at: claim.claimed_at,
          item_id: item?.id ?? null,
          item_name: item?.name ?? null,
          price: item?.price ?? null,
          url: item?.url ?? null,
          image_url: item?.image_url ?? null,
          quantity: item?.quantity ?? null,
          wishlist_id: wishlist?.id ?? null,
          wishlist_title: wishlist?.title ?? null,
          wishlist_owner_id: wishlist?.user_id ?? null,
        };
      });

    return Response.json(claims);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
