import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const allowed = ["display_name", "privacy_setting"] as const;
    const storeUser = store.users.find((u) => u.id === user.id);

    if (!storeUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    let updated = false;
    for (const key of allowed) {
      if (key in body) {
        (storeUser as unknown as Record<string, unknown>)[key] = body[key];
        updated = true;
      }
    }

    if (!updated) {
      return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }

    return Response.json({
      user: {
        id: storeUser.id,
        email: storeUser.email,
        display_name: storeUser.display_name,
        privacy_setting: storeUser.privacy_setting,
      },
    });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
