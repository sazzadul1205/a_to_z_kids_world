import { useMemo } from "react";
import { ShoppingBasket, Sparkles } from "lucide-react";
import { useLanguage } from "../../../context/language/useLanguage";
import { toneForIndex } from "../../../lib/presentation";

const ProductsSection = ({ products, selectedCategory, onProductClick, status = "ready" }) => {
  const { pages, t, categoryLabel, formatPrice } = useLanguage();
  const copy = pages.products;

  const skeletonItems = useMemo(
    () => Array.from({ length: 6 }, (_, index) => ({ _id: `skeleton-${index}` })),
    [],
  );

  if (status === "loading") {
    return (
      <section id="products" className="bg-surface-soft px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skeletonItems.map((item) => (
              <div
                key={item._id}
                className="animate-pulse overflow-hidden rounded-3xl border border-border bg-surface"
              >
                <div className="h-64 bg-surface-soft" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 rounded bg-surface-soft" />
                  <div className="h-5 w-3/4 rounded bg-surface-soft" />
                  <div className="h-3 w-full rounded bg-surface-soft" />
                  <div className="h-8 w-32 rounded bg-surface-soft" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="bg-surface-soft px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-secondary-1000">
              {copy.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-black text-text">
              {selectedCategory ? categoryLabel(selectedCategory) : copy.fallbackTitle}
            </h2>
          </div>
          <span className="hidden rounded-full bg-secondary-100 px-4 py-2 text-sm font-semibold text-secondary-1000 sm:block">
            {products.length} {copy.countSuffix}
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => {
            const isSoldOut = product.stock <= 0;
            return (
              <article
                key={product._id}
                className="group overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl"
              >
                <div className={`relative ${toneForIndex(index)} p-4`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-56 w-full rounded-2xl object-cover transition-transform group-hover:scale-105"
                  />
                  {product.age && (
                    <span className="absolute left-5 top-5 rounded-full bg-surface/90 px-3 py-1 text-xs font-bold text-text backdrop-blur-sm">
                      {product.age}
                    </span>
                  )}
                  {isSoldOut && (
                  <span className="absolute right-5 top-5 rounded-full bg-text/85 px-3 py-1 text-xs font-bold text-surface backdrop-blur-sm">
                    {t("products.soldOut")}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-600">
                    {categoryLabel(product.category)}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-text">{product.name}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-relaxed text-text-muted">
                    {product.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-2xl font-black text-secondary-1000">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => onProductClick(product)}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-fill px-4 py-2.5 text-sm font-bold text-ink-on-brand transition hover:scale-105 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-text-muted disabled:hover:scale-100"
                    >
                      <ShoppingBasket className="h-4 w-4" />
                      {isSoldOut ? t("products.soldOut") : t("products.buyNow")}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {products.length === 0 && status !== "loading" && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted">
            <Sparkles className="h-12 w-12 text-accent-500" />
            <p className="mt-4 text-lg font-bold text-text">{copy.emptyTitle}</p>
            <p className="mt-1 text-sm">{copy.emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
