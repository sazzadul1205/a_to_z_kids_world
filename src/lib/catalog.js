import { resolveImageUrl } from "./api";

// The "all categories" state is a sentinel compared with === and round-tripped
// through ?category=. It stays a stable English string so URLs and equality
// checks keep working regardless of the display language; the label the visitor
// actually reads comes from the locale dictionary via ui.categories.allToys.
export const ALL_TOYS = "All toys";

// Products only carry a categoryId, so the name is resolved from the category list.
export function makeCategoryLookup(categories) {
  const byId = new Map();
  for (const category of categories) byId.set(String(category._id), category);
  return {
    byId,
    nameOf: (categoryId) => byId.get(String(categoryId))?.name ?? "",
    categoryOf: (categoryId) => byId.get(String(categoryId)) ?? null,
  };
}

export function mapProduct(raw, lookup) {
  if (!raw) return null;
  return {
    _id: raw._id,
    name: raw.name ?? "",
    description: raw.description ?? "",
    price: Number(raw.price ?? 0),
    stock: Number(raw.stock ?? 0),
    categoryId: raw.categoryId ?? "",
    category: lookup?.nameOf(raw.categoryId) ?? "",
    image: resolveImageUrl(raw.image),
    // Kept so admin forms can write the stored path back untouched.
    rawImage: raw.image ?? "",
    age: raw.details?.age ?? "",
    includes: raw.details?.includes ?? "",
    createdAt: raw.createdAt,
  };
}