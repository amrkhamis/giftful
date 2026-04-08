import { setSession } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function POST(request: Request) {
  const { email, password, display_name } = await request.json();

  if (!email || !password || !display_name) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (store.users.find((u) => u.email === email)) {
    return Response.json({ error: "Email already in use" }, { status: 409 });
  }

  const user = {
    id: store.genId("user"),
    email,
    password,
    display_name,
    privacy_setting: "public",
    created_at: new Date().toISOString(),
  };
  store.users.push(user);
  await setSession(user.id);

  return Response.json({ user: { id: user.id, email, display_name } }, { status: 201 });
}
