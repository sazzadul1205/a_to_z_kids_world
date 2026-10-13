import { useState, useMemo, useCallback } from "react";
import {
  Search, Phone, Mail, MapPin, DollarSign, CreditCard, Eye, ChevronDown,
} from "lucide-react";
import { useCustomersQuery, useCustomerSearchQuery, useCustomerDetailQuery } from "../../../Frontend/hooks/useAdminQueries";
import { formatBDT } from "../../../Frontend/lib/currency";
import {
  AdminEmpty,
  AdminError,
  AdminLoader,
  AdminHeader,
  AdminDataTable,
  StatCard,
  StatusPill,
  fieldClass,
  ghostButtonClass,
} from "../../admin-ui";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const params = { page, limit: pageSize, search: searchQuery };

  const { data, status, error, refetch } = useCustomersQuery(params);
  const { data: searchResults, status: searchStatus } = useCustomerSearchQuery(searchTerm);
  const { data: customerDetail, status: detailStatus } = useCustomerDetailQuery(selectedCustomerPhone);

  const customers = useMemo(() => data?.customers || [], [data?.customers]);
  const pagination = data?.pagination || { page: 1, limit: pageSize, total: 0, totalPages: 0 };

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setSearchQuery("");
      setPage(1);
    }
  }, []);

  const handleViewDetail = useCallback((phone) => {
    setSelectedCustomerPhone(phone);
    setDetailOpen(true);
  }, []);

  const handleSearchSelect = useCallback((phone) => {
    setSearchTerm("");
    setSearchQuery("");
    setPage(1);
    handleViewDetail(phone);
  }, [handleViewDetail]);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedCustomerPhone(null);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const columns = useMemo(() => [
    {
      key: "name",
      className: "min-w-[180px] flex-1",
      render: (c) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-text">{c.name || "Unknown Customer"}</p>
          <p className="truncate text-xs text-text-muted">{c.phone}</p>
        </div>
      ),
    },
    {
      key: "email",
      className: "hidden md:block min-w-[200px]",
      render: (c) => c.email ? (
        <span className="flex items-center gap-1 text-sm text-text-muted truncate">
          <Mail className="h-3 w-3" /> {c.email}
        </span>
      ) : (
        <span className="text-xs text-text-muted">—</span>
      ),
    },
    {
      key: "orderCount",
      className: "hidden sm:block w-24 text-center",
      render: (c) => (
        <span className="text-sm font-medium text-text">{c.orderCount}</span>
      ),
    },
    {
      key: "totalSpent",
      className: "hidden sm:block w-32 text-right",
      render: (c) => (
        <span className="text-sm font-bold text-secondary-1000">{formatBDT(c.totalSpent)}</span>
      ),
    },
    {
      key: "totalBalance",
      className: "hidden sm:block w-32 text-right",
      render: (c) => (
        <span className={`text-sm font-bold ${c.totalBalance > 0 ? "text-accent-800" : "text-primary-700"}`}>
          {formatBDT(c.totalBalance)}
        </span>
      ),
    },
    {
      key: "lastOrderDate",
      className: "hidden md:block w-40 text-right",
      render: (c) => (
        <span className="text-xs text-text-muted">
          {new Date(c.lastOrderDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "actions",
      className: "w-20 shrink-0",
      render: (c) => (
        <button
          type="button"
          onClick={() => handleViewDetail(c.phone)}
          className={ghostButtonClass}
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ], [handleViewDetail]);

  const stats = useMemo(() => ({
    totalCustomers: pagination.total,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    totalOutstanding: customers.reduce((sum, c) => sum + c.totalBalance, 0),
    customersWithDue: customers.filter((c) => c.hasDueOrders).length,
  }), [customers, pagination.total]);

  if (status === "loading" || status === "pending") {
    return <AdminLoader label="Loading customers..." />;
  }

  if (error) {
    return <AdminError message={error.message} onRetry={refetch} />;
  }

  return (
    <div className="space-y-8">
      <AdminHeader
        section="Customers"
        title="Customer Management"
        subtitle="View all customers and their purchase histories"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className={`${fieldClass} w-64 pl-10 pr-32`}
            autoComplete="off"
          />
          {searchResults?.customers?.length > 0 && searchStatus === "success" && (
            <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-border bg-surface shadow-lg z-10 max-h-60 overflow-y-auto">
              {searchResults.customers.map((c) => (
                <button
                  key={c.phone}
                  type="button"
                  onClick={() => handleSearchSelect(c.phone)}
                  className="w-full px-4 py-2.5 text-left hover:bg-primary-50 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text truncate">{c.name}</p>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-primary-700 font-bold">{c.orderCount} orders</p>
                    {c.totalBalance > 0 && (
                      <p className="text-xs text-accent-800 font-bold">{formatBDT(c.totalBalance)} due</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </AdminHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Customers" value={stats.totalCustomers} tone="primary" />
        <StatCard label="Total Revenue" value={formatBDT(stats.totalRevenue)} tone="secondary" />
        <StatCard label="Outstanding Balance" value={formatBDT(stats.totalOutstanding)} tone="accent" />
        <StatCard label="Customers with Due" value={stats.customersWithDue} tone="accent" />
      </div>

      <AdminDataTable
        title="Customers"
        subtitle={pagination.total > 0 ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, pagination.total)} of ${pagination.total}` : "All customers"}
        items={customers}
        columns={columns}
        status={status}
        error={error}
        onReload={refetch}
        emptyTitle="No customers found"
        emptyMessage="Customers appear here after they make a purchase."
        pagination={{
          page,
          pageSize,
          total: pagination.total,
          totalPages: pagination.totalPages,
        }}
        onPaginationChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        getRowKey={(c) => c.phone}
      />

      {detailOpen && selectedCustomerPhone && (
        <CustomerDetailModal
          customer={customerDetail}
          status={detailStatus}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

function CustomerDetailModal({ customer, status, onClose }) {
  if (!customer) return null;

  if (status === "loading" || status === "pending") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-4xl rounded-2xl border border-border bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <AdminLoader label="Loading customer details..." />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-4xl rounded-2xl border border-border bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <AdminError message="Failed to load customer details" onRetry={onClose} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-border bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Customer Details</p>
            <h2 className="mt-1 text-2xl font-bold text-text">{customer.name || "Unknown Customer"}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-text-muted transition hover:bg-primary-50 hover:text-primary-700">
            <ChevronDown className="h-5 w-5 rotate-180" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Phone</p>
            <p className="font-medium text-text flex items-center gap-2">
              <Phone className="h-4 w-4 text-text-muted" /> {customer.phone}
            </p>
          </div>
          {customer.email && (
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Email</p>
              <p className="font-medium text-text flex items-center gap-2">
                <Mail className="h-4 w-4 text-text-muted" /> {customer.email}
              </p>
            </div>
          )}
          {customer.address && (
            <div className="space-y-1 sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Address</p>
              <p className="font-medium text-text flex items-center gap-2">
                <MapPin className="h-4 w-4 text-text-muted" /> {customer.address}
              </p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Total Orders</p>
            <p className="font-bold text-text">{customer.orderCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Total Spent</p>
            <p className="font-bold text-secondary-1000 flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> {formatBDT(customer.totalSpent)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Total Paid</p>
            <p className="font-bold text-primary-700 flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> {formatBDT(customer.totalPaid)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Outstanding Balance</p>
            <p className={`font-bold ${customer.totalBalance > 0 ? "text-accent-800" : "text-primary-700"} flex items-center gap-2`}>
              <DollarSign className="h-4 w-4" /> {formatBDT(customer.totalBalance)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">First Order</p>
            <p className="font-medium text-text">{new Date(customer.firstOrderDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Last Order</p>
            <p className="font-medium text-text">{new Date(customer.lastOrderDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
          </div>
        </div>

        {customer.hasDueOrders && (
          <div className="mb-6 rounded-xl border border-accent-300 bg-accent-50 px-4 py-3">
            <p className="text-sm font-bold text-accent-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> This customer has credit (Due) orders with outstanding balance.
            </p>
          </div>
        )}

        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-bold text-text mb-4">Purchase History ({customer.orders?.length || 0})</h3>
          {customer.orders?.length === 0 ? (
            <AdminEmpty title="No orders" message="This customer has no purchase history." />
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {customer.orders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-soft px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text">
                        {order.saleNumber || order._id?.slice(-8).toUpperCase()}
                        <StatusPill value={order.status} />
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        {order.items?.map((i) => i.productName).join(", ") || "No items"}
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        {new Date(order.createdAt).toLocaleString("en-GB")}
                        {order.paymentMethod && ` · ${order.paymentMethod}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-4 text-right">
                    <div>
                      <p className="text-sm font-bold text-secondary-1000">{formatBDT(order.total)}</p>
                      {order.balance > 0 && (
                        <p className="text-xs text-accent-800 font-bold">{formatBDT(order.balance)} due</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className={ghostButtonClass}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Customers;