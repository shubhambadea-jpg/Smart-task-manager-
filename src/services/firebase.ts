import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Environment variables or fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
      firebaseConfig.projectId
  );
};

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    firestore = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization skipped or failed:', err);
  }
}

export { auth, firestore };

export async function loginWithEmail(email: string, pass: string) {
  if (!auth) throw new Error('Firebase is not configured. Please use Demo Mode or configure Firebase.');
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function registerWithEmail(email: string, pass: string) {
  if (!auth) throw new Error('Firebase is not configured. Please use Demo Mode or configure Firebase.');
  return await createUserWithEmailAndPassword(auth, email, pass);
}

export async function logoutFirebase() {
  if (auth) {
    await signOut(auth);
  }
}

export async function resetPasswordFirebase(email: string) {
  if (!auth) throw new Error('Firebase is not configured.');
  return await sendPasswordResetEmail(auth, email);
}
