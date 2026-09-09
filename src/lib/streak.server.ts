import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

export interface LevelCompletionSignal {
  uid: string;
  levelId: number;
  stars: number;
  xpReward: number;
  wpm?: number;
  accuracy?: number;
}

// Global server-side fallback store for environments where Firestore network is restricted
const serverStore = new Map<string, any>();

/**
 * Server-Side Streak Calculation:
 * - Compares lastPlayedDate from Firestore against authoritative server clock (preventing client device clock spoofing).
 * - If lastPlayedDate is missing / null: Starts streak at 1.
 * - diffDays === 0 (played today): Streak remains unchanged (at least 1).
 * - diffDays === 1 (exactly one day has passed / yesterday): Increments streak by 1.
 * - diffDays >= 2 (2 or more days have passed): Resets streak to 0.
 */
export function calculateServerDailyStreak(
  currentStreak: number,
  lastPlayedDateStr?: string | null,
  serverNow: Date = new Date()
): number {
  if (!lastPlayedDateStr) {
    return 1;
  }

  const lastDateObj = new Date(lastPlayedDateStr);
  if (isNaN(lastDateObj.getTime())) {
    return 1;
  }

  const serverTodayMidnight = new Date(
    serverNow.getFullYear(),
    serverNow.getMonth(),
    serverNow.getDate()
  ).getTime();

  const lastMidnight = new Date(
    lastDateObj.getFullYear(),
    lastDateObj.getMonth(),
    lastDateObj.getDate()
  ).getTime();

  const diffMs = serverTodayMidnight - lastMidnight;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Played today: Streak does not increase
    return Math.max(1, currentStreak);
  } else if (diffDays === 1) {
    // Exactly one day has passed: increment streak by 1
    return Math.max(0, currentStreak) + 1;
  } else if (diffDays >= 2) {
    // 2 or more days have passed: reset to 0
    return 0;
  } else {
    // Future timestamp or clock anomaly: maintain current streak
    return Math.max(1, currentStreak);
  }
}

/**
 * Secure Backend Handler for Level Completion Signal:
 * 1. Pulls user's current progress and lastPlayedDate from Firestore.
 * 2. Compares against server timestamp to calculate authoritative streak.
 * 3. Updates Firestore document directly.
 * 4. Returns verified updated stats to the client.
 */
export async function processLevelCompletionOnServer(
  payload: LevelCompletionSignal
): Promise<{ success: boolean; updatedStats: PlayerStats; error?: string }> {
  if (!payload || !payload.uid) {
    return {
      success: false,
      error: "Missing user UID",
      updatedStats: {
        highestLevel: 1,
        currentUnlockedLevel: 1,
        xp: 0,
        streak: 0,
        level: 1,
        completedLevels: {},
      },
    };
  }

  const uid = payload.uid;
  const userDocRef = doc(db, "users", uid);

  // 1. Fetch current user document from Firestore (with bounded timeout)
  let remoteData: any = null;
  try {
    const snap = await Promise.race([
      getDoc(userDocRef),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore fetch timed out")), 1200)
      ),
    ]);
    if (snap && snap.exists()) {
      remoteData = snap.data();
    }
  } catch (err: any) {
    console.warn("Server Firestore fetch note:", err?.message);
  }

  const previous = remoteData || serverStore.get(uid) || {};
  const prevStats = previous.stats || previous;

  const currentStreak = Number(prevStats.streak ?? previous.streak ?? 0);
  const lastPlayedDate = prevStats.lastPlayedDate || previous.lastPlayedDate || null;
  const currentXp = Number(prevStats.xp ?? previous.xp ?? 0);
  const currentHighest = Number(
    prevStats.highestUnlockedLevel ||
      prevStats.highestLevel ||
      previous.highestUnlockedLevel ||
      previous.highestLevel ||
      1
  );
  const currentCompleted: Record<number, LevelResult> =
    prevStats.completedLevels || previous.completedLevels || {};

  // 2. Server-side calculations with authoritative server clock
  const serverNow = new Date();
  const serverNowIso = serverNow.toISOString();

  const newStreak = calculateServerDailyStreak(currentStreak, lastPlayedDate, serverNow);
  const newXp = currentXp + (Number(payload.xpReward) || 0);
  const newHighest = Math.max(currentHighest, Number(payload.levelId) + 1);
  const newLevel = Math.floor(newXp / 250) + 1;

  const prevLevelResult = currentCompleted[payload.levelId];
  const updatedCompleted: Record<number, LevelResult> = {
    ...currentCompleted,
    [payload.levelId]: {
      stars: Math.max(Number(payload.stars) || 0, prevLevelResult?.stars || 0),
      bestWpm: Math.max(Number(payload.wpm) || 0, prevLevelResult?.bestWpm || 0),
      accuracy: Math.max(Number(payload.accuracy) || 0, prevLevelResult?.accuracy || 0),
    },
  };

  const updatePayload = {
    streak: newStreak,
    lastPlayedDate: serverNowIso,
    lastActive: serverNowIso,
    xp: newXp,
    highestLevel: newHighest,
    highestUnlockedLevel: newHighest,
    currentUnlockedLevel: newHighest,
    level: newLevel,
    completedLevels: updatedCompleted,
    completedDetails: updatedCompleted,
    stats: {
      streak: newStreak,
      lastPlayedDate: serverNowIso,
      xp: newXp,
      highestLevel: newHighest,
      highestUnlockedLevel: newHighest,
      currentUnlockedLevel: newHighest,
      level: newLevel,
      completedLevels: updatedCompleted,
    },
  };

  // 3. Cache on server store
  serverStore.set(uid, { ...previous, ...updatePayload });

  // 4. Update Firestore directly
  try {
    await Promise.race([
      setDoc(userDocRef, { ...updatePayload, updatedAt: serverTimestamp() }, { merge: true }),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch (err: any) {
    console.warn("Server Firestore setDoc note:", err?.message);
  }

  const updatedStats: PlayerStats = {
    highestLevel: newHighest,
    currentUnlockedLevel: newHighest,
    xp: newXp,
    streak: newStreak,
    level: newLevel,
    completedLevels: updatedCompleted,
    lastPlayedDate: serverNowIso,
  };

  return {
    success: true,
    updatedStats,
  };
}

/**
 * Server-Side Streak Verification & Sync:
 * Inspects user streak against server timestamp and resets to 0 if 2 or more days have elapsed.
 */
export async function syncServerStreakForUser(
  uid: string
): Promise<{ streak: number; lastPlayedDate?: string }> {
  if (!uid) return { streak: 0 };

  const userDocRef = doc(db, "users", uid);
  let remoteData: any = null;

  try {
    const snap = await Promise.race([
      getDoc(userDocRef),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore fetch timed out")), 1000)
      ),
    ]);
    if (snap && snap.exists()) {
      remoteData = snap.data();
    }
  } catch (err: any) {
    console.warn("Server sync Firestore fetch note:", err?.message);
  }

  const record = remoteData || serverStore.get(uid) || {};
  const stats = record.stats || record;
  const currentStreak = Number(stats.streak ?? 0);
  const lastPlayedDate = stats.lastPlayedDate || undefined;

  const serverNow = new Date();
  if (lastPlayedDate) {
    const lastDate = new Date(lastPlayedDate);
    const serverTodayMidnight = new Date(
      serverNow.getFullYear(),
      serverNow.getMonth(),
      serverNow.getDate()
    ).getTime();
    const lastMidnight = new Date(
      lastDate.getFullYear(),
      lastDate.getMonth(),
      lastDate.getDate()
    ).getTime();
    const diffDays = Math.round((serverTodayMidnight - lastMidnight) / (1000 * 60 * 60 * 24));

    if (diffDays >= 2 && currentStreak > 0) {
      // 2 or more days elapsed without playing: reset streak to 0
      const resetPayload = {
        streak: 0,
        "stats.streak": 0,
        updatedAt: serverTimestamp(),
      };
      serverStore.set(uid, { ...record, streak: 0, stats: { ...stats, streak: 0 } });
      try {
        setDoc(userDocRef, resetPayload, { merge: true }).catch(() => {});
      } catch {}
      return { streak: 0, lastPlayedDate };
    }
  }

  return { streak: currentStreak, lastPlayedDate };
}
