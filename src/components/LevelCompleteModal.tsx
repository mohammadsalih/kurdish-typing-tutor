"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, RotateCcw, ArrowLeft, ArrowRight, Flame, Sparkles, LogIn, Lock } from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import { audioManager } from "@/lib/audioManager";
import { LevelConfig } from "@/lib/curriculum";

interface LevelCompleteModalProps {
  level: LevelConfig;
  wpm: number;
  accuracy: number;
  stars: number;
  xpEarned: number;
  onNextLevel: () => void | Promise<void>;
  onRetry: () => void;
  onBackToMap: () => void;
}

export default function LevelCompleteModal({
  level,
  wpm,
  accuracy,
  stars,
  xpEarned,
  onNextLevel,
  onRetry,
  onBackToMap,
}: LevelCompleteModalProps) {
  const { isGuest, openAuthModal, claimGuestRewards } = useAuth();

  useEffect(() => {
    // Play celebratory chime and Kurdish vocal cue
    audioManager.playLevelCelebration("ئافەرین! قۆناغەکەت بە سەرکەوتوویی تێپەڕاند");
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#58cc02", "#ffd700", "#0ea5e9", "#ff4b4b"],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  const handleClaimLogin = () => {
    claimGuestRewards(level.id, wpm, accuracy, level.xpReward);
  };

  return (
    <AnimatePresence>
      <div id="level-complete-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 25 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[36px] border-2 border-white shadow-2xl p-6 md:p-8 text-slate-800 text-center"
          dir="rtl"
        >
          {/* Celebratory Icon */}
          <div className="w-16 h-16 mx-auto -mt-12 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 border-4 border-white shadow-xl flex items-center justify-center text-3xl">
            🏆
          </div>

          <h2 className="text-3xl font-black text-slate-900 mt-4 tracking-tight">
            ئاستەکە تەواو بوو!
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">
            {level.title} • {level.subtitle}
          </p>

          {/* 1-5 Star Ratings Display */}
          <div className="flex items-center justify-center gap-2 my-5">
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.div
                key={s}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: s <= stars ? 1 : 0.8, rotate: 0 }}
                transition={{ delay: s * 0.1, type: "spring", stiffness: 400 }}
              >
                <Star
                  className={`w-9 h-9 ${
                    s <= stars
                      ? "fill-amber-400 text-amber-400 filter drop-shadow-md"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              </motion.div>
            ))}
          </div>

          {/* Raw Metrics: WPM & Accuracy (Always Shown) */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-slate-50 rounded-2xl p-3 border-2 border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 block">خێرایی (وشە لە خولەکێکدا)</span>
              <span className="text-2xl font-black text-emerald-600">
                {wpm} <span className="text-xs font-bold">وشە لە خولەکێکدا</span>
              </span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 border-2 border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 block">وردی</span>
              <span className="text-2xl font-black text-sky-600">%{accuracy}</span>
            </div>
          </div>

          {/* ================= CONDITIONAL SCORING SECTION (STRICT RULE) ================= */}
          {isGuest ? (
            /* GUEST MODE: Points and Streaks COMPLETELY HIDDEN. Prominent Claim prompt displayed */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-3xl p-4 mb-6 shadow-sm text-right"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-amber-900">
                      بچۆ ژوورەوە بۆ وەرگرتنی خاڵەکان و پاراستنی ستریك!
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 mt-2">
                    وەک میوان یاری دەکەیت. بۆ هەڵگرتنی {level.xpReward} خاڵ و تۆمارکردنی ئەستێرەکانت لە هەژمارەکەتدا، ئێستا بچۆ ژوورەوە.
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 2 }}
                onClick={handleClaimLogin}
                id="claim-xp-btn"
                className="btn-3d-green w-full mt-3 py-3 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>چوونە ژوورەوە و وەرگرتنی خاڵەکان (+{level.xpReward} خاڵ)</span>
              </motion.button>
            </motion.div>
          ) : (
            /* LOGGED-IN MODE: Points and Streaks are fully displayed! */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50/80 border-2 border-emerald-300/80 rounded-3xl p-4 mb-6 shadow-xs flex items-center justify-around"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-800 block">
                    +{xpEarned || level.xpReward} خاڵ وەرگیرا
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">زیادکرا بۆ هەژمار</span>
                </div>
              </div>
              <div className="h-8 w-px bg-emerald-200" />
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <div className="text-right">
                  <span className="text-xs font-black text-amber-700 block">ستریكی بەردەوام</span>
                  <span className="text-[10px] font-bold text-slate-400">+١ ڕۆژی نوێ</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Navigation Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ y: 2 }}
              onClick={onRetry}
              className="btn-3d-white flex-1 py-3 px-4 rounded-2xl font-black text-sm text-slate-700 flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>دووبارەکردنەوە</span>
            </motion.button>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ y: 2 }}
              onClick={onBackToMap}
              className="btn-3d-white flex-1 py-3 px-4 rounded-2xl font-black text-sm text-slate-700 flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
            >
              <span>نەخشەی ئاستەکان</span>
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 4 }}
              onClick={async (e) => {
                e.stopPropagation();
                await onNextLevel();
              }}
              id="next-level-btn"
              className="btn-3d-green flex-1 py-3 px-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>ئاستی دواتر</span>
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
