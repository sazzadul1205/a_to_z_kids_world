import { useMemo, useState } from "react";
import { AlertTriangle, Filter, RefreshCw, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useLanguage } from "../../context/language/useLanguage";
import ProductsSection from "../Home/sections/ProductsSection";
import ProductModal from "../Home/sections/ProductModal";
import { useCart } from "../../Shared/useCart";
import { useCartNotice } from "../../Shared/useCartNotice";
import CartNotice from "../../Shared/CartNotice";
import { useCatalog } from "../../context/catalog/useCatalog";
import { ALL_TOYS } from "../../lib/catalog";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState("all");
  const [age, setAge] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { notice, report, dismiss } = useCartNotice();
  const { categories, products, status, error, reload } = useCatalog();
  const { pages, t, plural, categoryLabel, intlLocale } = useLanguage();
  const copy = pages.shop;

  const addAndReport = (product) => report(addToCart(product), product);

  const search = searchParams.get("q") || "";
  const category = searchParams.get("category") || ALL_TOYS;

  const ages = useMemo(
    () => [...new Set(products.map((p) => p.age).filter(Boolean))].sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const matching = products.filter((product) => {
      const searchableText =
        `${product.name} ${product.category} ${product.description} ${product.includes}`.toLowerCase();
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesCategory = category === ALL_TOYS || product.category === category;
      const matchesAge = age === "all" || product.age === age;
      const matchesStock = !inStockOnly || product.stock > 0;
      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "under-2000" && product.price < 2000) ||
        (priceRange === "2000-4000" && product.price >= 2000 && product.price <= 4000) ||
        (priceRange === "over-4000" && product.price > 4000);
      return matchesSearch && matchesCategory && matchesAge && matchesStock && matchesPrice;
    });

    return [...matching].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name, intlLocale);
      if (sort === "stock") return b.stock - a.stock;
      return 0;
    });
  }, [age, category, inStockOnly, intlLocale, priceRange, products, search, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const selectCategory = (nextCategory) => {
    const next = new URLSearchParams(searchParams);
    if (nextCategory === ALL_TOYS) next.delete("category");
    else next.set("category", nextCategory);
    setSearchParams(next);
  };

  const resetFilters = () => {
    setPriceRange("all");
    setAge("all");
    setInStockOnly(false);
    setSort("featured");
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="bg-surface-soft px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary-600">{copy.eyebrow}</p>
            <h1 className="mt-2 text-4xl font-black text-text sm:text-5xl">{copy.title}</h1>
            <p className="mt-3 max-w-xl text-text-muted">{copy.intro}</p>
          </div>
          <div className="hidden rounded-2xl bg-surface px-5 py-3 text-right shadow-sm sm:block">
            <p className="text-2xl font-black text-primary-700">{filteredProducts.length}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">{copy.toExploreLabel}</p>
          </div>
        </div>

        {status === "error" && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary-300 bg-primary-50 px-5 py-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary-900">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              {error?.message || t("pages.shop.catalogueError")}
            </p>
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700"
            >
              <RefreshCw className="h-4 w-4" /> {t("pages.shop.tryAgain")}
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">{t("pages.shop.searchLabel")}</span>
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" />
            <input
              value={search}
              onChange={(e) => updateParam("q", e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 pl-12 text-text outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </label>
          <button
            type="button"
            onClick={() => setIsFiltersOpen((v) => !v)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 font-bold text-text transition hover:border-primary-300 lg:hidden"
          >
            <SlidersHorizontal className="h-5 w-5" /> {copy.filtersButton}
          </button>
          <label className="hidden items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2 text-sm font-bold text-text lg:flex">
            <span>{copy.sortLabel}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent py-1 outline-none">
              {copy.sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className={`${isFiltersOpen ? "block" : "hidden"} h-fit rounded-3xl border border-border bg-surface p-5 lg:sticky lg:top-28 lg:block`}>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-black text-text">
                <Filter className="h-5 w-5 text-primary-600" /> {copy.refineTitle}
              </h2>
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:text-primary-900">
                <RotateCcw className="h-3 w-3" /> {copy.resetLabel}
              </button>
            </div>
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted">{copy.categoryLabel}</p>
              <div className="mt-3 space-y-1">
                {[ALL_TOYS, ...categories.map((item) => item.name)].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => selectCategory(item)}
                    className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${category === item ? "bg-primary-600 text-white" : "text-text hover:bg-primary-50 hover:text-primary-700"
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted" htmlFor="price-filter">{copy.priceLabel}</label>
              <select id="price-filter" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="mt-3 w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm font-semibold text-text outline-none focus:border-primary-400">
                {copy.priceOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="mt-6">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted" htmlFor="age-filter">{copy.ageLabel}</label>
              <select id="age-filter" value={age} onChange={(e) => setAge(e.target.value)} className="mt-3 w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm font-semibold text-text outline-none focus:border-primary-400">
                <option value="all">{copy.allAgesLabel}</option>
                {ages.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <label className="mt-6 flex items-center gap-3 text-sm font-semibold text-text">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 accent-primary-600"
              /> {copy.inStockLabel}
            </label>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text-muted">
                {plural("pages.shop.results", filteredProducts.length)}
                {/* The whole phrase carries the emphasis because in Bangla the
                    category suffix attaches to the word itself. */}
                {category !== ALL_TOYS && (
                  <strong className="text-text">
                    {t("pages.shop.resultsIn", { category: categoryLabel(category) })}
                  </strong>
                )}
              </p>
              <button type="button" onClick={() => setIsFiltersOpen(false)} className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 lg:hidden">
                {copy.closeLabel} <X className="h-4 w-4" />
              </button>
            </div>
            <ProductsSection
              products={filteredProducts}
              selectedCategory={copy.allDiscoveriesLabel}
              onProductClick={setSelectedProduct}
              status={status === "error" ? "ready" : status}
            />
          </div>
        </div>
      </div>
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product) => { addAndReport(product); setSelectedProduct(null); }}
        onBuyNow={(product) => {
          if (!addAndReport(product)) return;
          setSelectedProduct(null);
          navigate("/checkout");
        }}
      />

      <CartNotice notice={notice} onDismiss={dismiss} />
    </div>
  );
};

export default Shop;