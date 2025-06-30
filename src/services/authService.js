import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { firebaseAuth } from '@/libs/firebase';

export async function googleSignIn() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return await signInWithPopup(firebaseAuth, provider);
}

export async function logout() {
  return await signOut(firebaseAuth);
}

export function observeAuthState(callback) {
  return onAuthStateChanged(firebaseAuth, callback);
}
