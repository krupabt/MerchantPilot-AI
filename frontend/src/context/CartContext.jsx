import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCustomerCart, addToCustomerCart, updateCustomerCartItem, removeCustomerCartItem } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      setCartCount(0);
      return;
    }
    try {
      setLoading(true);
      const res = await getCustomerCart();
      const data = res.data || {};
      setCart(data);
      const items = data.items || [];
      const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(totalCount);
    } catch (err) {
      console.warn('Error refreshing customer cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
      setCartCount(0);
    }
  }, [isAuthenticated]);

  const addItem = async (productId, quantity = 1) => {
    const res = await addToCustomerCart({ product_id: productId, quantity });
    await refreshCart();
    return res.data;
  };

  const updateItemQty = async (itemId, quantity) => {
    const res = await updateCustomerCartItem(itemId, quantity);
    await refreshCart();
    return res.data;
  };

  const removeItem = async (itemId) => {
    const res = await removeCustomerCartItem(itemId);
    await refreshCart();
    return res.data;
  };

  const value = {
    cart,
    cartCount,
    loading,
    refreshCart,
    addItem,
    updateItemQty,
    removeItem
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
