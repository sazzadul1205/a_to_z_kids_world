import { useEffect, useMemo, useState } from 'react';
import { CartContext } from './cart-context';
import { toBDTAmount } from './currency';

const CART_STORAGE_KEY = 'a-to-z-kids-cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const savedItems = localStorage.getItem(CART_STORAGE_KEY);
      return savedItems ? JSON.parse(savedItems) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.name === product.name);

      if (existingItem) {
        return currentItems.map((item) => item.name === product.name
          ? { ...item, quantity: item.quantity + 1 }
          : item);
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (name, quantity) => {
    setItems((currentItems) => quantity < 1
      ? currentItems.filter((item) => item.name !== name)
      : currentItems.map((item) => item.name === name ? { ...item, quantity } : item));
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + toBDTAmount(item.price) * item.quantity, 0);

  const value = useMemo(() => ({ items, addToCart, updateQuantity, clearCart, itemCount, subtotal }), [items, itemCount, subtotal]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
