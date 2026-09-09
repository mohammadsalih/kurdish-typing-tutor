// Cookie helper utilities for guest persistence and first-time onboarding routing

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function hasOnboarded(): boolean {
  return getCookie("has_onboarded") === "true";
}

export function setOnboarded(): void {
  setCookie("has_onboarded", "true", 365);
}

export interface StoredGuestProgress {
  unlockedLevel: number;
  completedLevels: Record<number, { stars: number; bestWpm: number; accuracy: number }>;
}

export function getGuestProgress(): StoredGuestProgress {
  const unlocked = parseInt(getCookie("guest_unlocked_level") || "1", 10);
  const progressStr = getCookie("guest_progress");
  let completedLevels = {};
  if (progressStr) {
    try {
      completedLevels = JSON.parse(progressStr);
    } catch {
      completedLevels = {};
    }
  }
  return {
    unlockedLevel: isNaN(unlocked) ? 1 : unlocked,
    completedLevels,
  };
}

export function saveGuestProgress(
  unlockedLevel: number,
  completedLevels: Record<number, { stars: number; bestWpm: number; accuracy: number }>
): void {
  setCookie("guest_unlocked_level", unlockedLevel.toString(), 365);
  setCookie("guest_progress", JSON.stringify(completedLevels), 365);
}
