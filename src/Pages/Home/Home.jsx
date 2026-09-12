import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import HeroSection from "./sections/HeroSection";
import CategoriesSection from "./sections/CategoriesSection";
import ProductsSection from "./sections/ProductsSection";
import ProductModal from "./sections/ProductModal";
import { useCart } from "../../Shared/useCart";
import { productsData } from "../../data/products";

const Home = () => {
  const getCategoryFromUrl = () =>
    new URLSearchParams(window.location.search).get("category") || "All toys";
  const [selectedCategory, setSelectedCategory] = useState(getCategoryFromUrl);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const syncCategory = () => setSelectedCategory(getCategoryFromUrl());
    window.addEventListener("popstate", syncCategory);
    return () => window.removeEventListener("popstate", syncCategory);
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const url = new URL(window.location.href);
    if (category.trim().toLowerCase() === "all toys") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", category);
    }
    window.history.pushState({}, "", url);
    window.requestAnimationFrame(() => {
      document
        .getElementById("products")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const filteredProducts =
    selectedCategory.trim().toLowerCase() === "all toys"
      ? productsData
      : productsData.filter(
        (product) =>
          product.category.trim().toLowerCase() ===
          selectedCategory.trim().toLowerCase()
      );

  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <CategoriesSection
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
      <ProductsSection
        products={filteredProducts}
        selectedCategory={selectedCategory}
        onProductClick={setSelectedProduct}
      />
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product) => {
          addToCart(product);
          setSelectedProduct(null);
        }}
        onBuyNow={(product) => {
          addToCart(product);
          setSelectedProduct(null);
          navigate("/checkout");
        }}
      />
    </div>
  );
};

export default Home;