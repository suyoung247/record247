import { useState, useEffect } from 'react';
import { googleSignIn, observeAuthState, logout } from '@/services/authService';

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = observeAuthState((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  return { user, googleSignIn, logout };
}
