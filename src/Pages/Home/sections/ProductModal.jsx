import { useEffect } from "react";
import { X, Check, ShieldCheck, Star, Truck, Loader2, MessageSquarePlus } from "lucide-react";
import { useProductReviews } from "../../../hooks/useProductReviews";
import { starsForRating } from "../../../lib/presentation";
import { useLanguage } from "../../../context/language/useLanguage";
import { useReview } from "../../../context/review/useReview";

const ProductModal = ({ product, onClose, onAddToCart, onBuyNow }) => {
  const {
    draft,
    setDraft,
    submitError,
    submitted,
    isSubmitting,
    submitReview,
    resetReview,
  } = useReview();
  const { reviews, summary, status } = useProductReviews(product?._id);
  const { t, plural, categoryLabel, formatPrice } = useLanguage();

  // The review form is global; a different product must start from a
  // clean form so one product's draft or success state never leaks
  // into another.
  useEffect(() => {
    resetReview();
  }, [product?._id, resetReview]);

  useEffect(() => {
    if (!product) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [product, onClose]);

  if (!product) return null;

  const average = Number(summary?.averageRating ?? 0);
  const count = Number(summary?.count ?? 0);
  const isSoldOut = product.stock <= 0;

  const handleSubmitReview = (event) => {
    event.preventDefault();
    submitReview(product._id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        className="relative grid max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-4xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-3xl bg-surface shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] md:grid-cols-[0.85fr_1.15fr] md:grid-rows-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <button
          type="button"
          aria-label={t("modal.close")}
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-surface/80 p-2 text-text shadow-md backdrop-blur-sm transition hover:bg-primary-100 hover:text-primary-700"
        >
          <X className="h-5 w-5" />
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="h-36 w-full object-cover object-center sm:h-44 md:order-2 md:h-107.5"
        />

        <div className="min-h-0 overflow-y-auto p-4 sm:order-1 sm:p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-primary-600">
            {categoryLabel(product.category)}
          </p>
          <h2
            id="product-modal-title"
            className="mt-2 pr-8 text-2xl font-black text-text sm:text-3xl"
          >
            {product.name}
          </h2>

          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-accent-900">
            <span className="flex">
              {starsForRating(average).map((filled, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${filled ? "fill-accent-800 text-accent-800" : "text-border"}`}
                />
              ))}
            </span>
            {count > 0 ? average.toFixed(1) : t("modal.noRatingsYet")}
            <span className="font-normal text-text-muted">({count})</span>
          </div>

          <p className="mt-4 leading-relaxed text-text-muted">{product.description}</p>

          <div className="mt-4 space-y-2 rounded-2xl bg-surface-soft p-3 text-sm text-text-muted">
            {product.age && (
              <div className="flex items-center gap-3 font-semibold text-text">
                <Check className="h-5 w-5 text-primary-600" />
                {t("modal.suitableFor", { age: product.age.toLowerCase() })}
              </div>
            )}
            {product.includes && (
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-primary-600" />
                {t("modal.includes", { includes: product.includes })}
              </div>
            )}
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-secondary-800" />
              {t("modal.freeDelivery")}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-surface-soft p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
              {t("modal.ourPrice")}
            </p>
            <div className="mt-1 flex items-end justify-between gap-4">
              <span className="text-3xl font-black leading-none text-primary-700">
                {formatPrice(product.price)}
              </span>
              <span className="text-right text-xs font-semibold text-text-muted">
                {isSoldOut ? (
                  <span className="text-primary-700">{t("modal.outOfStock")}</span>
                ) : (
                  <>
                    {t("modal.inStock", { stock: product.stock })}
                    <br />
                    {t("modal.easyReturns")}
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-text-muted">
            <ShieldCheck className="h-4 w-4 text-primary-600" /> {t("modal.safeCheckout")}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              disabled={isSoldOut}
              onClick={() => onAddToCart(product)}
              className="w-full rounded-xl bg-brand-fill px-4 py-3 font-bold text-ink-on-brand transition hover:scale-105 hover:brightness-110 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-text-muted disabled:hover:scale-100"
            >
              {isSoldOut ? t("products.soldOut") : t("modal.addToCart")}
            </button>
            <button
              type="button"
              disabled={isSoldOut}
              onClick={() => onBuyNow(product)}
              className="w-full rounded-xl border border-border px-4 py-3 font-bold text-text transition hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy now
            </button>
          </div>

          <section className="mt-6 border-t border-border pt-5">
            <h3 className="flex items-center gap-2 text-lg font-black text-text">
              <MessageSquarePlus className="h-5 w-5 text-primary-600" />
              {t("modal.reviewsHeading")}
            </h3>

            {summary?.disabled ? (
              <p className="mt-4 rounded-xl bg-surface-soft px-4 py-3 text-sm text-text-muted">
                {t("modal.reviewsDisabled")}
              </p>
            ) : (
              <>
                {status === "loading" && (
              <p className="mt-4 flex items-center gap-2 text-sm text-text-muted">
                <Loader2 className="h-4 w-4 animate-spin" /> {t("modal.loadingReviews")}
              </p>
            )}

            {status === "ready" && reviews.length === 0 && (
              <p className="mt-4 text-sm text-text-muted">
                {t("modal.noReviews")}
              </p>
            )}

            {status === "ready" && reviews.length > 0 && (
              <ul className="mt-4 space-y-3">
                {reviews.map((review) => (
                  <li key={review._id} className="rounded-2xl bg-surface-soft p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-text">{review.name}</span>
                      <span className="flex">
                        {starsForRating(review.rating).map((filled, index) => (
                          <Star
                            key={index}
                            className={`h-3 w-3 ${filled ? "fill-accent-800 text-accent-800" : "text-border"}`}
                          />
                        ))}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-1 text-sm leading-relaxed text-text-muted">
                        {review.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <form
              onSubmit={handleSubmitReview}
              className="mt-5 space-y-3 rounded-2xl border border-border p-4"
            >
              <p className="text-sm font-bold text-text">{t("modal.leaveReview")}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">
                    {t("modal.yourName")}
                  </span>
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder={t("modal.namePlaceholder")}
                    className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-text outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">
                    {t("modal.rating")}
                  </span>
                  <select
                    value={draft.rating}
                    onChange={(e) => setDraft({ ...draft, rating: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm font-semibold text-text outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {plural("modal.ratingStars", value)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">
                  {t("modal.comment")}
                </span>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={draft.comment}
                  onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
                  placeholder={t("modal.commentPlaceholder")}
                  className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-text outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </label>

              {submitError && (
                <p className="text-sm font-semibold text-primary-700">{submitError}</p>
              )}
              {submitted && (
                <p className="text-sm font-semibold text-secondary-1000">
                  {t("modal.published")}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-brand-fill-alt px-4 py-2.5 font-bold text-ink-on-brand transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? t("modal.publishing") : t("modal.publishReview")}
              </button>
            </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
