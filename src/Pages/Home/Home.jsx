import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";
import HeroSection from "./sections/HeroSection";
import CategoriesSection from "./sections/CategoriesSection";
import ProductsSection from "./sections/ProductsSection";
import ProductModal from "./sections/ProductModal";
import { useCart } from "../../Shared/useCart";
import { useCartNotice } from "../../Shared/useCartNotice";
import CartNotice from "../../Shared/CartNotice";
import { useCatalog } from "../../context/catalog/useCatalog";
import { useLanguage } from "../../context/language/useLanguage";
import { ALL_TOYS } from "../../lib/catalog";

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { notice, report, dismiss } = useCartNotice();
  const { categories, products, status, error, reload } = useCatalog();
  const { t } = useLanguage();
  const shouldScroll = useRef(false);

  const selectedCategory = searchParams.get("category") || ALL_TOYS;

  const addAndReport = (product) => report(addToCart(product), product);

  const handleCategorySelect = (name) => {
    // Re-picking the active chip changes nothing, so leave the scroll latch
    // alone — otherwise it stays armed and fires on the next unrelated
    // category change.
    if (name === selectedCategory) return;
    shouldScroll.current = true;
    const next = new URLSearchParams(searchParams);
    if (name === ALL_TOYS) next.delete("category");
    else next.set("category", name);
    setSearchParams(next);
  };

  const scrollToProducts = useCallback(() => {
    if (!shouldScroll.current) return;
    shouldScroll.current = false;
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    scrollToProducts();
  }, [selectedCategory, scrollToProducts]);

  const filteredProducts =
    selectedCategory === ALL_TOYS
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <div className="overflow-x-hidden">
      <HeroSection />

      {status === "error" && (
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary-300 bg-primary-50 px-5 py-4">
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
        </div>
      )}

      <CategoriesSection
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        status={status}
      />

      <ProductsSection
        products={filteredProducts}
        selectedCategory={selectedCategory === ALL_TOYS ? "" : selectedCategory}
        onProductClick={setSelectedProduct}
        status={status === "error" ? "ready" : status}
      />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product) => {
          addAndReport(product);
          setSelectedProduct(null);
        }}
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

export default Home;