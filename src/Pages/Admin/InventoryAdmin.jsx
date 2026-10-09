import { useState, useMemo } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Search,
  Truck,
  Warehouse,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCatalog } from "../../context/catalog/useCatalog";
import {
  useInventoryQuery,
  useInventoryAlertsQuery,
  useInventoryMutations,
} from "../../hooks/useAdminQueries";
import { formatBDT } from "../../lib/currency";
import { toastSuccess } from "../../lib/swal";
import Pagination from "../../Components/Pagination";
import { queryKeys } from "../../lib/queryKeys";
import {
  AdminError,
  AdminLoader,
  StatCard,
  fieldClass,
  labelClass,
  primaryButtonClass,
  ghostButtonClass,
} from "./admin-ui";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "healthy", label: "Healthy (>5)" },
  { value: "low", label: "Low Stock (1-5)" },
  { value: "out", label: "Out of Stock" },
];

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "stock", label: "Stock" },
  { value: "price", label: "Price" },
  { value: "totalValue", label: "Total Value" },
];

const InventoryAdmin = () => {
  const { status: catalogStatus, error: catalogError, reload: reloadCatalog } = useCatalog();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(50);

  const [adjustId, setAdjustId] = useState(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustError, setAdjustError] = useState(null);

  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkAdjustment, setBulkAdjustment] = useState("");
  const [bulkReason, setBulkReason] = useState("");
  const [bulkError, setBulkError] = useState(null);

  const params = useMemo(
    () => ({
      status: statusFilter,
      search: searchTerm,
      sort: sortBy,
      order: sortOrder,
      limit: pageSize,
    }),
    [statusFilter, searchTerm, sortBy, sortOrder, pageSize]
  );

  const { data, isLoading, error, refetch } = useInventoryQuery(params);
  const { data: alerts } = useInventoryAlertsQuery();
  const { adjustStock, bulkAdjustStock } = useInventoryMutations();

  const products = data?.products ?? [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0, limit: pageSize };
  const summary = data?.summary ?? {
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    healthyCount: 0,
    totalValue: 0,
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const openAdjust = (product) => {
    setAdjustId(product._id);
    setAdjustQty("");
    setAdjustReason("");
    setAdjustError(null);
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    setAdjustError(null);

    const adjustment = Number(adjustQty);
    if (!Number.isInteger(adjustment)) {
      setAdjustError("Adjustment must be a whole number");
      return;
    }
    if (!adjustReason.trim()) {
      setAdjustError("Reason is required");
      return;
    }

    try {
      await adjustStock.mutateAsync({
        id: adjustId,
        adjustment,
        reason: adjustReason.trim(),
      });
      setAdjustId(null);
      setAdjustQty("");
      setAdjustReason("");
      toastSuccess("Stock adjusted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.catalog });
    } catch (err) {
      setAdjustError(err.message);
    }
  };

  const toggleBulkSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectAll = () =>
    setSelectedIds((prev) =>
      prev.size === products.length ? new Set() : new Set(products.map((p) => p._id))
    );

  const handleBulkAdjust = async (e) => {
    e.preventDefault();
    setBulkError(null);

    const adjustment = Number(bulkAdjustment);
    if (!Number.isInteger(adjustment)) {
      setBulkError("Adjustment must be a whole number");
      return;
    }
    if (!bulkReason.trim()) {
      setBulkError("Reason is required");
      return;
    }
    if (selectedIds.size === 0) {
      setBulkError("No products selected");
      return;
    }

    const adjustments = [...selectedIds].map((productId) => ({
      productId,
      adjustment,
      reason: bulkReason.trim(),
    }));

    try {
      await bulkAdjustStock.mutateAsync(adjustments);
      setSelectedIds(new Set());
      setBulkAdjustment("");
      setBulkReason("");
      setBulkMode(false);
      toastSuccess(`${adjustments.length} product${adjustments.length === 1 ? "" : "s"} adjusted`);
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.catalog });
    } catch (err) {
      setBulkError(err.message);
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: "Out of Stock", className: "bg-primary-100 text-primary-900" };
    if (stock <= 5) return { label: "Low Stock", className: "bg-accent-100 text-accent-900" };
    return { label: "In Stock", className: "bg-secondary-100 text-secondary-1000" };
  };

  if (catalogStatus === "loading" || isLoading) {
    return <AdminLoader label="Loading inventory..." />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Inventory</p>
          <h1 className="mt-1 text-3xl font-black text-text sm:text-4xl">Stock Management</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
              queryClient.invalidateQueries({ queryKey: queryKeys.catalog });
              toastSuccess("Refreshed");
            }}
            disabled={isLoading}
            className={ghostButtonClass}
          >
            <Loader2 className="h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setBulkMode(!bulkMode)}
            className={`${ghostButtonClass} ${bulkMode ? "bg-primary-50 border-primary-300 text-primary-700" : ""}`}
          >
            <Plus className="h-4 w-4" /> {bulkMode ? "Exit Bulk" : "Bulk Adjust"}
          </button>
        </div>
      </header>

      {(catalogError || error) && (
        <AdminError message={error?.message || catalogError?.message} onRetry={() => { refetch(); reloadCatalog(); }} />
      )}

      {/* Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard label="Total Products" value={summary.totalProducts} tone="primary" />
        <StatCard label="Total Units" value={summary.totalStock.toLocaleString()} tone="secondary" />
        <StatCard label="Inventory Value" value={formatBDT(summary.totalValue)} tone="accent" />
        <StatCard label="Healthy" value={summary.healthyCount} tone="primary" />
        <StatCard
          label="Low Stock"
          value={summary.lowStockCount}
          tone={summary.lowStockCount > 0 ? "accent" : "primary"}
        />
        <StatCard
          label="Out of Stock"
          value={summary.outOfStockCount}
          tone={summary.outOfStockCount > 0 ? "danger" : "primary"}
        />
      </section>

      {/* Alerts Banner */}
      {(alerts?.lowStock?.length > 0 || alerts?.outOfStock?.length > 0) && (
        <section className="rounded-2xl border border-accent-300 bg-accent-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-bold text-accent-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Stock Alerts
              </p>
              {alerts?.lowStock?.length > 0 && (
                <p className="mt-1 text-sm text-accent-800">
                  {alerts.lowStock.length} product{alerts.lowStock.length === 1 ? "" : "s"} below reorder threshold (≤5)
                </p>
              )}
              {alerts?.outOfStock?.length > 0 && (
                <p className="mt-1 text-sm text-primary-800">
                  {alerts.outOfStock.length} product{alerts.outOfStock.length === 1 ? "" : "s"} completely out of stock
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Filters & Search */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${fieldClass} pl-10`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={fieldClass}
            style={{ minWidth: "160px" }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={fieldClass}
            style={{ minWidth: "140px" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            className={ghostButtonClass}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className={fieldClass}
            style={{ minWidth: "100px" }}
          >
            {[25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>

        {bulkMode && (
          <div className="mt-4 rounded-xl border border-primary-300 bg-primary-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-primary-900">
                {selectedIds.size} product{selectedIds.size === 1 ? "" : "s"} selected
              </p>
              <button type="button" onClick={() => setSelectedIds(new Set())} className={ghostButtonClass}>
                <X className="h-4 w-4" /> Clear
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Adjustment (all selected)</span>
                <input
                  type="number"
                  required
                  step="1"
                  value={bulkAdjustment}
                  onChange={(e) => setBulkAdjustment(e.target.value)}
                  placeholder="+10 or -5"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Reason</span>
                <input
                  required
                  maxLength={200}
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  placeholder="Stock take, damaged goods, supplier return..."
                  className={fieldClass}
                />
              </label>
            </div>
            {bulkError && (
              <p className="rounded-xl border border-primary-300 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900">
                {bulkError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBulkAdjust}
                disabled={bulkAdjustStock.isPending || selectedIds.size === 0}
                className={primaryButtonClass}
              >
                <Truck className="h-4 w-4" />
                {bulkAdjustStock.isPending ? "Applying..." : `Apply to ${selectedIds.size} Products`}
              </button>
              <button type="button" onClick={() => setBulkMode(false)} className={ghostButtonClass}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Inventory Table */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-text">
            All Products <span className="text-text-muted">({pagination.total})</span>
          </h2>
          {bulkMode && (
            <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text">
              <input
                type="checkbox"
                checked={selectedIds.size > 0 && selectedIds.size === products.length}
                onChange={selectAll}
                className="h-4 w-4 rounded border-border"
              />
              Select all
            </label>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-widest text-text-muted">
                <th className="px-4 py-3 w-12" />
                <th className="px-4 py-3" onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                  Product <span className="ml-1 opacity-50">↕</span>
                </th>
                <th className="px-4 py-3 hidden md:table-cell" onClick={() => handleSort("stock")} style={{ cursor: "pointer" }}>
                  Stock <span className="ml-1 opacity-50">↕</span>
                </th>
                <th className="px-4 py-3 hidden lg:table-cell" onClick={() => handleSort("price")} style={{ cursor: "pointer" }}>
                  Price <span className="ml-1 opacity-50">↕</span>
                </th>
                <th className="px-4 py-3 hidden xl:table-cell" onClick={() => handleSort("totalValue")} style={{ cursor: "pointer" }}>
                  Value <span className="ml-1 opacity-50">↕</span>
                </th>
                <th className="px-4 py-3 hidden md:table-cell">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  const totalValue = product.stock * product.price;
                  const isSelected = selectedIds.has(product._id);
                  return (
                    <tr
                      key={product._id}
                      className={`border-b border-border/50 transition ${
                        isSelected ? "bg-primary-50" : ""
                      } ${product.stock <= 0 ? "opacity-60" : ""}`}
                    >
                      <td className="px-4 py-3">
                        {bulkMode && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleBulkSelect(product._id)}
                            className="h-4 w-4 rounded border-border"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-text truncate max-w-xs">{product.name}</p>
                            <p className="text-xs text-text-muted">{product.category || "Uncategorized"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell font-mono font-bold text-text">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-text-muted">
                        {formatBDT(product.price)}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell font-mono font-semibold text-text">
                        {formatBDT(totalValue)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-text-muted">
                        {product.category || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${stockStatus.className}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openAdjust(product)}
                          disabled={adjustStock.isPending}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary-300 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-800 transition hover:bg-primary-100 disabled:opacity-50"
                        >
                          <Warehouse className="h-3.5 w-3.5" />
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          pageSize={pagination.limit}
          onPageChange={(page) => queryClient.setQueryData([...queryKeys.inventory, params], (old) => old ? { ...old, pagination: { ...old.pagination, page } } : old)}
          className="mt-4"
        />
      </section>

      {/* Adjust Stock Modal */}
      {adjustId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-text">Adjust Stock</h2>
              <button
                type="button"
                onClick={() => setAdjustId(null)}
                aria-label="Close"
                className="rounded-full p-2 text-text-muted transition hover:bg-primary-50 hover:text-primary-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdjust} className="mt-5 space-y-4">
              <p className="text-sm text-text-muted">
                Use positive numbers to add stock, negative to remove (e.g., damaged goods).
              </p>

              <label className="block">
                <span className={labelClass}>Adjustment (units)</span>
                <input
                  type="number"
                  required
                  step="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="+10 or -3"
                  className={fieldClass}
                  autoFocus
                />
              </label>

              <label className="block">
                <span className={labelClass}>Reason</span>
                <input
                  required
                  maxLength={200}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Stock take, damaged goods, supplier return, correction..."
                  className={fieldClass}
                />
              </label>

              {adjustError && (
                <p className="rounded-xl border border-primary-300 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900">
                  {adjustError}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={adjustStock.isPending} className={primaryButtonClass}>
                  <Truck className="h-4 w-4" />
                  {adjustStock.isPending ? "Adjusting..." : "Apply Adjustment"}
                </button>
                <button type="button" onClick={() => setAdjustId(null)} className={ghostButtonClass}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryAdmin;