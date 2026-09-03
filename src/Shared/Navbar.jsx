import { useState } from 'react';
import { Search, Menu, X, UserRound, ShoppingBasket, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from './useTheme';

const Navbar = ({ onCartClick, onAccountClick, cartCount, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

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
        <div className="flex h-18 items-center justify-between gap-4">
          {/* Logo */}
          <div className="shrink-0">
            <a href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-text sm:text-2xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-sm">
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
          <div className="mx-2 hidden max-w-xs flex-1 md:flex">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-full border border-secondary-200 bg-secondary-50 px-4 py-2 pl-10 pr-4 text-text outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-text-muted"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
            </div>
          </div>

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
          <div className="relative w-full mb-4">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-full border border-secondary-200 bg-secondary-50 px-4 py-2 pl-10 pr-4 text-text outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-text-muted"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted" />
          </div>

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

export default Navbar;