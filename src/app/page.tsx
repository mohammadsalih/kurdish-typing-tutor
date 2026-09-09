"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Volume2, VolumeX, Keyboard as KeyboardIcon, Sparkles, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import MascotCard from "@/components/MascotCard";
import Keyboard from "@/components/Keyboard";
import LevelMap from "@/components/LevelMap";
import TypingArena from "@/components/TypingArena";
import SpeedTestArena from "@/components/SpeedTestArena";
import AuthModal from "@/components/AuthModal";
import { audioManager } from "@/lib/audioManager";
import { hasOnboarded, setOnboarded } from "@/lib/cookies";
import { ALL_LEVELS, LevelConfig } from "@/lib/curriculum";

const ONBOARDING_TEXT = "سڵاو كوردستان";

function MainAppContent() {
  const { user, authLoading } = useAuth();
  const [view, setView] = useState<"onboarding" | "map" | "arena" | "speedTest">("map");
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(ALL_LEVELS[0]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasCheckedOnboarded, setHasCheckedOnboarded] = useState<boolean>(false);

  // Onboarding interactive typing state
  const [onboardIndex, setOnboardIndex] = useState<number>(0);
  const [onboardSuccess, setOnboardSuccess] = useState<boolean>(false);

  // Check cookies & auth on mount: wait for authLoading before deciding view
  useEffect(() => {
    if (authLoading) return;

    const alreadyOnboarded = hasOnboarded();
    if (!alreadyOnboarded && !user) {
      setView("onboarding");
    } else {
      setView("map");
    }
    setHasCheckedOnboarded(true);
  }, [user, authLoading]);

  const currentOnboardingChar = ONBOARDING_TEXT[onboardIndex] || "";

  // Handle interactive onboarding typing
  const handleOnboardingKey = useCallback(
    (keyChar: string) => {
      if (view !== "onboarding" || onboardSuccess) return;

      const target = ONBOARDING_TEXT[onboardIndex];
      if (!target) return;

      // Allow matching Kurdish letters and spaces
      const isMatch =
        keyChar === target ||
        (keyChar === " " && target === " ") ||
        ((target === "ك" || target === "ک") && (keyChar === "ك" || keyChar === "ک" || keyChar === "k")) ||
        (target === "س" && (keyChar === "س" || keyChar === "s")) ||
        (target === "ڵ" && (keyChar === "ڵ" || keyChar === "l")) ||
        (target === "ا" && (keyChar === "ا" || keyChar === "a")) ||
        (target === "و" && (keyChar === "و" || keyChar === "w")) ||
        (target === "ر" && (keyChar === "ر" || keyChar === "r")) ||
        (target === "د" && (keyChar === "د" || keyChar === "d")) ||
        (target === "ت" && (keyChar === "ت" || keyChar === "t")) ||
        (target === "ن" && (keyChar === "ن" || keyChar === "n"));

      if (isMatch) {
        audioManager.playMechanicalKey();
        const nextIdx = onboardIndex + 1;
        setOnboardIndex(nextIdx);

        if (nextIdx >= ONBOARDING_TEXT.length) {
          // Finished onboarding!
          setOnboardSuccess(true);
          setOnboarded(); // Save cookie has_onboarded=true

          audioManager.playLevelCelebration("ئافەرین! بەخێربێیت بۆ پیتیک");
          try {
            confetti({
              particleCount: 80,
              spread: 80,
              origin: { y: 0.55 },
              colors: ["#58cc02", "#1cb0f6", "#ffd700", "#ff4b4b"],
            });
          } catch {
            // Fallback
          }

          setTimeout(() => {
            setView("map");
          }, 1100);
        }
      } else {
        audioManager.playWrongKey();
      }
    },
    [onboardIndex, onboardSuccess, view]
  );

  // Global key listener for onboarding
  useEffect(() => {
    if (view !== "onboarding") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
      }
      if (e.key === "Tab" || e.key === "Alt" || e.key === "Control" || e.key === "Meta") return;
      handleOnboardingKey(e.key);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleOnboardingKey, view]);

  const handleSkipOnboarding = () => {
    setOnboarded();
    setView("map");
  };

  const handleSelectLevel = (level: LevelConfig) => {
    setCurrentLevel(level);
    setView("arena");
  };

  const toggleAudio = () => {
    const active = audioManager.toggleMute();
    setIsMuted(!active);
  };

  // Loading Guard: Wait for initial Auth state & Firestore sync so game does not accidentally load Level 1
  if (authLoading || !hasCheckedOnboarded) {
    return (
      <div
        id="database-loading-guard"
        className="min-h-screen w-full bg-[#f7fee7] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(254,240,138,0.65),rgba(187,247,208,0.45),rgba(240,253,244,0.9))] flex flex-col items-center justify-center p-4 select-none relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center p-8 bg-white/85 backdrop-blur-2xl rounded-[32px] border-2 border-white shadow-xl max-w-sm w-full text-center">
          {/* Animated Mascot / Brand badge */}
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#58cc02] to-[#86efac] flex items-center justify-center shadow-lg shadow-emerald-500/25 border-2 border-white">
              <span className="text-white font-black text-3xl">پ</span>
            </div>
            <div className="absolute -inset-2 border-3 border-emerald-500 border-t-transparent rounded-3xl animate-spin" />
          </div>

          <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1" dir="rtl">
            بارکردنی زانیارییەکانی یاریزان...
          </h3>
          <p className="text-xs font-bold text-slate-500 mb-4" dir="rtl">
            هاوکاتکردنی داتابەیسی پیتیک و ئاستەکانی فێربوون
          </p>

          {/* Skeleton representation of Curriculum Progress */}
          <div className="w-full space-y-2.5">
            <div className="w-full h-3 bg-emerald-100/80 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>هاوکاتکردنی داتابەیس</span>
              <span className="animate-pulse">خەریکی بەستنەوە...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f7fee7] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(254,240,138,0.65),rgba(187,247,208,0.45),rgba(240,253,244,0.9))] text-slate-800 flex flex-col justify-between p-3 md:p-6 select-none relative overflow-x-hidden">
      {/* 3D Volumetric Ambient Glow Orbs */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-yellow-300/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-emerald-400/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Global Header (Routes to map or speedTest) */}
      <Header currentView={view} onNavigate={(navView) => setView(navView)} />

      {/* Dynamic Main View Stage */}
      <main className="w-full max-w-6xl mx-auto my-auto z-10 py-2 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {view === "onboarding" && (
            /* ================= VIEW 1: FIRST-TIME ONBOARDING INTERACTIVE LOBBY ================= */
            <motion.div
              key="onboarding-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="w-full flex flex-col items-center"
            >
              <div className="relative w-full bg-white/75 backdrop-blur-2xl rounded-[36px] border-2 border-white/95 shadow-[0_20px_50px_rgba(16,185,129,0.14)] p-6 md:p-8 flex flex-col items-center">
                {/* Status Pill */}
                <div className="mb-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-700 text-xs font-extrabold shadow-inner whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>بەخێربێیت بۆ پیتیک • تاقیکردنەوەی خێرای دەستپێک</span>
                </div>

                {/* Floating Headline */}
                <motion.h1
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="floating-glow text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-center tracking-tight mb-2 drop-shadow-sm"
                >
                  سڵاو كوردستان!
                </motion.h1>

                {/* Interactive Onboarding Prompt: Type "سڵاو كوردستان" */}
                <div className="bg-slate-50/90 rounded-2xl p-4 px-6 border-2 border-slate-200/80 mb-6 flex flex-col items-center shadow-xs" dir="rtl">
                  <span className="text-xs font-bold text-slate-500 mb-1.5">
                    بۆ دەستپێکردن و چوونە ناو نەخشەی ئاستەکان، ئەم دەستەواژەیە بنووسە:
                  </span>

                  <div className="flex items-center gap-1 text-2xl md:text-3xl font-black font-mono">
                    {Array.from(ONBOARDING_TEXT).map((char, i) => {
                      const isTyped = i < onboardIndex;
                      const isCurrent = i === onboardIndex;

                      let cClass = "text-slate-400";
                      let bClass = "";

                      if (isTyped) {
                        cClass = "text-emerald-600";
                      } else if (isCurrent) {
                        cClass = "text-slate-900";
                        bClass =
                          "bg-emerald-200/90 rounded-md px-1 border-b-4 border-emerald-500 animate-pulse";
                      }

                      return (
                        <span key={i} className={`inline-block mx-0.5 transition-all ${cClass} ${bClass}`}>
                          {char === " " ? "␣" : char}
                        </span>
                      );
                    })}
                  </div>

                  {onboardSuccess ? (
                    <span className="mt-2 text-xs font-black text-emerald-600 flex items-center gap-1 animate-bounce">
                      <Sparkles className="w-4 h-4" />
                      <span>ئافەرین! دەچیتە سەر نەخشەی ئاستەکان...</span>
                    </span>
                  ) : (
                    <span className="mt-2 text-[11px] font-bold text-slate-400">
                      پیتی داواکراو: <b className="text-emerald-700 font-black px-1.5 py-0.5 bg-white rounded border border-emerald-200">{currentOnboardingChar === " " ? "بۆشایی" : currentOnboardingChar}</b>
                    </span>
                  )}
                </div>

                {/* Central Stage: Keyboard with dynamic targetKey + Mascot */}
                <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 mb-6">
                  <Keyboard
                    targetKey={currentOnboardingChar}
                    onKeyPress={handleOnboardingKey}
                  />
                  <MascotCard />
                </div>

                {/* Direct Skip / Start Action */}
                <div className="w-full flex items-center justify-center gap-4 pt-1">
                  <motion.button
                    id="skip-onboarding-btn"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98, y: 3 }}
                    onClick={handleSkipOnboarding}
                    className="btn-3d-green py-3 px-8 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>چوونە سەر نەخشەی ئاستەکان</span>
                    <ArrowLeft className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {view === "map" && (
            /* ================= VIEW 2: EDCLUB CURRICULUM MAP (DEFAULT FOR RETURNING USERS) ================= */
            <motion.div
              key="map-view"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <LevelMap
                onSelectLevel={handleSelectLevel}
                onBackToLobby={() => setView("map")}
              />
            </motion.div>
          )}

          {view === "arena" && (
            /* ================= VIEW 3: INTERACTIVE TYPING ARENA ================= */
            <motion.div
              key="arena-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <TypingArena
                key={currentLevel.id}
                level={currentLevel}
                onBackToMap={() => setView("map")}
                onNextLevel={(nextLevelId) => {
                  const nextLvl = ALL_LEVELS.find((l) => l.id === nextLevelId);
                  if (nextLvl) {
                    setCurrentLevel(nextLvl);
                  } else {
                    setView("map");
                  }
                }}
              />
            </motion.div>
          )}

          {view === "speedTest" && (
            /* ================= VIEW 4: 1-MINUTE SPEED TEST ================= */
            <motion.div
              key="speed-test-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <SpeedTestArena onBackToMap={() => setView("map")} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Footer / Status Bar */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-slate-500 px-4 z-10 py-2 gap-2">
        {/* Right in RTL */}
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            مۆدی خێرا • گونجاو لەگەڵ تەختەکلیلی فەرمی مایکرۆسۆفت سۆرانی
          </span>
        </div>

        {/* Left in RTL */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAudio}
            id="sound-toggle-btn"
            className="flex items-center gap-1.5 px-3 py-1 bg-white/70 hover:bg-white rounded-xl border border-slate-200/80 transition-colors cursor-pointer text-slate-700"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                <span>دەنگ: بێدەنگ</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>دەنگ: چالاک</span>
              </>
            )}
          </button>
          <span>•</span>
          <div className="flex items-center gap-1 px-3 py-1 bg-white/70 rounded-xl border border-slate-200/80 text-slate-700">
            <KeyboardIcon className="w-3.5 h-3.5 text-slate-600" />
            <span>تەختەکلیل: ستاندارد</span>
          </div>
        </div>
      </footer>

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
}

export default function RootPage() {
  return <MainAppContent />;
}
