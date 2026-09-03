import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Menu, X, UserRound, ShoppingBasket, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from './useTheme';
import { productsData } from '../Pages/Home/Home';
import { formatBDT } from './currency';

const Navbar = ({ onCartClick, onAccountClick, cartCount, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const matchingProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return productsData.filter((product) => `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query)).slice(0, 5);
  }, [search]);

  const handleSearch = (event) => {
    event.preventDefault();
    if (!search.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
  };

  const handleProductSelect = (product) => {
    setSearch(product.name);
    navigate(`/shop?q=${encodeURIComponent(product.name)}`);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-secondary-100 bg-surface/95 shadow-sm backdrop-blur">
      <div className="bg-secondary-900 px-4 py-2 text-center text-xs font-semibold tracking-wide text-surface">
        New adventures are waiting in the A to Z shop
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-18 items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="shrink-0">
            <a href="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-text sm:text-2xl">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-sm sm:h-10 sm:w-10">
                <Sparkles className="h-5 w-5" />
              </span>
              A to Z<span className="text-primary-600">Kids</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-semibold text-text transition-colors duration-200 hover:text-primary-600"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="relative mx-2 hidden max-w-xs flex-1 md:flex">
            <div className="relative w-full">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="text"
                placeholder="Search products..."
                className="w-full rounded-full border border-secondary-200 bg-secondary-50 px-4 py-2 pl-10 pr-4 text-text outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-text-muted"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
            </div>
            <SearchResults products={matchingProducts} onSelect={handleProductSelect} />
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onAccountClick}
              aria-label={user ? `Account: ${user.email}` : 'My account'}
              className="hidden rounded-full p-2 text-text transition hover:bg-secondary-100 hover:text-primary-600 md:block"
            >
              <UserRound className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onCartClick}
              aria-label="Shopping basket"
              className="relative rounded-full p-2 text-text transition hover:bg-secondary-100 hover:text-primary-600"
            >
              <ShoppingBasket className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-800 text-xs font-bold text-text">{cartCount}</span>}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              className="rounded-full p-2 text-text transition hover:bg-secondary-100 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="rounded-full p-2 text-text transition hover:bg-secondary-100 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 md:hidden"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-secondary-100 bg-surface px-4 py-5 md:hidden">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative mb-4 w-full">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="text"
              placeholder="Search products..."
              className="w-full rounded-full border border-secondary-200 bg-secondary-50 px-4 py-2 pl-10 pr-4 text-text outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-text-muted"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
            <SearchResults products={matchingProducts} onSelect={handleProductSelect} />
          </form>

          {/* Mobile Links */}
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="rounded-xl px-3 py-2 font-semibold text-text transition-colors duration-200 hover:bg-primary-50 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                onAccountClick();
                setIsMenuOpen(false);
              }}
              className="rounded-xl px-3 py-2 text-left font-semibold text-text transition-colors duration-200 hover:bg-primary-50 hover:text-primary-600"
            >
              My Account
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const SearchResults = ({ products, onSelect }) => {
  if (!products.length) return null;

  return <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-surface p-2 text-left shadow-xl">{products.map((product) => <button key={product.name} type="button" onClick={() => onSelect(product)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-primary-50"><img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-text">{product.name}</strong><span className="block text-xs text-text-muted">{product.category}</span></span><span className="shrink-0 text-sm font-bold text-primary-700">{formatBDT(product.price)}</span></button>)}</div>;
};

export default Navbar;