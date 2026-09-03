import { ShoppingBasket, Sparkles } from "lucide-react";
import { formatBDT } from "../../../Shared/currency";

const ProductsSection = ({ products, onProductClick }) => {
  return (
    <section
      id="products"
      className="bg-surface-soft px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-secondary-900">
              Little picks, big smiles
            </p>
            <h2 className="mt-2 text-3xl font-black text-text">
              Featured playthings
            </h2>
          </div>
          <span className="hidden rounded-full bg-secondary-100 px-4 py-2 text-sm font-semibold text-secondary-1000 sm:block">
            {products.length} discoveries
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.name}
              className="group overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl"
            >
              <div className={`relative ${product.tone} p-4`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-56 w-full rounded-2xl object-cover transition-transform group-hover:scale-105"
                />
                <span className="absolute left-5 top-5 rounded-full bg-surface/90 px-3 py-1 text-xs font-bold text-text backdrop-blur-sm">
                  {product.age}
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-600">
                  {product.category}
                </p>
                <h3 className="mt-2 text-xl font-black text-text">
                  {product.name}
                </h3>
                <p className="mt-2 min-h-12 text-sm leading-relaxed text-text-muted">
                  {product.description}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-2xl font-black text-secondary-1000">
                    {formatBDT(product.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onProductClick(product)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-surface transition hover:bg-primary-700 hover:scale-105 active:scale-95"
                  >
                    <ShoppingBasket className="h-4 w-4" /> Buy now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <Sparkles className="h-12 w-12 text-accent-500" />
            <p className="mt-4 text-lg">No toys in this category… yet!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
