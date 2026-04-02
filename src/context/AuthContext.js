import React, { createContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { getIdTokenResult, onIdTokenChanged, signOut } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await getIdTokenResult(currentUser);
        setIsAdmin(Boolean(tokenResult.claims.admin));
      } catch (error) {
        console.log('Failed to read auth claims:', error);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshClaims = async () => {
    if (!auth.currentUser) {
      setIsAdmin(false);
      return null;
    }

    const tokenResult = await getIdTokenResult(auth.currentUser, true);
    setIsAdmin(Boolean(tokenResult.claims.admin));
    return tokenResult;
  };

  const logout = async (onComplete) => {
    await signOut(auth);
    if (onComplete) onComplete();
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, refreshClaims, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
