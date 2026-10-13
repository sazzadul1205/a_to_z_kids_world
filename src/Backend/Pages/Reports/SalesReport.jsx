import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { reportsApi } from "../../../Frontend/lib/api";
import { formatBDT } from "../../../Frontend/lib/currency";
import { AdminHeader, AdminLoader, AdminError, StatCard } from "../../admin-ui";

const SalesReport = () => {

  const {
    data: dashboard,
    status,
    error,
    refetch,
  } = useQuery({
    queryKey: ["sales-report-dashboard"],
    queryFn: () => reportsApi.dashboard({ days: 30 }),
    staleTime: 0,
  });

  if (status === "loading") return <AdminLoader label="Loading analytics..." />;

  return (
    <div className="space-y-8">
      <AdminHeader section="Analytics" title="Sales Dashboard" />

      {error && <AdminError message={error.message} onRetry={refetch} />}

      {dashboard && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Revenue" value={formatBDT(dashboard.totalRevenue || 0)} tone="primary" />
            <StatCard label="Total Orders" value={dashboard.totalOrders || 0} tone="accent" />
            <StatCard label="Total Products" value={dashboard.totalProducts || 0} tone="secondary" />
            <StatCard label="Avg Order Value" value={formatBDT(dashboard.avgOrderValue || 0)} tone="secondary" />
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-lg font-black text-text">Recent Orders</h2>
            <div className="mt-4 space-y-3">
              {(dashboard.recentOrders || []).length === 0 ? (
                <p className="text-sm text-text-muted">No recent orders.</p>
              ) : (
                dashboard.recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-soft px-4 py-3"
                  >
                    <div>
                      <p className="font-bold text-text">#{order._id?.slice(-8)}</p>
                      <p className="text-xs text-text-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold text-text">{formatBDT(order.total || 0)}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-lg font-black text-text">Top Products</h2>
            <div className="mt-4 space-y-3">
              {(dashboard.topProducts || []).length === 0 ? (
                <p className="text-sm text-text-muted">No product data yet.</p>
              ) : (
                dashboard.topProducts.map((item) => (
                  <div
                    key={item._id || item.productId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-soft px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Package className="h-5 w-5 text-text-muted" />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-text">{item.name}</p>
                        <p className="text-xs text-text-muted">
                          {item.sold || 0} sales · {formatBDT(item.revenue || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default SalesReport;
