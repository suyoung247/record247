import { useState, useEffect } from 'react';
import { googleSignIn, observeAuthState, logout } from '@/services/authService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState((u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, isLoading, googleSignIn, logout };
}
