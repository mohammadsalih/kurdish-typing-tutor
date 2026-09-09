"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {
  auth,
  googleProvider,
  db,
  onAuthStateChanged,
  FirebaseUser,
} from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getGuestProgress, saveGuestProgress } from "@/lib/cookies";
import {
  saveProgressionToFirestore,
  fetchProgressionFromFirestore,
} from "@/lib/firestore";

export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  displayName: string;
  email: string;
  avatar?: string;
  photoURL?: string;
}

export interface LevelResult {
  stars: number;
  bestWpm: number;
  accuracy: number;
}

export interface PlayerStats {
  highestLevel: number;
  xp: number;
  streak: number;
  level: number;
  completedLevels: Record<number, LevelResult>;
  currentUnlockedLevel: number;
  lastPlayedDate?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isGuest: boolean;
  stats: PlayerStats;
  authLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, name?: string) => Promise<void> | void;
  loginWithGoogle: () => Promise<{ success: boolean; user?: FirebaseUser | null; error?: string }>;
  logout: () => Promise<void>;
  recordLevelCompletion: (
    levelId: number,
    wpm: number,
    accuracy: number,
    xpReward: number
  ) => { stars: number; xpEarned: number; isGuest: boolean };
  claimGuestRewards: (levelId: number, wpm: number, accuracy: number, xpReward: number) => void;
  saveLevelCompletionToFirestore: (
    levelId: number,
    stars: number,
    xpReward: number,
    wpm?: number,
    accuracy?: number
  ) => Promise<{ success: boolean; updatedStats: PlayerStats }>;
}

const DEFAULT_GUEST_STATS: PlayerStats = {
  highestLevel: 1,
  xp: 0,
  streak: 0,
  level: 1,
  completedLevels: {},
  currentUnlockedLevel: 1,
};

const USER_SESSION_KEY = "pitik_persisted_session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_GUEST_STATS);

  // Keep a ref to the latest stats to avoid stale closures in callbacks
  const statsRef = useRef<PlayerStats>(stats);
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  const userRef = useRef<UserProfile | null>(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Helper: Synchronize user data from Firestore using UID and inject into React state
  const syncUserFromFirestore = async (uid: string, profile: UserProfile) => {
    try {
      setUser(profile);
      setIsAuthModalOpen(false);

      // Fetch user document from 'users' collection in Firestore
      const remoteStats = await fetchProgressionFromFirestore(uid);
      const guestData = getGuestProgress();

      if (remoteStats) {
        // Merge guest progression if any was recorded before logging in
        let mergedCompleted = { ...remoteStats.completedLevels };
        if (guestData.completedLevels && Object.keys(guestData.completedLevels).length > 0) {
          mergedCompleted = { ...guestData.completedLevels, ...mergedCompleted };
        }

        const highestUnlocked = Math.max(
          remoteStats.highestLevel,
          guestData.unlockedLevel || 1
        );

        let authoritativeStreak = remoteStats.streak;
        try {
          const streakRes = await fetch(`/api/streak?uid=${uid}`).then((r) => r.json());
          if (streakRes.success && typeof streakRes.streak === "number") {
            authoritativeStreak = streakRes.streak;
          }
        } catch {}

        const resolvedStats: PlayerStats = {
          highestLevel: highestUnlocked,
          currentUnlockedLevel: highestUnlocked,
          xp: remoteStats.xp,
          streak: authoritativeStreak,
          level: remoteStats.level || Math.floor(remoteStats.xp / 250) + 1,
          completedLevels: mergedCompleted,
          lastPlayedDate: remoteStats.lastPlayedDate,
        };

        // Populate local React state
        setStats(resolvedStats);
      } else {
        // First-time document creation in 'users' collection
        const initialCompleted: Record<number, LevelResult> = { ...guestData.completedLevels };
        const initialHighest = Math.max(1, guestData.unlockedLevel || 1);
        const initialDate = new Date().toISOString();

        const initialStats: PlayerStats = {
          highestLevel: initialHighest,
          currentUnlockedLevel: initialHighest,
          xp: 0,
          streak: 1,
          level: 1,
          completedLevels: initialCompleted,
          lastPlayedDate: initialDate,
        };

        await saveProgressionToFirestore(uid, {
          highestLevel: initialHighest,
          highestUnlockedLevel: initialHighest,
          xp: 0,
          streak: 1,
          level: 1,
          completedLevels: initialCompleted,
          profile,
          lastPlayedDate: initialDate,
        });

        // Populate local React state
        setStats(initialStats);
      }
    } catch (error) {
      console.warn("Error during Firestore sync on load:", error);
      const guestData = getGuestProgress();
      setStats({
        highestLevel: guestData.unlockedLevel || 1,
        xp: 0,
        streak: 0,
        level: 1,
        completedLevels: guestData.completedLevels || {},
        currentUnlockedLevel: guestData.unlockedLevel || 1,
      });
    } finally {
      setAuthLoading(false);
    }
  };

  // Listen to Firebase Auth state on load & populate state from Firestore
  useEffect(() => {
    setAuthLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userProfile: UserProfile = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "یاریزان",
          displayName: firebaseUser.displayName || "یاریزان",
          email: firebaseUser.email || "",
          avatar: firebaseUser.photoURL || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        };

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userProfile));
          } catch {}
        }

        await syncUserFromFirestore(firebaseUser.uid, userProfile);
      } else {
        // Check for persisted active user session (e.g. from demo/email login)
        let storedSession: UserProfile | null = null;
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem(USER_SESSION_KEY);
            if (raw) storedSession = JSON.parse(raw);
          } catch {}
        }

        if (storedSession && storedSession.uid) {
          await syncUserFromFirestore(storedSession.uid, storedSession);
        } else {
          // Guest session
          setUser(null);
          const guestData = getGuestProgress();
          setStats({
            highestLevel: guestData.unlockedLevel || 1,
            xp: 0,
            streak: 0,
            level: 1,
            completedLevels: guestData.completedLevels || {},
            currentUnlockedLevel: guestData.unlockedLevel || 1,
          });
          setAuthLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Direct Google Sign-In with popup
  const loginWithGoogle = async (): Promise<{
    success: boolean;
    user?: FirebaseUser | null;
    error?: string;
  }> => {
    try {
      setAuthLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error: any) {
      setAuthLoading(false);
      console.error("Google sign in error:", error);
      return {
        success: false,
        error: error?.message || "Google sign-in failed",
      };
    }
  };

  // Sign out from Firebase Auth & clear persistent session
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(USER_SESSION_KEY);
      } catch {}
    }
    setUser(null);
    const guestData = getGuestProgress();
    setStats({
      highestLevel: guestData.unlockedLevel || 1,
      xp: 0,
      streak: 0,
      level: 1,
      completedLevels: guestData.completedLevels || {},
      currentUnlockedLevel: guestData.unlockedLevel || 1,
    });
  };

  // Persistent Demo / Email Login
  const login = async (email: string, name?: string) => {
    setAuthLoading(true);
    const cleanEmail = email.toLowerCase().trim();
    // Deterministic UID for persistent user identification across refreshes
    const uid = cleanEmail.includes("demo")
      ? "usr_demo_hero_pitik"
      : "usr_" + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);

    const newUser: UserProfile = {
      id: uid,
      uid,
      name: name || cleanEmail.split("@")[0] || "یاریزان",
      displayName: name || cleanEmail.split("@")[0] || "یاریزان",
      email: cleanEmail,
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newUser));
      } catch {}
    }

    await syncUserFromFirestore(uid, newUser);
  };

  const calculateStars = (accuracy: number, wpm: number): number => {
    if (accuracy >= 97 && wpm >= 25) return 5;
    if (accuracy >= 94) return 4;
    if (accuracy >= 90) return 3;
    if (accuracy >= 80) return 2;
    return 1;
  };

  /**
   * Level completion data flow:
   * Frontend dispatches a "level completed" signal to the secure backend endpoint /api/level-completed.
   * The backend independently verifies the request, calculates the new streak against
   * the authoritative server clock, updates Firestore directly, and returns updatedStats.
   */
  const saveLevelCompletionToFirestore = async (
    levelId: number,
    stars: number,
    xpReward: number,
    wpm: number = 30,
    accuracy: number = 95
  ): Promise<{ success: boolean; updatedStats: PlayerStats }> => {
    const activeUser = userRef.current;
    const current = statsRef.current;

    // Send level completion signal to backend API
    if (activeUser?.uid) {
      try {
        const response = await fetch("/api/level-completed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: activeUser.uid,
            levelId,
            stars,
            xpReward,
            wpm,
            accuracy,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.updatedStats) {
            setStats(result.updatedStats);
            return { success: true, updatedStats: result.updatedStats };
          }
        }
      } catch (err) {
        console.warn("Error calling /api/level-completed:", err);
      }
    }

    // Fallback for guest mode or offline
    const prevResult = current.completedLevels[levelId];
    const updatedCompleted: Record<number, LevelResult> = {
      ...current.completedLevels,
      [levelId]: {
        stars: Math.max(stars, prevResult?.stars || 0),
        bestWpm: Math.max(wpm, prevResult?.bestWpm || 0),
        accuracy: Math.max(accuracy, prevResult?.accuracy || 0),
      },
    };

    const nextUnlocked = Math.max(current.currentUnlockedLevel, levelId + 1);
    const newXp = current.xp + xpReward;
    const newLevel = Math.floor(newXp / 250) + 1;

    const fallbackStats: PlayerStats = {
      highestLevel: nextUnlocked,
      currentUnlockedLevel: nextUnlocked,
      xp: newXp,
      streak: current.streak,
      level: newLevel,
      completedLevels: updatedCompleted,
      lastPlayedDate: current.lastPlayedDate,
    };

    setStats(fallbackStats);
    if (!activeUser) {
      saveGuestProgress(nextUnlocked, updatedCompleted);
    }

    return { success: true, updatedStats: fallbackStats };
  };

  const recordLevelCompletion = (
    levelId: number,
    wpm: number,
    accuracy: number,
    xpReward: number
  ) => {
    const stars = calculateStars(accuracy, wpm);
    const isGuest = user === null;

    if (isGuest) {
      // Guest progression strictly in cookies (levels and stars only, NO streak)
      const nextUnlocked = Math.max(stats.currentUnlockedLevel, levelId + 1);
      const updatedCompleted = {
        ...stats.completedLevels,
        [levelId]: { stars, bestWpm: wpm, accuracy },
      };

      saveGuestProgress(nextUnlocked, updatedCompleted);

      setStats((prev) => ({
        ...prev,
        highestLevel: nextUnlocked,
        completedLevels: updatedCompleted,
        currentUnlockedLevel: nextUnlocked,
      }));

      return { stars, xpEarned: 0, isGuest: true };
    } else {
      // Authenticated user: send signal to backend
      saveLevelCompletionToFirestore(levelId, stars, xpReward, wpm, accuracy);
      return { stars, xpEarned: xpReward, isGuest: false };
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const claimGuestRewards = () => {
    openAuthModal();
  };

  if (typeof window !== "undefined") {
    (window as any).__pitikAuth = {
      login,
      logout,
      loginWithGoogle,
      saveLevelCompletionToFirestore,
    };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest: user === null,
        stats,
        authLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        loginWithGoogle,
        logout,
        recordLevelCompletion,
        claimGuestRewards,
        saveLevelCompletionToFirestore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
