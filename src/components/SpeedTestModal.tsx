"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Target, RotateCcw, ArrowRight, Award, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { audioManager } from "@/lib/audioManager";

interface SpeedTestModalProps {
  wpm: number;
  accuracy: number;
  totalKeystrokes: number;
  correctChars: number;
  errorCount: number;
  textTitle?: string;
  textAuthor?: string;
  onRetry: () => void;
  onBackToMap: () => void;
}

export default function SpeedTestModal({
  wpm,
  accuracy,
  totalKeystrokes,
  correctChars,
  errorCount,
  textTitle,
  textAuthor,
  onRetry,
  onBackToMap,
}: SpeedTestModalProps) {
  useEffect(() => {
    // Play celebratory sound and vocal cue
    audioManager.playLevelCelebration("ئافەرین! تاقیکردنەوەی خێراییت تەواو کرد");
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#58cc02", "#1cb0f6", "#ffd700", "#ff4b4b"],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  // Performance rating in Kurdish
  const getPerformanceBadge = () => {
    if (wpm >= 50) return { label: "خێرایی زۆر باڵا و نایاب! 🚀", color: "text-purple-600 bg-purple-50 border-purple-200" };
    if (wpm >= 35) return { label: "خێرایی نایاب و لێهاتوو! ⚡", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (wpm >= 20) return { label: "خێرایی زۆر باش! بەردەوام بە 🌟", color: "text-sky-600 bg-sky-50 border-sky-200" };
    return { label: "سەرەتایەکی باشە! هەوڵبدە خێراتر بیت 💪", color: "text-amber-600 bg-amber-50 border-amber-200" };
  };

  const badge = getPerformanceBadge();

  return (
    <AnimatePresence>
      <div
        id="speed-test-results-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 25 }}
          transition={{ type: "spring", stiffness: 350, damping: 26 }}
          className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[36px] border-2 border-white shadow-2xl p-6 md:p-8 text-slate-800 text-center overflow-hidden"
          dir="rtl"
        >
          {/* Top Decorative Floating Orb */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-300/30 rounded-full blur-2xl pointer-events-none" />

          {/* Celebratory Speedometer Icon */}
          <div className="w-16 h-16 mx-auto -mt-12 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl">
            ⚡
          </div>

          <h2 className="text-3xl font-black text-slate-900 mt-4 tracking-tight">
            کاتی تاقیکردنەوە تەواو بوو!
          </h2>
          <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">
            ئەنجامی فەرمی خێرایی تایپکردنت لە ماوەی یەک خولەکدا
          </p>

          {/* Performance Pill */}
          <div className="my-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-black shadow-xs mx-auto">
            <span className={`px-3 py-1 rounded-full border text-xs font-black ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          {/* Main Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* WPM Card */}
            <div className="bg-emerald-50/70 rounded-2xl p-4 border-2 border-emerald-200/80 flex flex-col items-center justify-center shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>خێرایی تایپکردن</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span id="result-wpm-value" className="text-4xl font-black text-emerald-600">
                  {wpm}
                </span>
                <span className="text-xs font-bold text-emerald-800">وشە لە خولەکێکدا</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-1">(WPM)</span>
            </div>

            {/* Accuracy Card */}
            <div className="bg-sky-50/70 rounded-2xl p-4 border-2 border-sky-200/80 flex flex-col items-center justify-center shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 mb-1">
                <Target className="w-4 h-4 text-sky-600" />
                <span>وردی و دروستی</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span id="result-accuracy-value" className="text-4xl font-black text-sky-600">
                  %{accuracy}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-1">ڕێژەی پیتە دروستەکان</span>
            </div>
          </div>

          {/* Secondary Details Bar */}
          <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 grid grid-cols-3 gap-2 mb-6 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">پیتە دروستەکان</span>
              <span className="text-sm font-black text-slate-800">{correctChars}</span>
            </div>
            <div className="border-x border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block">کۆی لێدانەکان</span>
              <span className="text-sm font-black text-slate-800">{totalKeystrokes}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">هەڵەکان</span>
              <span className="text-sm font-black text-rose-600">{errorCount}</span>
            </div>
          </div>

          {/* Text Attribution if available */}
          {textTitle && (
            <div className="text-[11px] font-bold text-slate-400 mb-5">
              دەقی خوێندراوە: <span className="text-slate-600 font-black">{textTitle}</span>
              {textAuthor && <span> • نووسەر: <span className="text-slate-600 font-black">{textAuthor}</span></span>}
            </div>
          )}

          {/* Action Navigation Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 3 }}
              onClick={onRetry}
              id="speed-test-retry-btn"
              className="btn-3d-green flex-1 py-3.5 px-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>دووبارە کردنەوە</span>
            </motion.button>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ y: 2 }}
              onClick={onBackToMap}
              id="speed-test-back-map-btn"
              className="btn-3d-white py-3.5 px-5 rounded-2xl font-black text-sm text-slate-700 flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
            >
              <span>نەخشەی ئاستەکان</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
