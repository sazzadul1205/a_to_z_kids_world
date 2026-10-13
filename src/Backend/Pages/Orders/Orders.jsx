import { useState } from "react";
import { CreditCard, Banknote, Smartphone, Landmark, Tag } from "lucide-react";
import { useCatalog } from "../../../Frontend/context/catalog/useCatalog";
import { formatBDT } from "../../../Frontend/lib/currency";
import { useOrderMutations, useOrdersQuery } from "../../../Frontend/hooks/useAdminQueries";
import { confirmDialog } from "../../../Frontend/lib/swal";
import { usePagination } from "../../../Frontend/hooks/usePagination";
import {
  AdminError,
  AdminLoader,
  AdminDataTable,
  AdminRowActions,
  StatusPill,
} from "../../admin-ui";

const STATUSES = ["Pending", "Processing", "Completed", "Cancelled", "Due"];

const PAYMENT_ICONS = {
  cash: Banknote,
  card: CreditCard,
  mobile: Smartphone,
  due: Landmark,
};

const PAYMENT_LABELS = {
  cash: "Cash",
  card: "Card",
  mobile: "Mobile",
  due: "Due / Credit",
};

const Orders = () => {
  const { products } = useCatalog();
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const { status, error, data, refetch } = useOrdersQuery();
  const { updateStatus, remove } = useOrderMutations();

  const productById = new Map(products.map((product) => [String(product._id), product]));

  // Invalidation is handled by the mutation, so this only reports the error.
  const runAction = async (orderId, action) => {
    setBusyId(orderId);
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = (order, nextStatus) => {
    if (nextStatus === order.status) return;
    return runAction(order._id, () => updateStatus.mutateAsync({ id: order._id, status: nextStatus }));
  };

  const handleDelete = (order) => {
    return confirmDialog({
      title: "Delete this order?",
      text: "Stock will be returned to the product.",
      confirmText: "Yes, delete",
      danger: true,
    }).then((confirmed) => {
      if (!confirmed) return;
      return runAction(order._id, () => remove.mutateAsync(order._id));
    });
  };

  const rows = data ?? [];
  const sorted = [...rows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const { page, setPage, pageSize, totalPages, window: visibleOrders } =
    usePagination(sorted);

  if (status === "pending") return <AdminLoader label="Loading orders..." />;

  const columns = [
    {
      key: "product",
      render: (order) => {
        const product = productById.get(String(order.productId));
        const PaymentIcon = PAYMENT_ICONS[order.paymentMethod] || Banknote;
        const hasDiscount = order.discount && order.discount > 0;

        return (
          <div className="min-w-0">
            <p className="truncate font-bold text-text flex items-center gap-2">
              {product?.name || "Removed product"}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  order.paymentMethod === "due"
                    ? "bg-accent-100 text-accent-900"
                    : "bg-surface-soft text-text-muted"
                }`}
                title={PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
              >
                <PaymentIcon className="h-3 w-3" />
                {PAYMENT_LABELS[order.paymentMethod] || "Cash"}
              </span>
            </p>
            <p className="truncate text-xs text-text-muted">
              {order.quantity || 1} × {formatBDT(product?.price ?? 0)} ·{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
            <p className="truncate text-xs text-text-muted">
              {order.customerName
                ? `${order.customerName}${order.customerPhone ? ` · ${order.customerPhone}` : ""}`
                : `Customer: ${String(order.userId).slice(-8)}`}
            </p>
            {hasDiscount && (
              <p className="truncate text-xs text-text-muted">
                <Tag className="inline h-3 w-3" /> Discount: -{formatBDT(order.discount)}
                {order.discountType === "percentage" && ` (${order.discountValue}%)`}
              </p>
            )}
          </div>
        );
      },
      className: "flex-1 min-w-0",
    },
    {
      key: "total",
      render: (order) => {
        const orderTotal = order.total || order.totalPrice || 0;
        const orderPaid = order.amountPaid || 0;
        const outstanding = Math.max(0, orderTotal - orderPaid);
        return (
          <div className="text-right">
            <span className="text-base font-black text-secondary-1000 block">
              {formatBDT(orderTotal)}
            </span>
            {outstanding > 0 && (
              <span className="text-xs font-bold text-accent-700">
                {formatBDT(outstanding)} due
              </span>
            )}
          </div>
        );
      },
      className: "w-40 text-right",
    },
    {
      key: "status",
      render: (order) => (
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
      ),
      className: "w-40",
    },
    {
      key: "statusPill",
      render: (order) => <StatusPill value={order.status} />,
      className: "w-32",
    },
  ];

  const getRowKey = (order) => order._id;

  const rowActions = (order) => (
    <AdminRowActions
      onDelete={() => handleDelete(order)}
      disabled={busyId === order._id}
      deleteLabel="Delete"
    />
  );

  const handlePageChange = (newPage) => setPage(newPage);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Fulfilment</p>
        <h1 className="mt-1 text-3xl font-black text-text sm:text-4xl">Orders</h1>
      </header>

      {(actionError || error) && (
        <AdminError
          message={actionError?.message || error?.message || "Something went wrong."}
          onRetry={refetch}
        />
      )}

      <AdminDataTable
        title="Orders"
        subtitle="Fulfilment"
        items={visibleOrders}
        columns={columns}
        status={status}
        error={error}
        onReload={refetch}
        emptyTitle="No orders yet"
        emptyMessage="Confirmed orders will show up here."
        rowActions={rowActions}
        getRowKey={getRowKey}
        pagination={{ page, pageSize, total: sorted.length, totalPages }}
        onPaginationChange={handlePageChange}
      />
    </div>
  );
};

export default Orders;