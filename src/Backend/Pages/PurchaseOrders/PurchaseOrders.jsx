import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Search } from "lucide-react";
import { purchaseOrdersApi } from "../../../Frontend/lib/api";
import { toastSuccess, toastError } from "../../../Frontend/lib/swal";
import Pagination from "../../../Frontend/Components/Pagination";
import { usePagination } from "../../../Frontend/hooks/usePagination";
import {
  AdminEmpty,
  AdminError,
  AdminHeader,
  AdminLoader,
  StatusPill,
  ghostButtonClass,
  primaryButtonClass,
} from "../../admin-ui";

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionError, setActionError] = useState(null);
  const [receivingId, setReceivingId] = useState(null);

  const client = useQueryClient();

  const { data, status, error, refetch } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => purchaseOrdersApi.list(),
    staleTime: 0,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => purchaseOrdersApi.updateStatus(id, status),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["purchase-orders"] });
      client.invalidateQueries({ queryKey: ["inventory"] });
      client.invalidateQueries({ queryKey: ["catalog"] });
    },
  });

  const receiveMutation = useMutation({
    mutationFn: ({ id, items }) => purchaseOrdersApi.receive(id, items),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["purchase-orders"] });
      client.invalidateQueries({ queryKey: ["inventory"] });
      client.invalidateQueries({ queryKey: ["catalog"] });
    },
  });

  const orders = Array.isArray(data) ? data : (data?.orders || data || []);
  const filtered = searchTerm
    ? orders.filter((o) => {
        return (
          (o._id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (o.supplier || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : orders;

  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const { page, setPage, pageSize, total, totalPages, window: visibleOrders } = usePagination(sorted);

  const handleStatusChange = async (order, nextStatus) => {
    if (nextStatus === order.status) return;
    try {
      await updateStatusMutation.mutateAsync({ id: order._id, status: nextStatus });
      toastSuccess(`Status changed to ${nextStatus}`);
    } catch (err) {
      toastError(err.message);
      setActionError(err);
    }
  };

  const openReceive = (order) => {
    setReceivingId(order._id);
  };

  const closeReceive = () => {
    setReceivingId(null);
  };

  const handleReceive = async () => {
    const order = orders.find((o) => o._id === receivingId);
    const items = order?.items?.map((item) => ({
      productId: item.productId,
      received: item.quantity,
      expected: item.quantity,
    })) || [];
    try {
      await receiveMutation.mutateAsync({ id: receivingId, items });
      toastSuccess("Stock received");
      closeReceive();
    } catch (err) {
      toastError(err.message);
      setActionError(err);
    }
  };

  if (status === "loading") return <AdminLoader label="Loading purchase orders..." />;

  return (
    <div className="space-y-8">
      <AdminHeader section="Purchasing" title="Purchase Orders" />

      {(actionError || error) && (
        <AdminError message={actionError?.message || error?.message || "Something went wrong."} onRetry={refetch} />
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by PO number or supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-black text-text">
          All purchase orders <span className="text-text-muted">({total || 0})</span>
        </h2>

        <div className="mt-4 space-y-3">
          {orders.length === 0 ? (
            <AdminEmpty title="No purchase orders yet" message="These track stock coming in from suppliers." />
          ) : (
            visibleOrders.map((order) => (
              <div
                key={order._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-soft px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-bold text-text">#{order._id?.slice(-8)}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.supplier || "Unknown supplier"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill value={order.status || "Draft"} />
                  {order.status === "Ordered" && (
                    <button type="button" onClick={() => openReceive(order)} className={primaryButtonClass}>
                      <Package className="h-4 w-4" /> Receive
                    </button>
                  )}
                  <select
                    value=""
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    className="text-xs"
                  >
                    <option value="" disabled>Change status</option>
                    {["Draft", "Ordered", "Received", "Cancelled"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
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

      {receivingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-xl font-bold text-text">Receive Order</h2>
            <p className="mt-1 text-sm text-text-muted">
              Confirm receipt of all items for this purchase order.
            </p>
            <div className="mt-4 flex gap-3">
              <button onClick={closeReceive} className={ghostButtonClass}>
                Cancel
              </button>
              <button onClick={handleReceive} disabled={receiveMutation.isPending} className={primaryButtonClass}>
                {receiveMutation.isPending ? "Receiving..." : "Confirm Receive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
