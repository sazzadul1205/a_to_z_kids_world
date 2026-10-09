import { useState, useMemo, useCallback } from "react";
import { Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Loader2, Save, X, AlertCircle, Printer, FileText } from "lucide-react";
import { useCatalog } from "../../context/catalog/useCatalog";
import { useOrderMutations, useOrdersQuery } from "../../hooks/useAdminQueries";
import { formatBDT } from "../../lib/currency";
import { confirmDialog, toastError, toastSuccess } from "../../lib/swal";
import { ReceiptModal } from "../../Components/Receipt";
import {
  AdminEmpty,
  AdminError,
  AdminLoader,
  StatCard,
  fieldClass,
  labelClass,
  primaryButtonClass,
  ghostButtonClass,
  dangerButtonClass,
} from "./admin-ui";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "mobile", label: "Mobile Banking", icon: Smartphone },
];

const PosAdmin = () => {
  const { products, status, error, reload } = useCatalog();
  const { data: orders, refetch } = useOrdersQuery();
  const { create: createOrder, remove: deleteOrder } = useOrderMutations();

  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastSale, setLastSale] = useState(null);
  const [receiptFormat, setReceiptFormat] = useState("thermal");

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive !== false && p.stock > 0),
    [products]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => {
      const product = products.find((p) => p._id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0),
    [cart, products]
  );

  const cartItemsCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const addToCart = useCallback((productId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      const product = products.find((p) => p._id === productId);
      if (!product) return prev;

      if (existing) {
        if (existing.quantity >= product.stock) {
          toastError(`Only ${product.stock} units available for ${product.name}`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  }, [products]);

  const updateQuantity = useCallback((productId, quantity) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }

    if (quantity > product.stock) {
      toastError(`Only ${product.stock} units available for ${product.name}`);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, [products]);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    if (cart.length === 0) {
      setFormError("Cart is empty. Add products first.");
      return;
    }

    if (!customerName.trim() && !customerPhone.trim()) {
      const confirmed = await confirmDialog({
        title: "No customer info?",
        text: "Are you sure you want to proceed without customer name or phone?",
        confirmText: "Yes, continue",
      });
      if (!confirmed) return;
    }

    const paidAmount = Number(amountPaid) || cartTotal;
    if (paidAmount < cartTotal && paymentMethod === "cash") {
      setFormError("Amount paid cannot be less than total for cash payments");
      return;
    }

    setSubmitting(true);
    try {
      const items = cart.map((item) => {
        const product = products.find((p) => p._id === item.productId);
        return {
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
        };
      });

      const order = await createOrder.mutateAsync({
        userId: "pos-walkin",
        items,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod,
        discount: 0,
        tax: 0,
        amountPaid: paidAmount,
        notes: notes.trim(),
        cashierId: "pos-user",
      });

      const saleData = {
        ...order,
        items: order.items.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        saleNumber: order.saleNumber,
        total: order.total,
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax,
        amountPaid: order.amountPaid,
        change: order.change,
        paymentMethod: order.paymentMethod,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        cashier: "POS User",
        createdAt: order.createdAt,
      };

      setLastSale(saleData);
      toastSuccess(`Sale completed! ${cartItemsCount} item${cartItemsCount === 1 ? "" : "s"} sold for ${formatBDT(cartTotal)}`);
      clearCart();
      setCustomerName("");
      setCustomerPhone("");
      setNotes("");
      setAmountPaid("");
      refetch();
    } catch (err) {
      setFormError(err.message);
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrder = async (order) => {
    const confirmed = await confirmDialog({
      title: "Delete this order?",
      text: "Stock will be returned to the product.",
      confirmText: "Yes, delete",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await deleteOrder.mutateAsync(order._id);
      toastSuccess("Order deleted and stock restored.");
      refetch();
    } catch (err) {
      toastError(err.message);
    }
  };

  const sortedProducts = useMemo(
    () =>
      [...activeProducts]
        .filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [activeProducts, searchTerm]
  );

  const productsByCategory = useMemo(() => {
    const grouped = {};
    sortedProducts.forEach((product) => {
      const cat = product.category || "Uncategorized";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(product);
    });
    return grouped;
  }, [sortedProducts]);

  const categoryNames = Object.keys(productsByCategory).sort();

  if (status === "loading") return <AdminLoader label="Loading products..." />;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Point of Sale</p>
          <h1 className="mt-1 text-3xl font-black text-text sm:text-4xl">Manual Sales</h1>
        </div>
      </header>

      {error && <AdminError message={error.message} onRetry={reload} />}
      {formError && (
        <div className="rounded-2xl border border-primary-300 bg-primary-50 px-5 py-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-primary-700" />
          <p className="text-sm font-semibold text-primary-900">{formError}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-text">Product Catalogue</h2>
              <span className="text-sm text-text-muted">{activeProducts.length} available</span>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Search products..."
                className={`${fieldClass} flex-1`}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-4">
              {categoryNames.length === 0 ? (
                <AdminEmpty title="No products available" message="Add products with stock > 0 to sell." />
              ) : (
                categoryNames.map((catName) => (
                  <div key={catName} className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted px-2">
                      {catName}
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {productsByCategory[catName].map((product) => (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => addToCart(product._id)}
                          disabled={product.stock <= 0}
                          className={`flex items-center gap-3 rounded-xl border bg-surface-soft px-3 py-2.5 transition hover:border-primary-300 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                            product.stock <= 5 && product.stock > 0 ? "border-accent-300 bg-accent-50" : ""
                          }`}
                        >
                          {product.image && (
                            <img
                              src={product.image}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-lg object-cover"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-text">{product.name}</p>
                            <p className="truncate text-xs text-text-muted">
                              {formatBDT(product.price)} · {product.stock} in stock
                            </p>
                          </div>
                          <Plus className="h-5 w-5 text-primary-600 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sticky top-24">
            <h2 className="text-lg font-black text-text flex items-center justify-between">
              Cart
              <span className="text-sm font-normal text-text-muted">({cartItemsCount} items)</span>
            </h2>

            {cart.length === 0 ? (
              <div className="mt-4 text-center py-12 text-text-muted">
                <p className="font-semibold">Cart is empty</p>
                <p className="mt-1 text-sm">Click products on the left to add them</p>
              </div>
            ) : (
              <>
                <div className="mt-4 space-y-3 max-h-[40vh] overflow-y-auto">
                  {cart.map((item) => {
                    const product = products.find((p) => p._id === item.productId);
                    if (!product) return null;
                    const lineTotal = product.price * item.quantity;
                    return (
                      <div
                        key={product._id}
                        className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-soft px-3 py-2.5"
                      >
                        {product.image && (
                          <img src={product.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-text">{product.name}</p>
                          <p className="truncate text-xs text-text-muted">{formatBDT(product.price)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="rounded-lg border border-border bg-surface p-1.5 text-text-muted hover:bg-primary-50 hover:border-primary-300 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center font-bold text-text">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
                            className="rounded-lg border border-border bg-surface p-1.5 text-text-muted hover:bg-primary-50 hover:border-primary-300 disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <span className="w-24 text-right font-bold text-text">{formatBDT(lineTotal)}</span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(product._id)}
                            className="text-primary-700 hover:text-primary-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-bold">{formatBDT(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black">
                    <span>Total</span>
                    <span>{formatBDT(cartTotal)}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className={labelClass}>Payment Method</span>
                    <div className="flex flex-wrap gap-2">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setPaymentMethod(method.value)}
                          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                            paymentMethod === method.value
                              ? "border-brand-fill bg-brand-fill/10 text-brand-fill"
                              : "border-border bg-surface text-text hover:border-primary-300"
                          }`}
                        >
                          <method.icon className="h-4 w-4" />
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </label>

                  <label className="block">
                    <span className={labelClass}>Customer Name (optional)</span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Walk-in customer"
                      className={fieldClass}
                    />
                  </label>

                  <label className="block">
                    <span className={labelClass}>Customer Phone (optional)</span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+8801XXXXXXXXX"
                      className={fieldClass}
                    />
                  </label>

                  <label className="block">
                    <span className={labelClass}>Notes (optional)</span>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Gift wrap, special instructions..."
                      className={fieldClass}
                    />
                  </label>

                  <label className="block">
                    <span className={labelClass}>Amount Paid (Cash)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder={formatBDT(cartTotal)}
                      className={fieldClass}
                    />
                    <p className="mt-1 text-xs text-text-muted">
                      Change: {formatBDT(Math.max(0, (Number(amountPaid) || cartTotal) - cartTotal))}
                    </p>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting || cart.length === 0}
                      className={`${primaryButtonClass} flex-1 py-3 text-lg`}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          Complete Sale - {formatBDT(cartTotal)}
                        </>
                      )}
                    </button>
                    {lastSale && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setReceiptFormat("thermal")}
                          className={`${ghostButtonClass} flex-1`}
                        >
                          <Printer className="h-4 w-4" /> Thermal
                        </button>
                        <button
                          type="button"
                          onClick={() => setReceiptFormat("a4")}
                          className={`${ghostButtonClass} flex-1`}
                        >
                          <FileText className="h-4 w-4" /> A4
                        </button>
                      </div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <button type="button" onClick={clearCart} className={ghostButtonClass} style={{ width: "100%" }}>
                      <X className="h-4 w-4" /> Clear Cart
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-text">
            Recent POS Orders <span className="text-text-muted">({orders?.length || 0})</span>
          </h2>
          <div className="flex items-center gap-3">
            <StatCard label="Today's Sales" value={formatBDT(
              orders?.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString())
                .reduce((sum, o) => sum + (o.total || o.totalPrice || 0), 0) || 0
            )} tone="primary" />
            <StatCard label="Today's Orders" value={
              orders?.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length || 0
            } tone="accent" />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {(orders?.length || 0) === 0 ? (
            <AdminEmpty title="No POS orders yet" message="Completed sales will appear here." />
          ) : (
            <>
              {[...orders]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 20)
                .map((order) => {
                  const firstItem = order.items?.[0];
                  const product = firstItem ? products.find((p) => p._id === firstItem.productId) : null;
                  const itemCount = order.items?.length || 1;
                  return (
                    <div
                      key={order._id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-soft px-4 py-3"
                    >
                    <div className="flex min-w-0 items-center gap-3">
                      {product?.image && (
                        <img src={product.image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-bold text-text">
                          {product?.name || firstItem?.productName || "Removed product"}
                          {itemCount > 1 && <span className="ml-2 text-xs text-text-muted">+{itemCount - 1} more</span>}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          {formatBDT(order.total || order.totalPrice)} ·{" "}
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          {order.saleNumber ? `Sale: ${order.saleNumber}` : `ID: ${order._id?.slice(-8)}`}
                          {order.customerName && ` · ${order.customerName}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <span className="text-base font-black text-secondary-1000">
                        {formatBDT(order.total || order.totalPrice)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(order)}
                        className={dangerButtonClass}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>

      {lastSale && (
        <ReceiptModal
          sale={lastSale}
          format={receiptFormat}
          onClose={() => setLastSale(null)}
          onPrint={() => {}}
        />
      )}
    </div>
  );
};

export default PosAdmin;