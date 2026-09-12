import { useMemo, useState } from "react";
import { Filter, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { productsData } from "../../data/products";
import { pagesData } from "../../data/pages";
import ProductsSection from "../Home/sections/ProductsSection";
import ProductModal from "../Home/sections/ProductModal";
import { useCart } from "../../Shared/useCart";

const Shop = () => {
  const location = useLocation();
  const search = new URLSearchParams(location.search).get("q") || "";
  const category = new URLSearchParams(location.search).get("category") || "All toys";
  const [priceRange, setPriceRange] = useState("all");
  const [age, setAge] = useState("all");
  const [sort, setSort] = useState("featured");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const copy = pagesData.shop;

  const categories = ["All toys", ...new Set(productsData.map((p) => p.category))];
  const ages = [...new Set(productsData.map((p) => p.age))];

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const matching = productsData.filter((product) => {
      const searchableText = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesCategory = category === "All toys" || product.category === category;
      const matchesAge = age === "all" || product.age === age;
      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "under-2000" && product.price < 2000) ||
        (priceRange === "2000-4000" && product.price >= 2000 && product.price <= 4000) ||
        (priceRange === "over-4000" && product.price > 4000);
      return matchesSearch && matchesCategory && matchesAge && matchesPrice;
    });

    return [...matching].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [age, category, priceRange, search, sort]);

  const updateSearch = (value) => {
    const nextParams = new URLSearchParams(location.search);
    if (value.trim()) nextParams.set("q", value);
    else nextParams.delete("q");
    navigate(`/shop?${nextParams.toString()}`, { replace: true });
  };

  const selectCategory = (nextCategory) => {
    const nextParams = new URLSearchParams(location.search);
    if (nextCategory === "All toys") nextParams.delete("category");
    else nextParams.set("category", nextCategory);
    navigate(`/shop?${nextParams.toString()}`);
  };

  const resetFilters = () => {
    setPriceRange("all");
    setAge("all");
    setSort("featured");
    navigate("/shop");
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

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search products</span>
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" />
            <input
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
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
                {categories.map((item) => (
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
              <input type="checkbox" className="h-4 w-4 accent-primary-600" /> {copy.inStockLabel}
            </label>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text-muted">
                {filteredProducts.length} {filteredProducts.length === 1 ? "result" : "results"}
                {category !== "All toys" && <span> in <strong className="text-text">{category}</strong></span>}
              </p>
              <button type="button" onClick={() => setIsFiltersOpen(false)} className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 lg:hidden">
                {copy.closeLabel} <X className="h-4 w-4" />
              </button>
            </div>
            <ProductsSection products={filteredProducts} selectedCategory={copy.allDiscoveriesLabel} onProductClick={setSelectedProduct} />
          </div>
        </div>
      </div>
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product) => { addToCart(product); setSelectedProduct(null); }}
        onBuyNow={(product) => { addToCart(product); setSelectedProduct(null); navigate("/checkout"); }}
      />
    </div>
  );
};

export default Shop;