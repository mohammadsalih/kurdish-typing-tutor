import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  Auth,
  User as FirebaseUser,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyA7qJri7eL1y4msjHM5OpfwnYWCvSwhsis",
  authDomain: "kurdish-keyboard-42230.firebaseapp.com",
  projectId: "kurdish-keyboard-42230",
  storageBucket: "kurdish-keyboard-42230.firebasestorage.app",
  messagingSenderId: "454206459794",
  appId: "1:454206459794:web:139c47cba074aef242bb4b",
  measurementId: "G-2018C4JWBX",
};

// Safe for Next.js SSR and Turbopack hot reload: check getApps().length first
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth: Auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Initialize Firestore Database
const db: Firestore = getFirestore(app);

// Initialize Analytics only in client-side environment
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGooglePopup() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error("Firebase Google Sign-In Error:", error);
    return { user: null, error: error?.message || "Google sign-in failed", code: error?.code };
  }
}

/**
 * Sign out from Firebase Auth
 */
export async function logoutFirebase() {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Firebase Sign-Out Error:", error);
    return { success: false, error: error?.message || "Sign-out failed" };
  }
}

export { app, auth, googleProvider, db, analytics, onAuthStateChanged };
export type { FirebaseUser, Firestore, Analytics };
