import { useMemo } from "react";
import { CatalogContext } from "./catalog-context";
import { makeCategoryLookup, mapProduct } from "../../lib/catalog";
import { useCatalogQuery } from "../../hooks/useCatalogQuery";

// Kept as a context so the nine components that read the catalogue do not each
// need to know about query keys, and so the status/error/reload shape they
// already render against stays the same.
export function CatalogProvider({ children }) {
  const { data, isPending, isError, error, refetch, isFetching } = useCatalogQuery();

  const value = useMemo(() => {
    console.log('CatalogProvider data:', data);
    const categories = data?.categories ?? [];
    const lookup = makeCategoryLookup(categories);

    // isFetching while data is present means a background refresh, which should
    // read as "ready" rather than blanking the grid back to skeletons.
    const status = isError ? "error" : isPending ? "loading" : "ready";

    const products = (data?.products ?? []).map((raw) => mapProduct(raw, lookup));
    console.log('CatalogProvider products:', products.length);
    return {
      categories,
      products,
      status,
      error,
      reload: refetch,
      isRefreshing: isFetching && !isPending,
    };
  }, [data, isPending, isError, isFetching, error, refetch]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
