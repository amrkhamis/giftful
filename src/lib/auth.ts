import { cookies } from "next/headers";
import { store } from "./mock-store";

export interface SessionUser {
  id: string;
  email: string;
  display_name: string;
  privacy_setting: string;
}

const SESSION_COOKIE = "giftful_session";

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  const user = store.users.find((u) => u.id === userId);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    privacy_setting: user.privacy_setting,
  };
}

export async function setSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");
  return user;
}
