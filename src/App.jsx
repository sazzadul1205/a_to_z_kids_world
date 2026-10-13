import { BrowserRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "./Frontend/context/theme/ThemeContext";
import { AppQueryProvider } from "./Frontend/context/query/AppQueryProvider";
import { CatalogProvider } from "./Frontend/context/catalog/CatalogProvider";
import { LanguageProvider } from "./Frontend/context/language/LanguageProvider";
import { AuthProvider } from "./Frontend/context/auth/AuthProvider";
import { ReviewProvider } from "./Frontend/context/review/ReviewProvider";
import Layout from "./Frontend/Layout/Layout";
import Home from "./Frontend/Pages/Home/Home";
import NotFound from "./Frontend/Pages/NotFound/NotFound";
import Checkout from "./Frontend/Pages/Checkout/Checkout";
import Shop from "./Frontend/Pages/Shop/Shop";
import { About, Contact, Privacy, Sitemap, Terms } from "./Frontend/Pages/SitePages";
import Login from "./Backend/Auth/Login";
import BackendLayout from "./Backend/Layout";
import RequireAuth from "./Backend/RequireAuth";
import Dashboard from "./Backend/Pages/Dashboard/Dashboard";
import Categories from "./Backend/Pages/Categories/Categories";
import Products from "./Backend/Pages/Products/Products";
import Reviews from "./Backend/Pages/Reviews/Reviews";
import Orders from "./Backend/Pages/Orders/Orders";
import Users from "./Backend/Pages/Users/Users";
import Pos from "./Backend/Pages/Pos/Pos";
import Inventory from "./Backend/Pages/Inventory/Inventory";
import PurchaseOrders from "./Backend/Pages/PurchaseOrders/PurchaseOrders";
import ExpenseCategories from "./Backend/Pages/ExpenseCategories/ExpenseCategories";
import Expenses from "./Backend/Pages/Expenses/Expenses";
import Analytics from "./Backend/Pages/Analytics/Analytics";
import BackupRestore from "./Backend/Pages/BackupRestore/BackupRestore";
import Templates from "./Backend/Pages/Templates/Templates";
import Customers from "./Backend/Pages/Customers/Customers";

function App() {
  return (
    <AppQueryProvider>
      <ReviewProvider>
      <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <CatalogProvider>
          <BrowserRouter>
            <Routes>
              {/* Staff area. Deliberately unlinked from the storefront. */}
              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <BackendLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="pos" element={<Pos />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="purchase-orders" element={<PurchaseOrders />} />
                <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="orders" element={<Orders />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="expense-categories" element={<ExpenseCategories />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="users" element={<Users />} />
                <Route path="backup" element={<BackupRestore />} />
                <Route path="templates" element={<Templates />} />
                <Route path="customers" element={<Customers />} />
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
      </ReviewProvider>
    </AppQueryProvider>
  );
}

export default App;