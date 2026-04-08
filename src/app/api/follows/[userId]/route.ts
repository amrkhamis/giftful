import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const user = await requireAuth();
  const { userId } = await params;

  if (userId === user.id) {
    return Response.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const targetUser = store.users.find((u) => u.id === userId);
  if (!targetUser) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const existing = store.follows.find(
    (f) => f.follower_id === user.id && f.following_id === userId
  );
  if (!existing) {
    store.follows.push({ follower_id: user.id, following_id: userId });
  }

  return Response.json({ success: true }, { status: 201 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const user = await requireAuth();
  const { userId } = await params;

  const idx = store.follows.findIndex(
    (f) => f.follower_id === user.id && f.following_id === userId
  );
  if (idx !== -1) {
    store.follows.splice(idx, 1);
  }

  return Response.json({ success: true }, { status: 200 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const user = await requireAuth();
  const { userId } = await params;

  const following = store.follows.some(
    (f) => f.follower_id === user.id && f.following_id === userId
  );

  return Response.json({ following });
}
