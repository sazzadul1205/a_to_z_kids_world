// One place to build every cache key. Invalidation depends on these matching
// exactly, so callers never assemble a key by hand.
export const queryKeys = {
  categories: ["categories"],
  products: ["products"],
  catalog: ["catalog"],
  product: (id) => ["products", id],
  reviews: ["reviews"],
  productReviews: (productId) => ["reviews", { productId }],
  reviewSummary: (productId) => ["reviews", "summary", productId],
  settings: ["settings"],
  reviewSettings: ["settings", "reviews"],
  orders: ["orders"],
  users: ["users"],
  session: ["session"],
};

// The catalogue changes only when an admin edits it, so holding it briefly stops
// every mounted consumer from refetching the same two lists on each navigation.
export const CATALOG_STALE_TIME = 60_000;

// Reviews and orders are moderation surfaces where a stale list means editing
// the wrong record, so they are always refetched on mount.
export const ADMIN_STALE_TIME = 0;
