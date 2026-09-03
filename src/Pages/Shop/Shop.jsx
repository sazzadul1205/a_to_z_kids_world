import { useMemo, useState } from 'react';
import { Filter, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { productsData } from '../Home/Home';
import ProductsSection from '../Home/sections/ProductsSection';
import ProductModal from '../Home/sections/ProductModal';
import { useCart } from '../../Shared/useCart';

const priceOptions = [
  { label: 'Any price', value: 'all' },
  { label: 'Under ৳2,000', value: 'under-2000' },
  { label: '৳2,000–৳4,000', value: '2000-4000' },
  { label: 'Over ৳4,000', value: 'over-4000' },
];

const Shop = () => {
  const location = useLocation();
  const search = new URLSearchParams(location.search).get('q') || '';
  const category = new URLSearchParams(location.search).get('category') || 'All toys';
  const [priceRange, setPriceRange] = useState('all');
  const [age, setAge] = useState('all');
  const [sort, setSort] = useState('featured');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const categories = ['All toys', ...new Set(productsData.map((product) => product.category))];
  const ages = [...new Set(productsData.map((product) => product.age))];

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchingProducts = productsData.filter((product) => {
      const searchableText = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesCategory = category === 'All toys' || product.category === category;
      const matchesAge = age === 'all' || product.age === age;
      const matchesPrice = priceRange === 'all'
        || (priceRange === 'under-2000' && product.price < 2000)
        || (priceRange === '2000-4000' && product.price >= 2000 && product.price <= 4000)
        || (priceRange === 'over-4000' && product.price > 4000);
      return matchesSearch && matchesCategory && matchesAge && matchesPrice;
    });

    return [...matchingProducts].sort((first, second) => {
      if (sort === 'price-low') return first.price - second.price;
      if (sort === 'price-high') return second.price - first.price;
      if (sort === 'name') return first.name.localeCompare(second.name);
      return 0;
    });
  }, [age, category, priceRange, search, sort]);

  const updateSearch = (value) => {
    const nextParams = new URLSearchParams(location.search);
    if (value.trim()) nextParams.set('q', value);
    else nextParams.delete('q');
    navigate(`/shop?${nextParams.toString()}`, { replace: true });
  };

  const selectCategory = (nextCategory) => {
    const nextParams = new URLSearchParams(location.search);
    if (nextCategory === 'All toys') nextParams.delete('category');
    else nextParams.set('category', nextCategory);
    navigate(`/shop?${nextParams.toString()}`);
  };

  const resetFilters = () => {
    setPriceRange('all');
    setAge('all');
    setSort('featured');
    navigate('/shop');
  };

  return (
    <div className="bg-surface-soft px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-sm font-bold uppercase tracking-widest text-primary-600">Explore the collection</p><h1 className="mt-2 text-4xl font-black text-text sm:text-5xl">Find your next favorite</h1><p className="mt-3 max-w-xl text-text-muted">Browse every discovery in one place, then narrow the list until the perfect plaything appears.</p></div>
          <div className="hidden rounded-2xl bg-surface px-5 py-3 text-right shadow-sm sm:block"><p className="text-2xl font-black text-primary-700">{filteredProducts.length}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">to explore</p></div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <label className="relative flex-1"><span className="sr-only">Search products</span><Search className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" /><input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search toys, skills, or adventures..." className="w-full rounded-2xl border border-border bg-surface px-4 py-3 pl-12 text-text outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100" /></label>
          <button type="button" onClick={() => setIsFiltersOpen((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 font-bold text-text transition hover:border-primary-300 lg:hidden"><SlidersHorizontal className="h-5 w-5" /> Filters</button>
          <label className="hidden items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2 text-sm font-bold text-text lg:flex"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent py-1 outline-none"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select></label>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className={`${isFiltersOpen ? 'block' : 'hidden'} h-fit rounded-3xl border border-border bg-surface p-5 lg:block lg:sticky lg:top-28`}><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-black text-text"><Filter className="h-5 w-5 text-primary-600" /> Refine</h2><button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:text-primary-900"><RotateCcw className="h-3 w-3" /> Reset</button></div><div className="mt-6"><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Category</p><div className="mt-3 space-y-1">{categories.map((item) => <button key={item} type="button" onClick={() => selectCategory(item)} className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${category === item ? 'bg-primary-600 text-white' : 'text-text hover:bg-primary-50 hover:text-primary-700'}`}>{item}</button>)}</div></div><div className="mt-6"><label className="text-xs font-bold uppercase tracking-widest text-text-muted" htmlFor="price-filter">Price</label><select id="price-filter" value={priceRange} onChange={(event) => setPriceRange(event.target.value)} className="mt-3 w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm font-semibold text-text outline-none focus:border-primary-400">{priceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div><div className="mt-6"><label className="text-xs font-bold uppercase tracking-widest text-text-muted" htmlFor="age-filter">Age group</label><select id="age-filter" value={age} onChange={(event) => setAge(event.target.value)} className="mt-3 w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm font-semibold text-text outline-none focus:border-primary-400"><option value="all">All ages</option>{ages.map((item) => <option key={item} value={item}>{item}</option>)}</select></div><label className="mt-6 flex items-center gap-3 text-sm font-semibold text-text"><input type="checkbox" className="h-4 w-4 accent-primary-600" /> In stock only</label></aside>
          <div className="min-w-0"><div className="mb-4 flex items-center justify-between gap-3"><p className="text-sm font-semibold text-text-muted">{filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}{category !== 'All toys' && <span> in <strong className="text-text">{category}</strong></span>}</p><button type="button" onClick={() => setIsFiltersOpen(false)} className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 lg:hidden">Close <X className="h-4 w-4" /></button></div><ProductsSection products={filteredProducts} selectedCategory="All discoveries" onProductClick={setSelectedProduct} /></div>
        </div>
      </div>
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={(product) => { addToCart(product); setSelectedProduct(null); }} onBuyNow={(product) => { addToCart(product); setSelectedProduct(null); navigate('/checkout'); }} />
    </div>
  );
};

export default Shop;
