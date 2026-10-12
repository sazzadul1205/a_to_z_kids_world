import { useCallback, useEffect, useMemo, useState } from "react";
import { CartContext } from "./cart-context";
import { toBDTAmount } from "../../lib/currency";
import { useCatalog } from "../catalog/useCatalog";

const CART_STORAGE_KEY = "a-to-z-kids-cart";

function readStoredCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return [];
    // Products are identified by _id; entries without one are unusable.
    return parsed
      .filter((item) => item && item._id)
      .map((item) => ({
        _id: item._id,
        name: item.name ?? "",
        price: toBDTAmount(item.price),
        image: item.image ?? "",
        stock: Number(item.stock ?? 0),
        category: item.category ?? "",
        quantity: Math.max(1, Number(item.quantity) || 1),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  // What the shopper actually chose. The view below reconciles it against the
  // catalogue before anything is shown, priced, or sent to WhatsApp.
  const [chosenItems, setChosenItems] = useState(readStoredCart);
  const { products, status } = useCatalog();
  const catalogReady = status === "ready";

  // Null until the catalogue has actually loaded — an empty list during loading
  // would look like "every product was deleted".
  const liveProducts = useMemo(
    () => (catalogReady ? new Map(products.map((product) => [product._id, product])) : null),
    [catalogReady, products],
  );

  // A stored stock figure is only a snapshot from when the item was added, and a
  // restored basket can hold a quantity the shop no longer has. Once the
  // catalogue is known, clamp each line to real availability, refresh its price,
  // and drop products that are gone or sold out. Derived during render so a
  // stale quantity is never shown.
  const items = useMemo(() => {
    if (!liveProducts) return chosenItems;

    const reconciled = [];
    for (const item of chosenItems) {
      const product = liveProducts.get(item._id);
      if (!product || product.stock <= 0) continue;
      reconciled.push({
        ...item,
        quantity: Math.min(item.quantity, product.stock),
        price: product.price,
        image: product.image || item.image,
        stock: product.stock,
        name: product.name || item.name,
        category: product.category ?? item.category,
      });
    }
    return reconciled;
  }, [chosenItems, liveProducts]);

  useEffect(() => {
    // Storage can be unavailable (private mode, quota, disabled cookies). Losing
    // persistence must not take the page down with it.
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* basket stays in memory for this session */
    }
  }, [items]);

  const addToCart = useCallback(
    (product) => {
      if (!product || product.stock <= 0) return { added: false, reason: "sold-out" };

      // The verdict is read from the rendered basket so it can be returned to
      // the caller; the mutation itself stays in a functional update so two
      // quick clicks cannot lose a change.
      const existing = items.find((item) => item._id === product._id);
      if (existing && existing.quantity >= product.stock) {
        return { added: false, reason: "stock-limit" };
      }

      setChosenItems((currentItems) => {
        const match = currentItems.find((item) => item._id === product._id);

        if (match) {
          return currentItems.map((item) =>
            item._id === product._id
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + 1, product.stock),
                  price: product.price,
                  image: product.image,
                  stock: product.stock,
                }
              : item,
          );
        }

        return [
          ...currentItems,
          {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: product.stock,
            category: product.category ?? "",
            quantity: 1,
          },
        ];
      });

      return { added: true, reason: null };
    },
    [items],
  );

  const updateQuantity = useCallback((id, quantity) => {
    setChosenItems((currentItems) => {
      const item = currentItems.find((entry) => entry._id === id);
      if (!item) return currentItems;
      if (quantity < 1) return currentItems.filter((entry) => entry._id !== id);
      // The stored stock is reconciled against the live catalogue in `items`,
      // so this is the real ceiling.
      if (item.stock <= 0) return currentItems;
      return currentItems.map((entry) =>
        entry._id === id
          ? { ...entry, quantity: Math.min(Math.floor(quantity), entry.stock) }
          : entry,
      );
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setChosenItems((currentItems) => currentItems.filter((item) => item._id !== id));
  }, []);

  const clearCart = useCallback(() => setChosenItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((total, item) => total + toBDTAmount(item.price) * item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      itemCount,
      subtotal,
    }),
    [items, addToCart, updateQuantity, removeFromCart, clearCart, itemCount, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}