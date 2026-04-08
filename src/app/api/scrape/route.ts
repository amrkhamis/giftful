import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    // Extract domain name for a fake title
    let domain: string;
    try {
      const parsed = new URL(url);
      domain = parsed.hostname.replace(/^www\./, "");
    } catch {
      domain = "example.com";
    }

    const titleParts = domain.split(".");
    const siteName = titleParts[0].charAt(0).toUpperCase() + titleParts[0].slice(1);

    // Generate a random price between $9.99 and $199.99
    const price = Math.round((Math.random() * 190 + 9.99) * 100) / 100;

    // Return 3 placeholder images from picsum.photos with deterministic seeds
    const seed = Math.floor(Math.random() * 1000);
    const images = [
      `https://picsum.photos/seed/${seed}/400/400`,
      `https://picsum.photos/seed/${seed + 1}/400/400`,
      `https://picsum.photos/seed/${seed + 2}/400/400`,
    ];

    return Response.json({
      title: `Product from ${siteName}`,
      price,
      images,
    });
  } catch {
    return Response.json({ error: "Failed to scrape URL" }, { status: 500 });
  }
}
