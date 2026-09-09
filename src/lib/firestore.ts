import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { PlayerStats, UserProfile } from "@/context/AuthContext";

export interface CloudUserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  stats: PlayerStats;
  updatedAt?: any;
  lastActive?: string;
}

const LOCAL_CACHE_PREFIX = "pitik_firestore_cache_";

function getLocalCache(uid: string): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_PREFIX + uid);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalCache(uid: string, data: any) {
  if (typeof window === "undefined") return;
  try {
    const prev = getLocalCache(uid) || {};
    const merged = { ...prev, ...data };
    // STRICT REQUIREMENT: Streak data must NEVER be stored in localStorage, sessionStorage, or cookies
    delete merged.streak;
    if (merged.stats && typeof merged.stats === "object") {
      delete merged.stats.streak;
    }
    localStorage.setItem(LOCAL_CACHE_PREFIX + uid, JSON.stringify(merged));
  } catch (err) {
    console.warn("Error caching Firestore data to localStorage:", err);
  }
}

/**
 * Save or update complete player stats & profile to Cloud Firestore
 * Document path: users/{uid}
 */
export async function savePlayerStatsToCloud(
  uid: string,
  stats: PlayerStats,
  profile?: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  return saveProgressionToFirestore(uid, {
    highestLevel: stats.highestLevel,
    xp: stats.xp,
    streak: stats.streak,
    level: stats.level,
    completedLevels: stats.completedLevels,
    profile,
    lastPlayedDate: stats.lastPlayedDate,
  });
}

/**
 * Direct two-way synchronization: Write newly earned stats to Firestore users/{uid}
 */
export async function saveProgressionToFirestore(
  uid: string,
  data: {
    highestLevel: number;
    highestUnlockedLevel?: number;
    xp: number;
    streak?: number;
    level?: number;
    completedLevels: Record<number, any>;
    profile?: Partial<UserProfile>;
    lastPlayedDate?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!uid) return { success: false, error: "Missing UID" };

  const highest = Number(data.highestUnlockedLevel || data.highestLevel || 1);
  const xp = Number(data.xp) || 0;
  const streak = Number(data.streak) || 0;
  const level = Number(data.level) || Math.floor(xp / 250) + 1;
  const completed = data.completedLevels || {};
  const lastPlayedDate = data.lastPlayedDate || new Date().toISOString();

  const payload: Record<string, any> = {
    highestLevel: highest,
    highestUnlockedLevel: highest,
    currentUnlockedLevel: highest,
    xp,
    streak,
    level,
    completedLevels: completed,
    completedDetails: completed,
    lastPlayedDate,
    lastActive: lastPlayedDate,
    stats: {
      highestLevel: highest,
      highestUnlockedLevel: highest,
      currentUnlockedLevel: highest,
      xp,
      streak,
      level,
      completedLevels: completed,
      lastPlayedDate,
    },
  };

  if (data.profile?.name) payload.displayName = data.profile.name;
  if (data.profile?.email) payload.email = data.profile.email;
  if (data.profile?.avatar) payload.photoURL = data.profile.avatar;

  // 1. Immediately cache locally so page refresh never loses progress
  setLocalCache(uid, payload);

  // 2. Dispatch to Cloud Firestore using setDoc with { merge: true }
  try {
    const userDocRef = doc(db, "users", uid);
    setDoc(userDocRef, { ...payload, updatedAt: serverTimestamp() }, { merge: true }).catch((err) => {
      console.warn("Firestore setDoc background note:", err?.message);
    });
    return { success: true };
  } catch (error: any) {
    console.warn("Firestore saveProgressionToFirestore warning (cached locally):", error?.message);
    return { success: true };
  }
}

/**
 * Fetch player progression from Cloud Firestore (users/{uid})
 */
export async function fetchProgressionFromFirestore(
  uid: string
): Promise<PlayerStats | null> {
  if (!uid) return null;

  try {
    const userDocRef = doc(db, "users", uid);
    const snapshot = await Promise.race([
      getDoc(userDocRef),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore fetch timed out")), 600)
      ),
    ]);

    if (snapshot && snapshot.exists()) {
      const remoteData = snapshot.data();
      const stats = remoteData?.stats || remoteData;
      const highest = Number(
        remoteData.highestUnlockedLevel ||
          remoteData.highestLevel ||
          remoteData.currentUnlockedLevel ||
          stats.highestUnlockedLevel ||
          stats.highestLevel ||
          stats.currentUnlockedLevel ||
          1
      );
      const xp = Number(remoteData.xp ?? stats.xp ?? 0);
      const streak = Number(remoteData.streak ?? stats.streak ?? 0);
      const level = Number(remoteData.level ?? stats.level ?? Math.floor(xp / 250) + 1);

      let completedLevels: Record<number, any> = {};
      if (remoteData.completedLevels && typeof remoteData.completedLevels === "object") {
        completedLevels = remoteData.completedLevels;
      } else if (remoteData.completedDetails && typeof remoteData.completedDetails === "object") {
        completedLevels = remoteData.completedDetails;
      } else if (stats.completedLevels && typeof stats.completedLevels === "object") {
        completedLevels = stats.completedLevels;
      }

      const lastPlayedDate = remoteData.lastPlayedDate || stats.lastPlayedDate || undefined;

      const parsedStats: PlayerStats = {
        highestLevel: highest,
        currentUnlockedLevel: highest,
        xp,
        streak,
        level,
        completedLevels,
        lastPlayedDate,
      };

      setLocalCache(uid, { ...remoteData, ...parsedStats });
      return parsedStats;
    }
  } catch (error: any) {
    console.warn("Firestore fetchProgressionFromFirestore warning, using cache:", error?.message);
  }

  // Fallback to local cache if Firestore is offline or API restricted
  const cached = getLocalCache(uid);
  if (cached) {
    const highest = Number(
      cached.highestUnlockedLevel ||
        cached.highestLevel ||
        cached.currentUnlockedLevel ||
        cached.stats?.highestUnlockedLevel ||
        cached.stats?.highestLevel ||
        1
    );
    const xp = Number(cached.xp ?? cached.stats?.xp ?? 0);
    const streak = Number(cached.streak ?? cached.stats?.streak ?? 0);
    const level = Number(cached.level ?? cached.stats?.level ?? Math.floor(xp / 250) + 1);
    const completedLevels = cached.completedLevels || cached.completedDetails || cached.stats?.completedLevels || {};
    const lastPlayedDate = cached.lastPlayedDate || cached.stats?.lastPlayedDate || undefined;

    return {
      highestLevel: highest,
      currentUnlockedLevel: highest,
      xp,
      streak,
      level,
      completedLevels,
      lastPlayedDate,
    };
  }

  return null;
}

/**
 * Load player progression from Cloud Firestore
 */
export async function loadPlayerStatsFromCloud(
  uid: string
): Promise<PlayerStats | null> {
  return fetchProgressionFromFirestore(uid);
}

/**
 * Subscribe to real-time player progression updates from Cloud Firestore
 */
export function subscribeToPlayerStats(
  uid: string,
  onUpdate: (stats: PlayerStats) => void
): Unsubscribe {
  if (!uid) {
    return () => {};
  }

  const userDocRef = doc(db, "users", uid);
  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const stats = data?.stats || data;
        if (stats) {
          const highestLevel = Number(
            data.highestUnlockedLevel ||
              data.highestLevel ||
              stats.highestLevel ||
              stats.currentUnlockedLevel ||
              1
          );
          onUpdate({
            highestLevel,
            xp: Number(data.xp ?? stats.xp ?? 0),
            streak: Number(data.streak ?? stats.streak ?? 0),
            level: Number(data.level ?? stats.level ?? 1),
            currentUnlockedLevel: highestLevel,
            completedLevels: data.completedLevels || data.completedDetails || stats.completedLevels || {},
            lastPlayedDate: data.lastPlayedDate || stats.lastPlayedDate,
          });
        }
      }
    },
    (error) => {
      console.warn("Firestore onSnapshot subscription warning:", error?.message);
    }
  );
}
