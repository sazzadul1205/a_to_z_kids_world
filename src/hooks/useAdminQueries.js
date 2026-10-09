import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authApi,
  categoriesApi,
  inventoryApi,
  ordersApi,
  productsApi,
  purchaseOrdersApi,
  reviewsApi,
  settingsApi,
  usersApi,
} from "../lib/api";
import { ADMIN_STALE_TIME, queryKeys } from "../lib/queryKeys";

// Every mutation here edits server state that other screens also read, so each
// one invalidates the keys it can affect rather than patching a local copy. That
// is the trade for not having to reason about which cache entry is authoritative.

// Stable identity, so the mutation options below do not change on every render.
function useInvalidate() {
  const client = useQueryClient();
  return useCallback(
    (keys) => Promise.all(keys.map((key) => client.invalidateQueries({ queryKey: key }))),
    [client],
  );
}

export function useReviewsQuery() {
  return useQuery({
    queryKey: queryKeys.reviews,
    queryFn: ({ signal }) => reviewsApi.list(undefined, signal),
    staleTime: ADMIN_STALE_TIME,
  });
}

export function useOrdersQuery() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: ({ signal }) => ordersApi.list(undefined, signal),
    staleTime: ADMIN_STALE_TIME,
  });
}

export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: ({ signal }) => usersApi.list(signal),
    staleTime: ADMIN_STALE_TIME,
  });
}

// The review configuration is a single store-wide switch,
// not a per-product flag, so it reads and writes the
// settings document.
export function useReviewSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.reviewSettings,
    queryFn: ({ signal }) => settingsApi.get(signal),
    select: (settings) => ({
      reviewsEnabled: settings?.reviewsEnabled !== false,
    }),
  });
}

export function useUpdateReviewSettings() {
  const client = useQueryClient();
  // Closing reviews changes what every summary reports
  // (disabled) and what every list returns, so both the
  // settings key and the whole ["reviews"] tree refresh.
  return useMutation({
    mutationFn: (reviewsEnabled) =>
      settingsApi.updateReviews(reviewsEnabled),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.settings });
      client.invalidateQueries({ queryKey: queryKeys.reviews });
    },
  });
}

export function useSessionQuery({ enabled }) {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: async ({ signal }) => {
      const payload = await authApi.me(signal);
      return payload?.user ?? null;
    },
    enabled,
    staleTime: ADMIN_STALE_TIME,
    // A rejected token must not be retried; the interceptor has already cleared
    // it, and retrying would just re-request a session that no longer exists.
    retry: false,
  });
}

export function useOrderMutations() {
  const invalidate = useInvalidate();

  return {
    updateStatus: useMutation({
      mutationFn: ({ id, status }) => ordersApi.updateStatus(id, status),
      // Status changes move product stock, so the catalogue is affected too.
      onSuccess: () => invalidate([queryKeys.orders, queryKeys.catalog]),
    }),
    remove: useMutation({
      mutationFn: (id) => ordersApi.remove(id),
      onSuccess: () => invalidate([queryKeys.orders, queryKeys.catalog]),
    }),
  };
}

export function useUserMutations() {
  const invalidate = useInvalidate();

  return {
    create: useMutation({
      mutationFn: (data) => usersApi.create(data),
      onSuccess: () => invalidate([queryKeys.users]),
    }),
    update: useMutation({
      mutationFn: ({ id, ...data }) => usersApi.update(id, data),
      onSuccess: () => invalidate([queryKeys.users]),
    }),
    remove: useMutation({
      mutationFn: (id) => usersApi.remove(id),
      onSuccess: () => invalidate([queryKeys.users]),
    }),
  };
}

export function useCategoryMutations() {
  const invalidate = useInvalidate();
  const keys = [queryKeys.categories, queryKeys.catalog];

  return {
    create: useMutation({
      mutationFn: (data) => categoriesApi.create(data),
      onSuccess: () => invalidate(keys),
    }),
    update: useMutation({
      mutationFn: ({ id, ...data }) => categoriesApi.update(id, data),
      onSuccess: () => invalidate(keys),
    }),
    remove: useMutation({
      mutationFn: (id) => categoriesApi.remove(id),
      onSuccess: () => invalidate(keys),
    }),
  };
}

export function useInventoryQuery(params) {
  return useQuery({
    queryKey: [...queryKeys.inventory, params],
    queryFn: ({ signal }) => inventoryApi.list(params, signal),
    staleTime: ADMIN_STALE_TIME,
  });
}

export function useInventoryProductQuery(id) {
  return useQuery({
    queryKey: queryKeys.inventoryProduct(id),
    queryFn: ({ signal }) => inventoryApi.getProduct(id, signal),
    enabled: !!id,
    staleTime: ADMIN_STALE_TIME,
  });
}

export function useInventoryMovementsQuery(params) {
  return useQuery({
    queryKey: [...queryKeys.inventoryMovements, params],
    queryFn: ({ signal }) => inventoryApi.getMovements(params, signal),
    staleTime: ADMIN_STALE_TIME,
  });
}

export function useInventoryAlertsQuery() {
  return useQuery({
    queryKey: queryKeys.inventoryAlerts,
    queryFn: ({ signal }) => inventoryApi.getAlerts(signal),
    staleTime: ADMIN_STALE_TIME,
  });
}

export function useInventoryMutations() {
  const invalidate = useInvalidate();
  const keys = [queryKeys.inventory, queryKeys.inventoryMovements, queryKeys.inventoryAlerts, queryKeys.catalog];

  return {
    adjustStock: useMutation({
      mutationFn: ({ id, adjustment, reason, referenceId, referenceType }) =>
        inventoryApi.adjustStock(id, adjustment, reason, referenceId, referenceType),
      onSuccess: () => invalidate(keys),
    }),
    bulkAdjustStock: useMutation({
      mutationFn: (adjustments) => inventoryApi.bulkAdjustStock(adjustments),
      onSuccess: () => invalidate(keys),
    }),
  };
}

export function useProductMutations() {
  const invalidate = useInvalidate();
  const keys = [queryKeys.products, queryKeys.catalog];

  return {
    create: useMutation({
      mutationFn: (data) => productsApi.create(data),
      onSuccess: () => invalidate(keys),
    }),
    update: useMutation({
      mutationFn: ({ id, ...data }) => productsApi.update(id, data),
      onSuccess: () => invalidate(keys),
    }),
    remove: useMutation({
      mutationFn: (id) => productsApi.remove(id),
      onSuccess: () => invalidate(keys),
    }),
    toggleActive: useMutation({
      mutationFn: (id) => productsApi.toggleActive(id),
      onSuccess: () => invalidate(keys),
    }),
    bulkDelete: useMutation({
      mutationFn: (ids) => productsApi.bulkDelete(ids),
      onSuccess: () => invalidate(keys),
    }),
    bulkSetFlag: useMutation({
      mutationFn: ({ ids, flag, value }) =>
        productsApi.bulkSetFlag(ids, flag, value),
      onSuccess: () => invalidate(keys),
    }),
    adjustStock: useMutation({
      mutationFn: ({ id, adjustment, reason }) =>
        productsApi.adjustStock(id, adjustment, reason),
      onSuccess: () => invalidate(keys),
    }),
  };
}

export function useReviewMutations() {
  const invalidate = useInvalidate();

  return {
    update: useMutation({
      mutationFn: ({ id, ...data }) => reviewsApi.update(id, data),
      // ["reviews"] is a prefix of the per-product and summary keys, so this
      // invalidates every review view at once.
      onSuccess: () => invalidate([queryKeys.reviews]),
    }),
    remove: useMutation({
      mutationFn: (id) => reviewsApi.remove(id),
      onSuccess: () => invalidate([queryKeys.reviews]),
    }),
    bulkDelete: useMutation({
      mutationFn: (ids) => reviewsApi.bulkDelete(ids),
      onSuccess: () => invalidate([queryKeys.reviews]),
    }),
    deleteByProduct: useMutation({
      mutationFn: (productId) => reviewsApi.deleteByProduct(productId),
      onSuccess: () => invalidate([queryKeys.reviews]),
    }),
  };
}

export function usePurchaseOrdersQuery(params) {
  return useQuery({
    queryKey: [...queryKeys.purchaseOrders, params],
    queryFn: ({ signal }) => purchaseOrdersApi.list(params, signal),
    staleTime: ADMIN_STALE_TIME,
  });
}

export function usePurchaseOrderQuery(id) {
  return useQuery({
    queryKey: queryKeys.purchaseOrder(id),
    queryFn: ({ signal }) => purchaseOrdersApi.get(id, signal),
    enabled: !!id,
    staleTime: ADMIN_STALE_TIME,
  });
}

export function usePurchaseOrderMutations() {
  const invalidate = useInvalidate();
  const keys = [queryKeys.purchaseOrders, queryKeys.inventory, queryKeys.inventoryMovements, queryKeys.catalog];

  return {
    create: useMutation({
      mutationFn: (data) => purchaseOrdersApi.create(data),
      onSuccess: () => invalidate(keys),
    }),
    updateStatus: useMutation({
      mutationFn: ({ id, status }) => purchaseOrdersApi.updateStatus(id, status),
      onSuccess: () => invalidate(keys),
    }),
    receive: useMutation({
      mutationFn: ({ id, items }) => purchaseOrdersApi.receive(id, items),
      onSuccess: () => invalidate(keys),
    }),
  };
}
