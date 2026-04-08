// In-memory mock data store — no database needed
// All data resets on server restart

export interface User {
  id: string;
  email: string;
  password: string;
  display_name: string;
  privacy_setting: string;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  privacy: string;
  event_date: string | null;
  sort_order: number;
  deleted_at: string | null;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  name: string;
  price: number | null;
  url: string;
  image_url: string;
  images_json: string;
  notes: string;
  quantity: number;
  is_starred: number;
  sort_order: number;
  created_at: string;
}

export interface Claim {
  id: string;
  item_id: string;
  claimer_user_id: string | null;
  claimer_guest_name: string | null;
  claimer_guest_email: string | null;
  claimed_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
}

export interface ShareLink {
  id: string;
  wishlist_id: string;
  token: string;
}

// --- Seed data ---
const now = new Date().toISOString();

const demoUser: User = {
  id: "user-demo-001",
  email: "demo@giftful.app",
  password: "demo1234",
  display_name: "Demo User",
  privacy_setting: "public",
  created_at: now,
};

const friendUser: User = {
  id: "user-friend-001",
  email: "sarah@example.com",
  password: "pass1234",
  display_name: "Sarah Ahmed",
  privacy_setting: "public",
  created_at: now,
};

const friendUser2: User = {
  id: "user-friend-002",
  email: "omar@example.com",
  password: "pass1234",
  display_name: "Omar Khalid",
  privacy_setting: "public",
  created_at: now,
};

const seedWishlists: Wishlist[] = [
  {
    id: "wl-001",
    user_id: "user-demo-001",
    title: "Birthday Wishlist 🎂",
    description: "My 30th birthday is coming up! Here are some things I'd love.",
    type: "wishlist",
    privacy: "public",
    event_date: "2026-05-15",
    sort_order: 0,
    deleted_at: null,
    created_at: now,
  },
  {
    id: "wl-002",
    user_id: "user-demo-001",
    title: "Wedding Registry 💍",
    description: "Our wedding registry — thank you for celebrating with us!",
    type: "registry",
    privacy: "public",
    event_date: "2026-08-20",
    sort_order: 1,
    deleted_at: null,
    created_at: now,
  },
  {
    id: "wl-003",
    user_id: "user-demo-001",
    title: "Personal Reading List",
    description: "Books I want to read this year",
    type: "personal",
    privacy: "private",
    event_date: null,
    sort_order: 2,
    deleted_at: null,
    created_at: now,
  },
  {
    id: "wl-deleted-001",
    user_id: "user-demo-001",
    title: "Old Holiday List",
    description: "From last year",
    type: "wishlist",
    privacy: "public",
    event_date: null,
    sort_order: 3,
    deleted_at: "2026-04-01T00:00:00.000Z",
    created_at: now,
  },
  // Friend wishlists
  {
    id: "wl-friend-001",
    user_id: "user-friend-001",
    title: "Eid Gift Ideas 🌙",
    description: "Things I'd love for Eid this year",
    type: "wishlist",
    privacy: "public",
    event_date: "2026-06-15",
    sort_order: 0,
    deleted_at: null,
    created_at: now,
  },
  {
    id: "wl-friend-002",
    user_id: "user-friend-002",
    title: "Gaming Setup Upgrade",
    description: "Building the ultimate gaming corner",
    type: "wishlist",
    privacy: "public",
    event_date: null,
    sort_order: 0,
    deleted_at: null,
    created_at: now,
  },
];

const seedItems: WishlistItem[] = [
  {
    id: "item-001",
    wishlist_id: "wl-001",
    name: "Apple AirPods Pro 2",
    price: 249.99,
    url: "https://apple.com/airpods-pro",
    image_url: "https://picsum.photos/seed/airpods/400/400",
    images_json: "[]",
    notes: "Space Black color preferred",
    quantity: 1,
    is_starred: 1,
    sort_order: 0,
    created_at: now,
  },
  {
    id: "item-002",
    wishlist_id: "wl-001",
    name: "Kindle Paperwhite",
    price: 149.99,
    url: "https://amazon.com/kindle",
    image_url: "https://picsum.photos/seed/kindle/400/400",
    images_json: "[]",
    notes: "The 2024 model with larger screen",
    quantity: 1,
    is_starred: 0,
    sort_order: 1,
    created_at: now,
  },
  {
    id: "item-003",
    wishlist_id: "wl-001",
    name: "Nike Air Max 90",
    price: 130.0,
    url: "https://nike.com/air-max-90",
    image_url: "https://picsum.photos/seed/nike/400/400",
    images_json: "[]",
    notes: "Size 10, white/grey colorway",
    quantity: 1,
    is_starred: 1,
    sort_order: 2,
    created_at: now,
  },
  {
    id: "item-004",
    wishlist_id: "wl-001",
    name: "Lego Architecture Set — Dubai",
    price: 59.99,
    url: "https://lego.com/architecture-dubai",
    image_url: "https://picsum.photos/seed/lego/400/400",
    images_json: "[]",
    notes: "",
    quantity: 1,
    is_starred: 0,
    sort_order: 3,
    created_at: now,
  },
  {
    id: "item-005",
    wishlist_id: "wl-002",
    name: "Le Creuset Dutch Oven",
    price: 380.0,
    url: "https://lecreuset.com/dutch-oven",
    image_url: "https://picsum.photos/seed/lecreuset/400/400",
    images_json: "[]",
    notes: "5.5 Qt, color: Flame",
    quantity: 1,
    is_starred: 1,
    sort_order: 0,
    created_at: now,
  },
  {
    id: "item-006",
    wishlist_id: "wl-002",
    name: "Dyson V15 Vacuum",
    price: 749.99,
    url: "https://dyson.com/v15",
    image_url: "https://picsum.photos/seed/dyson/400/400",
    images_json: "[]",
    notes: "",
    quantity: 1,
    is_starred: 0,
    sort_order: 1,
    created_at: now,
  },
  {
    id: "item-007",
    wishlist_id: "wl-002",
    name: "Nespresso Vertuo Next",
    price: 179.0,
    url: "https://nespresso.com/vertuo",
    image_url: "https://picsum.photos/seed/nespresso/400/400",
    images_json: "[]",
    notes: "Matte Black finish",
    quantity: 1,
    is_starred: 1,
    sort_order: 2,
    created_at: now,
  },
  {
    id: "item-008",
    wishlist_id: "wl-003",
    name: "Atomic Habits by James Clear",
    price: 16.99,
    url: "https://amazon.com/atomic-habits",
    image_url: "https://picsum.photos/seed/atomic/400/400",
    images_json: "[]",
    notes: "Hardcover edition",
    quantity: 1,
    is_starred: 0,
    sort_order: 0,
    created_at: now,
  },
  // Friend items
  {
    id: "item-f001",
    wishlist_id: "wl-friend-001",
    name: "Bakhoor Incense Set",
    price: 45.0,
    url: "https://example.com/bakhoor",
    image_url: "https://picsum.photos/seed/bakhoor/400/400",
    images_json: "[]",
    notes: "Traditional Arabic scents",
    quantity: 1,
    is_starred: 1,
    sort_order: 0,
    created_at: now,
  },
  {
    id: "item-f002",
    wishlist_id: "wl-friend-001",
    name: "Prayer Mat — Premium",
    price: 89.0,
    url: "https://example.com/prayer-mat",
    image_url: "https://picsum.photos/seed/prayermat/400/400",
    images_json: "[]",
    notes: "Memory foam, travel-friendly",
    quantity: 1,
    is_starred: 0,
    sort_order: 1,
    created_at: now,
  },
  {
    id: "item-f003",
    wishlist_id: "wl-friend-002",
    name: "PlayStation 5 DualSense Controller",
    price: 69.99,
    url: "https://playstation.com/dualsense",
    image_url: "https://picsum.photos/seed/ps5/400/400",
    images_json: "[]",
    notes: "Midnight Black color",
    quantity: 2,
    is_starred: 1,
    sort_order: 0,
    created_at: now,
  },
];

const seedClaims: Claim[] = [
  {
    id: "claim-001",
    item_id: "item-002",
    claimer_user_id: "user-friend-001",
    claimer_guest_name: null,
    claimer_guest_email: null,
    claimed_at: now,
  },
];

const seedFollows: Follow[] = [
  { follower_id: "user-demo-001", following_id: "user-friend-001" },
];

const seedShareLinks: ShareLink[] = [
  { id: "sl-001", wishlist_id: "wl-001", token: "birthday-demo" },
  { id: "sl-002", wishlist_id: "wl-friend-001", token: "eid-gifts" },
];

// --- Store ---
class MockStore {
  users: User[] = [demoUser, friendUser, friendUser2];
  wishlists: Wishlist[] = [...seedWishlists];
  items: WishlistItem[] = [...seedItems];
  claims: Claim[] = [...seedClaims];
  follows: Follow[] = [...seedFollows];
  shareLinks: ShareLink[] = [...seedShareLinks];

  private nextId = 100;
  genId(prefix = "gen") {
    return `${prefix}-${++this.nextId}`;
  }
}

// Singleton
const globalStore = globalThis as unknown as { __mockStore?: MockStore };
if (!globalStore.__mockStore) {
  globalStore.__mockStore = new MockStore();
}

export const store = globalStore.__mockStore;
