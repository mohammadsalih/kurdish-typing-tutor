import { NextRequest, NextResponse } from "next/server";
import { syncServerStreakForUser, calculateServerDailyStreak } from "@/lib/streak.server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "Missing uid query parameter" }, { status: 400 });
    }

    const streakData = await syncServerStreakForUser(uid);
    return NextResponse.json({ success: true, ...streakData }, { status: 200 });
  } catch (error: any) {
    console.error("API GET /api/streak error:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, currentStreak, lastPlayedDate } = body;

    if (uid) {
      const streakData = await syncServerStreakForUser(uid);
      return NextResponse.json({ success: true, ...streakData }, { status: 200 });
    }

    // Direct calculation against authoritative server clock
    const serverNow = new Date();
    const computedStreak = calculateServerDailyStreak(
      Number(currentStreak) || 0,
      lastPlayedDate || null,
      serverNow
    );

    return NextResponse.json(
      {
        success: true,
        streak: computedStreak,
        serverTimestamp: serverNow.toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API POST /api/streak error:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
