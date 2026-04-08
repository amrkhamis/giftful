import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function GET() {
  const user = await requireAuth();

  const followedUserIds = store.follows
    .filter((f) => f.follower_id === user.id)
    .map((f) => f.following_id);

  const result = followedUserIds.map((followedId) => {
    const followedUser = store.users.find((u) => u.id === followedId);
    if (!followedUser) return null;

    const wishlists = store.wishlists
      .filter(
        (w) =>
          w.user_id === followedId &&
          !w.deleted_at &&
          w.privacy === "public"
      )
      .sort((a, b) => a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at));

    return {
      user: {
        id: followedUser.id,
        email: followedUser.email,
        display_name: followedUser.display_name,
        privacy_setting: followedUser.privacy_setting,
      },
      wishlists,
    };
  }).filter(Boolean);

  return Response.json(result);
}
