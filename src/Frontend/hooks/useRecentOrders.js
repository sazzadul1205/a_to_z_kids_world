import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../lib/api";
import { RECENT_ORDERS_STALE_TIME, queryKeys } from "../lib/queryKeys";

// Public read: the storefront shows recent completed sales so visitors can
// see the shop is active. No auth required, and a short stale time keeps the
// list fresh without hammering the API on every navigation.
export function useRecentOrders(limit = 10) {
  return useQuery({
    queryKey: queryKeys.recentOrders,
    queryFn: ({ signal }) => ordersApi.recent(limit, signal),
    staleTime: RECENT_ORDERS_STALE_TIME,
  });
}