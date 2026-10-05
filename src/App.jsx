import { BrowserRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "./context/theme/ThemeContext";
import { AppQueryProvider } from "./context/query/AppQueryProvider";
import { CatalogProvider } from "./context/catalog/CatalogContext";
import { LanguageProvider } from "./context/language/LanguageProvider";
import { AuthProvider } from "./Shared/AuthContext";
import Layout from "./Layouts/Layout";
import Home from "./Pages/Home/Home";
import NotFound from "./Pages/NotFound/NotFound";
import Checkout from "./Pages/Checkout/Checkout";
import Shop from "./Pages/Shop/Shop";
import { About, Contact, Privacy, Sitemap, Terms } from "./Pages/SitePages";
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminLayout from "./Pages/Admin/AdminLayout";
import RequireAdmin from "./Pages/Admin/RequireAdmin";
import Dashboard from "./Pages/Admin/Dashboard";
import CategoriesAdmin from "./Pages/Admin/CategoriesAdmin";
import ProductsAdmin from "./Pages/Admin/ProductsAdmin";
import ReviewsAdmin from "./Pages/Admin/ReviewsAdmin";
import OrdersAdmin from "./Pages/Admin/OrdersAdmin";
import UsersAdmin from "./Pages/Admin/UsersAdmin";

function App() {
  return (
    <AppQueryProvider>
      <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <CatalogProvider>
          <BrowserRouter>
            <Routes>
              {/* Staff area. Deliberately unlinked from the storefront. */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductsAdmin />} />
                <Route path="categories" element={<CategoriesAdmin />} />
                <Route path="reviews" element={<ReviewsAdmin />} />
                <Route path="orders" element={<OrdersAdmin />} />
                <Route path="users" element={<UsersAdmin />} />
              </Route>

              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="terms" element={<Terms />} />
                <Route path="sitemap" element={<Sitemap />} />
                <Route path="not-found" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
          </CatalogProvider>
        </AuthProvider>
      </ThemeProvider>
      </LanguageProvider>
    </AppQueryProvider>
  );
}

export default App;