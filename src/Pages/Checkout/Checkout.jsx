import { useState } from "react";
import { ArrowLeft, CheckCircle2, MessageCircle, ShieldCheck, Truck, Minus, Plus } from "lucide-react";
import { Link } from "react-router";
import { useCart } from "../../Shared/useCart";
import { formatBDT, toBDTAmount } from "../../Shared/currency";
import { createWhatsAppUrl } from "../../Shared/whatsapp";
import { pagesData } from "../../data/pages";
import { storeData } from "../../data/store";

const Checkout = () => {
  const { items, subtotal, updateQuantity, clearCart } = useCart();
  const [isComplete, setIsComplete] = useState(false);
  const [address, setAddress] = useState({ name: "", line: "", city: "", postal: "" });

  const copy = pagesData.checkout;
  const shipping = items.length > 0 ? storeData.checkout.shippingFee : 0;
  const total = subtotal + shipping;

  const handleWhatsAppOrder = (event) => {
    event.preventDefault();
    const orderLines = items
      .map((item) => `${item.name} x${item.quantity} - ${formatBDT(item.price)}`)
      .join("\n");
    const message = `Hello! I would like to place an order.\n\n${orderLines}\n\nTotal: ${formatBDT(total)}\nDelivery to: ${address.name}, ${address.line}, ${address.city}, ${address.postal}`;
    window.open(createWhatsAppUrl(message), "_blank", "noopener,noreferrer");
    clearCart();
    setIsComplete(true);
  };

  if (isComplete)
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-primary-600" />
        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-primary-600">
          {copy.successEyebrow}
        </p>
        <h1 className="mt-2 text-4xl font-black text-text">{copy.successTitle}</h1>
        <p className="mt-4 max-w-md leading-relaxed text-text-muted">{copy.successMessage}</p>
        <Link to="/" className="mt-8 rounded-xl bg-primary-600 px-6 py-3 font-bold text-white hover:bg-primary-700">
          {copy.successCta}
        </Link>
      </div>
    );

  return (
    <div className="bg-surface-soft px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shopping
        </Link>
        <div className="mt-7 grid gap-6 sm:gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={handleWhatsAppOrder} className="space-y-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary-600">{copy.eyebrow}</p>
              <h1 className="mt-2 text-4xl font-black text-text">{copy.title}</h1>
              <p className="mt-2 text-text-muted">{copy.intro}</p>
            </div>
            <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black text-text">{copy.addressTitle}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-text">{copy.fields.name}</span>
                  <input
                    required
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-soft px-4 py-3 text-text outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-text">{copy.fields.line}</span>
                  <input
                    required
                    value={address.line}
                    onChange={(e) => setAddress({ ...address, line: e.target.value })}
                    placeholder={copy.fields.linePlaceholder}
                    className="w-full rounded-xl border border-border bg-surface-soft px-4 py-3 text-text outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-text">{copy.fields.city}</span>
                  <input
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-soft px-4 py-3 text-text outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-text">{copy.fields.postal}</span>
                  <input
                    required
                    value={address.postal}
                    onChange={(e) => setAddress({ ...address, postal: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-soft px-4 py-3 text-text outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
              </div>
            </section>
            <button
              type="submit"
              disabled={items.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-lg font-black text-white transition hover:bg-[#1ebe5d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MessageCircle className="h-6 w-6" />{" "}
              {items.length === 0 ? copy.emptySubmitLabel : copy.submitLabel}
            </button>
            <p className="text-center text-xs text-text-muted">{copy.disclaimer}</p>
          </form>

          <aside className="h-fit rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
            <h2 className="text-xl font-black text-text">{copy.summaryTitle}</h2>
            {items.length === 0 ? (
              <p className="mt-6 text-sm leading-relaxed text-text-muted">{copy.emptyBasket}</p>
            ) : (
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div key={item.name} className="flex min-w-0 gap-3">
                    <img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-text">{item.name}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-border">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() => updateQuantity(item.name, item.quantity - 1)}
                            className="p-1 hover:bg-secondary-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-7 text-center text-sm font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() => updateQuantity(item.name, item.quantity + 1)}
                            className="p-1 hover:bg-secondary-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 text-right text-sm font-bold text-text sm:text-base">
                      {formatBDT(toBDTAmount(item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border pt-4 text-sm">
                  <div className="flex justify-between text-text-muted">
                    <span>{copy.subtotalLabel}</span>
                    <span>{formatBDT(subtotal)}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-text-muted">
                    <span>{copy.shippingLabel}</span>
                    <span>{formatBDT(shipping)}</span>
                  </div>
                  <div className="mt-4 flex justify-between text-xl font-black text-text">
                    <span>{copy.totalLabel}</span>
                    <span className="text-primary-700">{formatBDT(total)}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm font-semibold text-text-muted">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-secondary-800" /> Delivery confirmed on WhatsApp
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary-600" /> No payment details stored
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;