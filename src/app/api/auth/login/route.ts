import { setSession } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const user = store.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await setSession(user.id);
  return Response.json({ user: { id: user.id, email: user.email, display_name: user.display_name } });
}
