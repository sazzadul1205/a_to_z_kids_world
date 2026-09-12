import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider } from "./Shared/ThemeContext";
import Layout from "./Layouts/Layout";
import Home from "./Pages/Home/Home";
import NotFound from "./Pages/NotFound/NotFound";
import Checkout from "./Pages/Checkout/Checkout";
import Shop from "./Pages/Shop/Shop";
import { About, Contact, Privacy, Sitemap, Terms } from "./Pages/SitePages";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
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
    </ThemeProvider>
  );
}

export default App;