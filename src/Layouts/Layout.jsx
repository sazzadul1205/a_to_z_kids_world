import { Outlet, useLocation } from "react-router";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { useEffect, useState } from "react";
import { CartProvider } from "../Shared/CartContext";
import { useCart } from "../Shared/useCart";
import CartDrawer from "../Shared/CartDrawer";
import AuthModal from "../Shared/AuthModal";
import { useAuth } from "../Shared/useAuth";

const LayoutContent = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const openAuth = () => setIsAuthOpen(true);
    window.addEventListener("open-auth", openAuth);
    return () => window.removeEventListener("open-auth", openAuth);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-surface text-text transition-colors duration-300">
      <Navbar onCartClick={() => setIsCartOpen(true)} onAccountClick={() => setIsAuthOpen(true)} onLogout={logout} cartCount={itemCount} user={user} />
      <main className="flex-1">
        <Outlet /> 
      </main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

const Layout = () => <CartProvider><LayoutContent /></CartProvider>;

export default Layout;
