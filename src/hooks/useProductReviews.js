import { useCallback } from "react";
import { reviewsApi } from "../lib/api";
import { useResource } from "./useResource";

// Review summaries and lists live on separate endpoints, so they load together
// and only once a product is actually open.
export function useProductReviews(productId) {
  const fetcher = useCallback(
    ({ signal }) =>
      productId
        ? Promise.all([
            reviewsApi.list({ productId }, { signal }),
            reviewsApi.summary(productId, { signal }),
          ]).then(([reviews, summary]) => ({ reviews: reviews ?? [], summary }))
        : Promise.resolve(null),
    [productId],
  );

  const { status, error, data, reload } = useResource(fetcher);

  return {
    reviews: data?.reviews ?? [],
    summary: data?.summary ?? null,
    status: productId ? status : "idle",
    error,
    reload,
  };
}