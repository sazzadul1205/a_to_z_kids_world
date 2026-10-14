import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { useCatalog } from "../../../Frontend/context/catalog/useCatalog";
import { useOrderHistoryQuery } from "../../../Frontend/hooks/useAdminQueries";
import { formatBDT } from "../../../Frontend/lib/currency";
import { ReceiptModal } from "../../../Frontend/Components/Receipt";
import {
  AdminDataTable,
  AdminError,
  AdminHeader,
  AdminLoader,
  StatusPill,
  compactButtonClass,
} from "../../admin-ui";

const PAGE_SIZE = 12;

const PAYMENT_LABELS = {
  cash: "Cash",
  card: "Card",
  mobile: "Mobile Banking",
  due: "Due / Credit",
};

const SalesHistory = () => {
  const { products } = useCatalog();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [receiptFormat, setReceiptFormat] = useState("thermal");
  const params = useMemo(
    () => ({ page, limit: PAGE_SIZE, ...(statusFilter ? { status: statusFilter } : {}) }),
    [page, statusFilter],
  );
  const { data, status, error, refetch } = useOrderHistoryQuery(params);
  const productById = useMemo(
    () => new Map(products.map((product) => [String(product._id), product])),
    [products],
  );
  const orders = data?.orders ?? [];
  const pagination = data?.pagination ?? {
    page,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

  const receiptSale = useMemo(() => {
    if (!selectedSale) return null;
    const total = Number(selectedSale.total ?? selectedSale.totalPrice ?? 0);
    const amountPaid = Number(selectedSale.amountPaid ?? total);

    return {
      ...selectedSale,
      id: selectedSale._id,
      saleNumber: selectedSale.saleNumber || selectedSale._id?.slice(-8).toUpperCase(),
      cashier: selectedSale.cashier || selectedSale.cashierName || "POS User",
      paymentMethod: PAYMENT_LABELS[selectedSale.paymentMethod] || selectedSale.paymentMethod || "Cash",
      items: (selectedSale.items?.length
        ? selectedSale.items
        : [{
            productId: selectedSale.productId,
            quantity: selectedSale.quantity || 1,
            price: selectedSale.price ?? productById.get(String(selectedSale.productId))?.price ?? 0,
          }]
      ).map((item) => ({
        name:
          item.productName ||
          item.name ||
          productById.get(String(item.productId))?.name ||
          "Removed product",
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
      })),
      subtotal: Number(selectedSale.subtotal ?? selectedSale.totalPrice ?? total),
      total,
      discount: Number(selectedSale.discount) || 0,
      tax: Number(selectedSale.tax) || 0,
      amountPaid,
      balance: Number(selectedSale.balance ?? Math.max(0, total - amountPaid)),
      change: Number(selectedSale.change) || 0,
      debtRepayment: Number(selectedSale.debtRepayment) || 0,
    };
  }, [productById, selectedSale]);

  const columns = [
    {
      key: "sale",
      label: "Sale",
      render: (order) => (
        <div className="min-w-0">
          <p className="truncate font-bold text-text">
            {order.saleNumber || `#${order._id?.slice(-8).toUpperCase()}`}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Date unavailable"}
          </p>
        </div>
      ),
      className: "w-52",
    },
    {
      key: "customer",
      label: "Customer",
      render: (order) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-text">{order.customerName || "Walk-in customer"}</p>
          <p className="truncate text-xs text-text-muted">{order.customerPhone || "No phone number"}</p>
        </div>
      ),
      className: "flex-1 min-w-0",
    },
    {
      key: "items",
      label: "Items",
      render: (order) => (
        <div className="min-w-0">
          {(order.items || []).slice(0, 2).map((item, index) => (
            <p key={`${item.productId || item.productName || item.name}-${index}`} className="truncate text-sm text-text">
              {item.productName || item.name || productById.get(String(item.productId))?.name || "Removed product"}
              <span className="ml-1 text-xs text-text-muted">× {item.quantity}</span>
            </p>
          ))}
          {(order.items?.length || 0) > 2 && (
            <p className="text-xs text-text-muted">+{order.items.length - 2} more items</p>
          )}
          {!order.items?.length && (
            <p className="text-sm text-text">
              {productById.get(String(order.productId))?.name || "Sale items unavailable"}
              {order.quantity ? ` × ${order.quantity}` : ""}
            </p>
          )}
        </div>
      ),
      className: "flex-1 min-w-0",
    },
    {
      key: "payment",
      label: "Payment / status",
      render: (order) => (
        <div>
          <p className="text-sm font-semibold text-text">
            {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || "Cash"}
          </p>
          <StatusPill value={order.status} />
        </div>
      ),
      className: "w-36",
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      render: (order) => (
        <span className="block text-right font-black text-text">
          {formatBDT(order.total ?? order.totalPrice ?? 0)}
        </span>
      ),
      className: "w-32 text-right",
    },
  ];

  const rowActions = (order) => (
    <button
      type="button"
      onClick={() => {
        setSelectedSale(order);
        setReceiptFormat("thermal");
      }}
      className={compactButtonClass}
      aria-label={`Review and print receipt for ${order.saleNumber || "sale"}`}
    >
      <Printer className="h-3.5 w-3.5" aria-hidden="true" />
      Receipt
    </button>
  );

  if (status === "pending") return <AdminLoader label="Loading sales history..." />;

  return (
    <div className="space-y-8">
      <AdminHeader section="Selling" title="Manual Sales History">
        <label className="flex items-center gap-2 text-sm font-semibold text-text">
          Status
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value);
            }}
            className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary-400"
          >
            <option value="">All sales</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Due">Due</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </label>
      </AdminHeader>

      {error && <AdminError message={error.message} onRetry={refetch} />}

      <AdminDataTable
        title="Sales"
        items={orders}
        columns={columns}
        status={status}
        error={error}
        onReload={refetch}
        emptyTitle="No manual sales found"
        emptyMessage="Sales recorded from the POS page will appear here for review and reprinting."
        rowActions={rowActions}
        getRowKey={(order) => order._id}
        pagination={pagination}
        onPaginationChange={setPage}
      />

      {receiptSale && (
        <ReceiptModal
          sale={receiptSale}
          format={receiptFormat}
          onClose={() => setSelectedSale(null)}
          onFormatChange={setReceiptFormat}
        />
      )}
    </div>
  );
};

export default SalesHistory;
