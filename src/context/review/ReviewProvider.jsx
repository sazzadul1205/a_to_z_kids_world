import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReviewContext } from "./review-context";
import { reviewsApi } from "../../lib/api";
import { queryKeys } from "../../lib/queryKeys";

const EMPTY_DRAFT = { name: "", rating: 5, comment: "" };

// The review system is app-global rather than local to the product
// modal: the draft, the submission state, and the mutation all live
// here, so every surface reads (and resets) the same values.
export function ReviewProvider({ children }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  // A published review changes both the per-product list and the
  // aggregate, and ["reviews"] prefixes both keys, so this one
  // invalidation refreshes every review surface at once.
  const mutation = useMutation({
    mutationFn: ({ productId, review }) =>
      reviewsApi.create({ productId, ...review }),
    onSuccess: () => {
      setDraft(EMPTY_DRAFT);
      setSubmitted(true);
      setSubmitError(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
    },
    onError: (err) => {
      setSubmitted(false);
      setSubmitError(err.message);
    },
  });

  const submitReview = useCallback(
    (productId) =>
      mutation.mutate({
        productId,
        review: {
          name: draft.name.trim(),
          rating: Number(draft.rating),
          comment: draft.comment.trim(),
        },
      }),
    [draft, mutation],
  );

  const resetReview = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    setSubmitError(null);
    setSubmitted(false);
  }, []);

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      submitError,
      submitted,
      isSubmitting: mutation.isPending,
      submitReview,
      resetReview,
    }),
    [draft, submitError, submitted, mutation.isPending, submitReview, resetReview],
  );

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}
