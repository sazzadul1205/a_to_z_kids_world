import { useQuery } from "@tanstack/react-query";
import { reviewsApi } from "../lib/api";
import { CATALOG_STALE_TIME, queryKeys } from "../lib/queryKeys";

// A product view needs both the list and the aggregate, and the badge shows the
// count as soon as either lands, so they are separate cached queries rather than
// one combined fetch. The previous implementation fetched them in one request
// and waited for both.
export function useProductReviews(productId) {
  const enabled = Boolean(productId);

  const list = useQuery({
    queryKey: queryKeys.productReviews(productId),
    queryFn: ({ signal }) => reviewsApi.list({ productId }, signal),
    enabled,
    staleTime: CATALOG_STALE_TIME,
  });

  const summary = useQuery({
    queryKey: queryKeys.reviewSummary(productId),
    queryFn: ({ signal }) => reviewsApi.summary(productId, signal),
    enabled,
    staleTime: CATALOG_STALE_TIME,
  });

  const isPending = list.isPending || summary.isPending;
  const isError = list.isError || summary.isError;
  // Either list failing leaves the modal without a trustworthy rating, so the
  // error is surfaced once rather than per query.
  const error = list.error ?? summary.error ?? null;

  return {
    reviews: list.data ?? [],
    summary: summary.data ?? null,
    status: !enabled ? "idle" : isError ? "error" : isPending ? "loading" : "ready",
    error,
    reload: async () => {
      await Promise.all([list.refetch(), summary.refetch()]);
    },
  };
}
