import { useCallback, useState } from "react";
import { Trash2 } from "lucide-react";
import { ordersApi } from "../../lib/api";
import { useCatalog } from "../../context/catalog/useCatalog";
import { formatBDT } from "../../lib/currency";
import { useResource } from "../../hooks/useResource";
import {
  AdminEmpty,
  AdminError,
  AdminLoader,
  StatusPill,
  dangerButtonClass,
} from "./admin-ui";

const STATUSES = ["Pending", "Processing", "Completed", "Cancelled"];

const OrdersAdmin = () => {
  const { products } = useCatalog();
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetcher = useCallback(() => ordersApi.list(), []);
  const { status, error, data: orders, reload } = useResource(fetcher);

  const productById = new Map(products.map((product) => [String(product._id), product]));

  const runAction = async (orderId, action) => {
    setBusyId(orderId);
    setActionError(null);
    try {
      await action();
      await reload();
    } catch (err) {
      setActionError(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = (order, nextStatus) => {
    if (nextStatus === order.status) return;
    return runAction(order._id, () => ordersApi.updateStatus(order._id, nextStatus));
  };

  const handleDelete = (order) => {
    if (!window.confirm("Delete this order? Stock will be returned to the product.")) return;
    return runAction(order._id, () => ordersApi.remove(order._id));
  };

  if (status === "loading") return <AdminLoader label="Loading orders..." />;

  const rows = orders ?? [];
  const sorted = [...rows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Fulfilment</p>
        <h1 className="mt-1 text-3xl font-black text-text sm:text-4xl">Orders</h1>
      </header>

      {(actionError || error) && (
        <AdminError
          message={actionError?.message || error?.message || "Something went wrong."}
          onRetry={reload}
        />
      )}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-black text-text">
          All orders <span className="text-text-muted">({rows.length})</span>
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Public checkout completes over WhatsApp, so record confirmed orders here.
          Changing a status to or from Cancelled adjusts product stock automatically.
        </p>

        <div className="mt-4 space-y-3">
          {sorted.length === 0 ? (
            <AdminEmpty title="No orders yet" message="Confirmed orders will show up here." />
          ) : (
            sorted.map((order) => {
              const product = productById.get(String(order.productId));
              return (
                <div
                  key={order._id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-soft px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {product?.image && (
                      <img src={product.image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-bold text-text">
                        {product?.name || "Removed product"}
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        {order.quantity} × {formatBDT(product?.price ?? 0)} ·{" "}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        Customer ref: {String(order.userId).slice(-8)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className="text-base font-black text-secondary-1000">
                      {formatBDT(order.totalPrice)}
                    </span>
                    <select
                      value={order.status}
                      disabled={busyId === order._id}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-semibold text-text outline-none focus:border-primary-400"
                    >
                      {STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                    <StatusPill value={order.status} />
                    <button
                      type="button"
                      disabled={busyId === order._id}
                      onClick={() => handleDelete(order)}
                      className={dangerButtonClass}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default OrdersAdmin;