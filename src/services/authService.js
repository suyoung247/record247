import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/libs/firebase';

export async function googleSignIn() {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}

export async function logout() {
  return await signOut(auth);
}

export function observeAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}
