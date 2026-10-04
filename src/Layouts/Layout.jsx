import { Outlet, useLocation } from "react-router";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { useEffect, useState } from "react";
import { CartProvider } from "../Shared/CartContext";
import { useCart } from "../Shared/useCart";
import CartDrawer from "../Shared/CartDrawer";

const LayoutContent = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { itemCount } = useCart();
const location = useLocation();

  // Only on path changes: Shop rewrites its query string while typing, and
  // Home scrolls to the catalogue itself when a category is picked.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-surface text-text transition-colors duration-300">
      <Navbar onCartClick={() => setIsCartOpen(true)} cartCount={itemCount} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

const Layout = () => <CartProvider><LayoutContent /></CartProvider>;

export default Layout;