import { useMemo } from "react";
import { ShoppingBasket } from "lucide-react";
import { useLanguage } from "../../../context/language/useLanguage";
import { useRecentOrders } from "../../../hooks/useRecentOrders";

const RecentOrdersSection = () => {
  const { pages, formatPrice } = useLanguage();
  const copy = pages.recentOrders;
  const { data: orders, status } = useRecentOrders(10);

  const skeletons = useMemo(
    () => Array.from({ length: 4 }, (_, index) => ({ _id: `skeleton-${index}` })),
    [],
  );

  if (status === "loading") {
    return (
      <section className="bg-surface-soft px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="h-3 w-40 rounded bg-surface-soft" />
            <div className="h-3 w-24 rounded bg-surface-soft" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {skeletons.map((item) => (
              <div key={item._id} className="animate-pulse rounded-3xl border border-border bg-surface p-5">
                <div className="h-3 w-20 rounded bg-surface-soft" />
                <div className="mt-3 h-5 w-3/4 rounded bg-surface-soft" />
                <div className="mt-3 h-3 w-full rounded bg-surface-soft" />
                <div className="mt-4 h-8 w-24 rounded bg-surface-soft" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface-soft px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary-600">
              {copy.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-black text-text">{copy.title}</h2>
          </div>
          <span className="hidden rounded-full bg-secondary-100 px-4 py-2 text-sm font-semibold text-secondary-1000 sm:block">
            {orders?.length ?? 0} {copy.countSuffix}
          </span>
        </div>

        {(!orders || orders.length === 0) ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/50 py-16 text-center text-text-muted">
            <ShoppingBasket className="h-12 w-12 text-accent-500" />
            <p className="mt-4 text-lg font-bold text-text">{copy.emptyTitle}</p>
            <p className="mt-1 text-sm">{copy.emptyMessage}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {orders.map((order) => {
              const firstItem = order.items?.[0];
              const itemCount = order.items?.length || 1;
              const paymentLabel =
                copy.paymentLabels[order.paymentMethod] ?? order.paymentMethod;
              return (
                <article
                  key={order._id}
                  className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary-600">
                        {copy.saleLabel} {order.saleNumber || order._id?.slice(-8)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-text-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">
                      {paymentLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {firstItem?.productName && (
                      <span className="truncate text-sm font-bold text-text">
                        {firstItem.productName}
                        {itemCount > 1 && (
                          <span className="ml-1 text-xs text-text-muted">
                            {copy.moreItems.replace("{n}", String(itemCount - 1))}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs font-semibold text-text-muted">
                      {itemCount} {itemCount === 1 ? copy.itemOne : copy.itemOther}
                    </span>
                    <span className="text-lg font-black text-secondary-1000">
                      {formatPrice(order.total || 0)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentOrdersSection;