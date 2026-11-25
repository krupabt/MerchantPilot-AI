import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn as apiSignIn, signUp as apiSignUp, getCurrentUser, logoutUser, updateCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('mp_auth_token'));
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on mount
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem('mp_auth_token');
      if (storedToken) {
        try {
          const res = await getCurrentUser();
          setUser(res.data);
          setToken(storedToken);
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          localStorage.removeItem('mp_auth_token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const res = await apiSignIn({ email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('mp_auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const signup = async (param1, email, password, role = 'customer', storeName = undefined, businessCategory = undefined) => {
    let payload;
    if (typeof param1 === 'object' && param1 !== null) {
      payload = param1;
    } else {
      payload = {
        name: param1,
        email,
        password,
        role,
        store_name: storeName,
        business_category: businessCategory
      };
    }
    const res = await apiSignUp(payload);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('mp_auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const updateProfile = async (profileData) => {
    const res = await updateCurrentUser(profileData);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('mp_auth_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isMerchant: user?.role === 'merchant',
    isCustomer: user?.role === 'customer' || !user?.role || user?.role === 'buyer',
    loading,
    login,
    signup,
    updateProfile,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
