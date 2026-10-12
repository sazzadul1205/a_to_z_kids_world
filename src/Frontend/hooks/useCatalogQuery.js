import { useQuery } from "@tanstack/react-query";
import { categoriesApi, productsApi } from "../lib/api";
import { CATALOG_STALE_TIME, queryKeys } from "../lib/queryKeys";

// Categories and products are fetched together: the storefront needs the
// category names to render every product, so there is no useful partial state.
// One query key means one cache entry, and every consumer of useCatalog()
// shares the same request instead of each triggering its own.
export function useCatalogQuery() {
  return useQuery({
    queryKey: queryKeys.catalog,
    queryFn: async ({ signal }) => {
      const [categoryRows, productRows] = await Promise.all([
        categoriesApi.list(signal),
        productsApi.list(undefined, signal),
      ]);
      return { categories: categoryRows ?? [], products: productRows ?? [] };
    },
    staleTime: CATALOG_STALE_TIME,
  });
}
