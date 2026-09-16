import { useEffect } from "react";
import { X, Check, ShieldCheck, Star, Truck } from "lucide-react";
import { formatBDT } from "../../../lib/currency";
const ProductModal = ({ product, onClose, onAddToCart, onBuyNow }) => {
  useEffect(() => {
    if (!product) return undefined;

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        className="relative grid max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-4xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-3xl bg-surface shadow-2xl animate-in fade-in zoom-in-95 sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] md:grid-cols-[0.85fr_1.15fr] md:grid-rows-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <button
          type="button"
          aria-label="Close product details"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-surface/80 p-2 text-text shadow-md backdrop-blur-sm transition hover:bg-primary-100 hover:text-primary-700"
        >
          <X className="h-5 w-5" />
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="h-36 w-full object-cover object-center sm:h-44 md:order-2 md:h-[430px]"
        />

        <div className="min-h-0 overflow-y-auto p-4 sm:order-1 sm:p-6 md:overflow-y-visible">
          <p className="text-sm font-bold uppercase tracking-widest text-primary-600">
            {product.category}
          </p>
          <h2
            id="product-modal-title"
            className="mt-2 pr-8 text-2xl font-black text-text sm:text-3xl"
          >
            {product.name}
          </h2>
          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-accent-900">
            <Star className="h-4 w-4 fill-accent-800 text-accent-800" />
            {product.rating}{" "}
            <span className="font-normal text-text-muted">
              ({product.reviews})
            </span>
          </div>
          <p className="mt-4 leading-relaxed text-text-muted">
            {product.description}
          </p>
          <div className="mt-4 space-y-2 rounded-2xl bg-surface-soft p-3 text-sm text-text-muted">
            <div className="flex items-center gap-3 font-semibold text-text">
              <Check className="h-5 w-5 text-primary-600" />
              Suitable for {product.age.toLowerCase()}
            </div>
            <div className="flex items-center gap-3">
              <SparkleIcon />
              Includes {product.includes}
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-secondary-800" />
              Free delivery on this discovery
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-border bg-surface-soft p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
              Our price
            </p>
            <div className="mt-1 flex items-end justify-between gap-4">
              <span className="text-3xl font-black leading-none text-primary-700">
                {formatBDT(product.price)}
              </span>
              <span className="text-right text-xs font-semibold text-text-muted">
                Easy returns
                <br />
                within 30 days
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-text-muted">
            <ShieldCheck className="h-4 w-4 text-primary-600" /> Safe checkout
            and quality-checked toys
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="w-full rounded-xl bg-primary-600 px-4 py-3 font-bold text-white transition hover:scale-105 hover:bg-primary-700"
            >
              Add to cart
            </button>

            <button
              type="button"
              onClick={() => onBuyNow(product)}
              className="w-full rounded-xl border border-border px-4 py-3 font-bold text-text transition hover:border-primary-300 hover:bg-primary-50"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SparkleIcon = () => <Star className="h-5 w-5 text-primary-600" />;

export default ProductModal;
