import { useState } from "react";
import HeroSection from "./sections/HeroSection";
import CategoriesSection from "./sections/CategoriesSection";
import ProductsSection from "./sections/ProductsSection";
import ProductModal from "./sections/ProductModal";
import NewsletterSection from "./sections/NewsletterSection";
import { useCart } from "../../Shared/useCart";

const productsData = [
  {
    name: "Rainbow Builder Set",
    category: "Building blocks",
    price: 3499,
    age: "Ages 4–8",
    description:
      "Colorful wooden blocks for building big ideas and tiny worlds.",
    rating: "4.9",
    reviews: "128 reviews",
    includes: "42 colorful wooden pieces",
    image:
      "https://images.unsplash.com/photo-1594784053337-5b3a7f0d0b1d?auto=format&fit=crop&w=700&q=80",
    tone: "bg-accent-100",
  },
  {
    name: "Dino Discovery Kit",
    category: "Outdoor play",
    price: 2499,
    age: "Ages 5–10",
    description: "A friendly fossil-hunting adventure for curious explorers.",
    rating: "4.8",
    reviews: "96 reviews",
    includes: "Fossil tools and discovery guide",
    image:
      "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=700&q=80",
    tone: "bg-secondary-100",
  },
  {
    name: "Little Artist Easel",
    category: "Arts & crafts",
    price: 4999,
    age: "Ages 3–9",
    description:
      "A sturdy creative station for painting, doodling, and display.",
    rating: "4.9",
    reviews: "74 reviews",
    includes: "Double-sided easel and art tray",
    image:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=700&q=80",
    tone: "bg-primary-100",
  },
];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All toys");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

  const filteredProducts =
    selectedCategory === "All toys"
      ? productsData
      : productsData.filter((p) => p.category === selectedCategory);

  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <CategoriesSection
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <ProductsSection
        products={filteredProducts}
        onProductClick={setSelectedProduct}
      />
      <NewsletterSection />
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product) => {
          addToCart(product);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
};

export default Home;
