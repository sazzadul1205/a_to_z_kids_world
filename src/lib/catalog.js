import { resolveImageUrl } from "./api";

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