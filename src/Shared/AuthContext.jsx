import { useMemo, useState } from 'react';
import { AuthContext } from './auth-context';

const AUTH_STORAGE_KEY = 'a-to-z-kids-user';
const ORDERS_STORAGE_KEY = 'a-to-z-kids-orders';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch {
      return [];
    }
  });

  const login = (email, method = 'email') => {
    const nextUser = { email: email || 'google-user@demo.local', method };
    setUser(nextUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const saveOrder = (order) => {
    setOrders((currentOrders) => {
      const nextOrders = [{ ...order, id: `AZ-${Date.now()}` }, ...currentOrders];
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
      return nextOrders;
    });
  };

  const value = useMemo(() => ({ user, login, logout, orders, saveOrder }), [orders, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
