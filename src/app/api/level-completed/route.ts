import { NextRequest, NextResponse } from "next/server";
import { processLevelCompletionOnServer } from "@/lib/streak.server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, levelId, stars, xpReward, wpm, accuracy } = body;

    if (!uid || typeof levelId !== "number") {
      return NextResponse.json(
        { success: false, error: "Invalid payload: missing uid or levelId" },
        { status: 400 }
      );
    }

    const result = await processLevelCompletionOnServer({
      uid,
      levelId,
      stars: Number(stars) || 0,
      xpReward: Number(xpReward) || 0,
      wpm: Number(wpm) || 0,
      accuracy: Number(accuracy) || 0,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("API /api/level-completed error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
