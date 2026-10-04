import { useCallback, useMemo } from "react";
import { CatalogContext } from "./catalog-context";
import { categoriesApi, productsApi } from "../../lib/api";
import { makeCategoryLookup, mapProduct } from "../../lib/catalog";
import { useResource } from "../../hooks/useResource";

export function CatalogProvider({ children }) {
  const fetcher = useCallback(async ({ signal }) => {
    const [categoryRows, productRows] = await Promise.all([
      categoriesApi.list({}, { signal }),
      productsApi.list({}, { signal }),
    ]);
    return { categories: categoryRows ?? [], products: productRows ?? [] };
  }, []);

  const {
    status,
    error,
    data,
    reload,
  } = useResource(fetcher);

  const value = useMemo(() => {
    const categories = data?.categories ?? [];
    const lookup = makeCategoryLookup(categories);
    return {
      categories,
      products: (data?.products ?? []).map((raw) => mapProduct(raw, lookup)),
      status,
      error,
      reload,
    };
  }, [data, status, error, reload]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}