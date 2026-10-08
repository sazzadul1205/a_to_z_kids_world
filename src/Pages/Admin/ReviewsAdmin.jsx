import { useState } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import { useCatalog } from "../../context/catalog/useCatalog";
import { starsForRating } from "../../lib/presentation";
import { useReviewMutations, useReviewSettingsQuery, useReviewsQuery, useUpdateReviewSettings } from "../../hooks/useAdminQueries";
import { confirmDialog, toastError, toastSuccess } from "../../lib/swal";
import Pagination from "../../Components/Pagination";
import { usePagination } from "../../hooks/usePagination";
import {
  AdminEmpty,
  AdminError,
  AdminLoader,
  dangerButtonClass,
  fieldClass,
  ghostButtonClass,
} from "./admin-ui";

const ReviewsAdmin = () => {
  const { products } = useCatalog();
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ rating: 5, comment: "" });
  const [actionError, setActionError] = useState(null);
  const [selected, setSelected] = useState(new Set());

  const { status, error, data, refetch } = useReviewsQuery();
  const { update, remove, bulkDelete } = useReviewMutations();
  const { data: reviewSettings } = useReviewSettingsQuery();
  const updateReviewSettings = useUpdateReviewSettings();
  // The review configuration is a single store-wide
  // switch, not a per-product flag.
  const reviewsEnabled = reviewSettings?.reviewsEnabled !== false;

  const reviews = data ?? [];
  const busy = update.isPending || remove.isPending || bulkDelete.isPending;
  const productNames = new Map(products.map((product) => [String(product._id), product.name]));
  const { page, setPage, pageSize, total, totalPages, window: visibleReviews } =
    usePagination(reviews);

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectAll = () =>
    setSelected((prev) =>
      prev.size === reviews.length ? new Set() : new Set(reviews.map((r) => r._id)),
    );

  const handleSave = async (event, review) => {
    event.preventDefault();
    setActionError(null);
    try {
      await update.mutateAsync({
        id: review._id,
        rating: Number(draft.rating),
        comment: draft.comment.trim(),
      });
      setEditingId(null);
    } catch (err) {
      setActionError(err);
    }
  };

  const handleDelete = async (review) => {
    const confirmed = await confirmDialog({
      title: `Delete the review by ${review.name}?`,
      text: "This cannot be undone.",
      confirmText: "Yes, delete",
      danger: true,
    });
    if (!confirmed) return;
    setActionError(null);
    try {
      await remove.mutateAsync(review._id);
      if (editingId === review._id) setEditingId(null);
    } catch (err) {
      setActionError(err);
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    const confirmed = await confirmDialog({
      title: `Delete ${ids.length} review${ids.length === 1 ? "" : "s"}?`,
      text: "This cannot be undone.",
      confirmText: "Yes, delete",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await bulkDelete.mutateAsync(ids);
      setSelected(new Set());
      toastSuccess(`${ids.length} review${ids.length === 1 ? "" : "s"} deleted.`);
    } catch (err) {
      toastError(err.message);
    }
  };

  // The review configuration is a single store-wide
  // switch, not a per-product flag.
  const handleToggleReviews = async () => {
    const next = !reviewsEnabled;
    if (!next) {
      const confirmed = await confirmDialog({
        title: "Disable customer reviews?",
        text: "Shoppers will no longer see the review section, and publishing is blocked on every product. Existing reviews are kept and staff can still moderate them here.",
        confirmText: "Yes, disable",
        danger: true,
      });
      if (!confirmed) return;
    }
    updateReviewSettings.mutate(next, {
      onSuccess: () => {
        toastSuccess(
          next
            ? "Customer reviews are now open."
            : "Customer reviews are now closed.",
        );
      },
      onError: (err) => {
        toastError(err.message);
      },
    });
  };

  if (status === "pending") return <AdminLoader label="Loading reviews..." />;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Feedback</p>
        <h1 className="mt-1 text-3xl font-black text-text sm:text-4xl">Reviews</h1>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-black text-text">Review configuration</h2>
        <p className="mt-1 text-sm text-text-muted">
          One switch for the whole shop — reviews are global, not
          per product. Closing them hides the review section on
          every product page and blocks publishing. Existing
          reviews are kept and staff can still moderate them below.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-soft px-4 py-3">
          <div className="min-w-0">
            <p className="font-bold text-text">Allow customer reviews</p>
            <p className="text-xs text-text-muted">
              {reviewsEnabled
                ? "Open — shoppers can read and publish reviews on any product."
                : "Closed — the review section is hidden on every product page."}
            </p>
          </div>
          <button
            type="button"
            disabled={updateReviewSettings.isPending}
            onClick={handleToggleReviews}
            className={ghostButtonClass}
          >
            {updateReviewSettings.isPending
              ? "Saving..."
              : reviewsEnabled
                ? "Close reviews"
                : "Open reviews"}
          </button>
        </div>
      </section>

      {(actionError || error) && (
        <AdminError message={actionError?.message || error?.message || "Something went wrong."} onRetry={refetch} />
      )}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-text">
            All reviews <span className="text-text-muted">({reviews.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-border bg-surface-soft px-3 py-1.5 text-xs font-bold text-text">
              <input
                type="checkbox"
                checked={selected.size > 0 && selected.size === reviews.length}
                onChange={selectAll}
                className="h-4 w-4 rounded border-border"
              />
              Select all
            </label>
            <button
              type="button"
              disabled={selected.size === 0 || busy}
              onClick={handleBulkDelete}
              className={dangerButtonClass}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>

        {selected.size > 0 && (
          <p className="mt-2 text-xs text-text-muted">
            {selected.size} review{selected.size === 1 ? "" : "s"} selected.
          </p>
        )}

        <div className="mt-4 space-y-3">
          {reviews.length === 0 ? (
            <AdminEmpty title="No reviews yet" message="Shoppers can leave reviews from any product page." />
          ) : (
            visibleReviews.map((review) => (
              <div
                key={review._id}
                className={`rounded-xl bg-surface-soft px-4 py-3 ${
                  selected.has(review._id) ? "ring-2 ring-primary-200" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <label className="flex min-w-0 cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected.has(review._id)}
                      onChange={() => toggleSelect(review._id)}
                      // The wrapping label carries the row text,
                      // which would otherwise become the checkbox's
                      // accessible name.
                      aria-label={`Select the review by ${review.name}`}
                      className="mt-1 h-4 w-4 rounded border-border"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-text">{review.name}</p>
                      <p className="text-xs text-text-muted">
                        {productNames.get(String(review.productId)) || "Removed product"} ·{" "}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </label>
                  <div className="flex shrink-0 items-center gap-2">
                    {editingId === review._id ? (
                      <>
                        <select
                          value={draft.rating}
                          onChange={(e) => setDraft({ ...draft, rating: e.target.value })}
                          className="rounded-lg border border-border bg-surface px-2 py-1 text-sm font-semibold"
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option key={value} value={value}>
                              {value} star{value > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={(e) => handleSave(e, review)}
                          className="rounded-lg bg-brand-fill px-3 py-1.5 text-xs font-bold text-ink-on-brand hover:brightness-110"
                        >
                          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex">
                          {starsForRating(review.rating).map((filled, index) => (
                            <span
                              key={index}
                              className={`text-sm ${filled ? "text-accent-800" : "text-border"}`}
                            >
                              ★
                            </span>
                          ))}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(review._id);
                            setDraft({ rating: review.rating, comment: review.comment || "" });
                          }}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text hover:border-primary-300"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleDelete(review)}
                          className="rounded-lg border border-primary-300 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-800 hover:bg-primary-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingId === review._id ? (
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={draft.comment}
                    onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
                    className={`${fieldClass} mt-3`}
                  />
                ) : (
                  review.comment && (
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">{review.comment}</p>
                  )
                )}
              </div>
            ))
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          className="mt-4"
        />
      </section>

      <p className="text-xs text-text-muted">
        Shoppers can submit reviews without an account, so moderation stays a manual
        responsibility. Use Delete to remove anything inappropriate.
      </p>
    </div>
  );
};

export default ReviewsAdmin;
