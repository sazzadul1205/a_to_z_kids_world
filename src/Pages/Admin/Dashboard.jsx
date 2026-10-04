import { Link } from "react-router";
import { useCatalog } from "../../context/catalog/useCatalog";
import { formatBDT } from "../../lib/currency";
import { useOrdersQuery, useReviewsQuery } from "../../hooks/useAdminQueries";
import {
  AdminEmpty,
  AdminError,
  AdminLoader,
  StatCard,
  StatusPill,
} from "./admin-ui";

const Dashboard = () => {
  const { products, categories, status: catalogStatus, error: catalogError, reload: reloadCatalog } =
    useCatalog();

  // The same hooks the Orders and Reviews screens use, so the dashboard reads
  // their cached entries instead of issuing its own combined request. Landing on
  // the dashboard and then opening either screen costs no extra round trips.
  const ordersQuery = useOrdersQuery();
  const reviewsQuery = useReviewsQuery();

  const reloadAll = () => {
    reloadCatalog();
    ordersQuery.refetch();
    reviewsQuery.refetch();
  };

  const error = ordersQuery.error ?? reviewsQuery.error ?? null;

  if (catalogStatus === "loading" || ordersQuery.isPending || reviewsQuery.isPending) {
    return <AdminLoader label="Loading your dashboard..." />;
  }

  const orders = ordersQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];

  const outOfStock = products.filter((product) => product.stock <= 0);
  const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 5);
  const openOrders = orders.filter(
    (order) => order.status !== "Cancelled" && order.status !== "Completed",
  );
  const revenue = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((total, order) => total + Number(order.totalPrice ?? 0), 0);

  const productNames = new Map(products.map((product) => [String(product._id), product.name]));

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Overview</p>
        <h1 className="mt-1 text-3xl font-black text-text sm:text-4xl">Store dashboard</h1>
      </header>

      {(error || catalogError) && (
        <AdminError
          message={error?.message || catalogError?.message || "Something went wrong."}
          onRetry={reloadAll}
        />
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={products.length} />
        <StatCard label="Categories" value={categories.length} tone="accent" />
        <StatCard label="Open orders" value={openOrders.length} tone="secondary" />
        <StatCard label="Order value" value={formatBDT(revenue)} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-lg font-black text-text">Needs attention</h2>
          <p className="mt-1 text-sm text-text-muted">
            Stock levels that may need a restock soon.
          </p>

          <div className="mt-4 space-y-3">
            {outOfStock.length === 0 && lowStock.length === 0 ? (
              <AdminEmpty title="Stock looks healthy" message="Every product is above the low-stock threshold." />
            ) : (
              [...outOfStock, ...lowStock].slice(0, 6).map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface-soft px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-text">{product.name}</p>
                    <p className="truncate text-xs text-text-muted">{product.category}</p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-black ${
                      product.stock <= 0 ? "text-primary-700" : "text-accent-900"
                    }`}
                  >
                    {product.stock} left
                  </span>
                </div>
              ))
            )}
          </div>

          <Link
            to="/admin/products"
            className="mt-4 inline-block text-sm font-bold text-primary-700 hover:text-primary-900"
          >
            Manage products →
          </Link>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-lg font-black text-text">Latest orders</h2>
          <p className="mt-1 text-sm text-text-muted">
            Orders recorded by staff from WhatsApp requests.
          </p>

          <div className="mt-4 space-y-3">
            {orders.length === 0 ? (
              <AdminEmpty title="No orders yet" message="Staff-recorded orders will appear here." />
            ) : (
              [...orders]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 6)
                .map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-surface-soft px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-text">
                        {productNames.get(String(order.productId)) || "Removed product"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {order.quantity} × {formatBDT(Number(order.totalPrice) / Math.max(order.quantity, 1))}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-black text-secondary-1000">
                        {formatBDT(order.totalPrice)}
                      </span>
                      <StatusPill value={order.status} />
                    </div>
                  </div>
                ))
            )}
          </div>

          <Link
            to="/admin/orders"
            className="mt-4 inline-block text-sm font-bold text-primary-700 hover:text-primary-900"
          >
            Manage orders →
          </Link>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-black text-text">Recent reviews</h2>
        <p className="mt-1 text-sm text-text-muted">
          {reviews.length} published review{reviews.length === 1 ? "" : "s"} across the shop.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {reviews.length === 0 ? (
            <div className="sm:col-span-2">
              <AdminEmpty title="No reviews yet" message="Shoppers can leave reviews from any product." />
            </div>
          ) : (
            [...reviews]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 4)
              .map((review) => (
                <div key={review._id} className="rounded-xl bg-surface-soft px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-text">{review.name}</p>
                    <span className="text-sm font-black text-accent-900">{review.rating}★</span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    {productNames.get(String(review.productId)) || "Unknown product"}
                  </p>
                  {review.comment && (
                    <p className="mt-2 line-clamp-2 text-sm text-text-muted">{review.comment}</p>
                  )}
                </div>
              ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;