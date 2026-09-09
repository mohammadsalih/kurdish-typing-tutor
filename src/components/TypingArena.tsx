"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, Zap, Target, AlertCircle } from "lucide-react";
import { LevelConfig } from "@/lib/curriculum";
import { useAuth } from "@/context/AuthContext";
import { audioManager } from "@/lib/audioManager";
import Keyboard from "@/components/Keyboard";
import LevelCompleteModal from "@/components/LevelCompleteModal";
import MilestonePopup from "@/components/MilestonePopup";

interface TypingArenaProps {
  level: LevelConfig;
  onBackToMap: () => void;
  onNextLevel: (nextLevelId: number) => void;
}

const KEY_CHAR_MAP: Record<string, string[]> = {
  // Row 1
  "~": ["~", "`"],
  "`": ["`", "~"],
  "١": ["1", "١"],
  "!": ["!", "1"],
  "٢": ["2", "٢"],
  "@": ["@", "2"],
  "٣": ["3", "٣"],
  "#": ["#", "3"],
  "٤": ["4", "٤"],
  "$": ["$", "4"],
  "٥": ["5", "٥"],
  "٪": ["٪", "%", "5"],
  "٦": ["6", "٦"],
  "^": ["^", "6"],
  "٧": ["7", "٧"],
  "&": ["&", "7"],
  "٨": ["8", "٨"],
  "*": ["*", "8"],
  "٩": ["9", "٩"],
  ")": [")", "9"],
  "٠": ["0", "٠"],
  "(": ["(", "0"],
  "-": ["-"],
  "_": ["_", "-"],
  "=": ["="],
  "+": ["+", "="],

  // Row 2
  "ق": ["q", "ق"],
  "و": ["w", "و"],
  "وو": ["W", "وو"],
  "ە": ["e", "ە"],
  "ي": ["E", "ي"],
  "ر": ["r", "ر"],
  "ڕ": ["R", "ڕ"],
  "ت": ["t", "ت"],
  "ط": ["T", "ط"],
  "ی": ["y", "ی", "ي"],
  "ێ": ["Y", "ێ"],
  "ئ": ["u", "ئ"],
  "ء": ["U", "ء"],
  "ح": ["i", "ح"],
  "ع": ["I", "ع"],
  "ۆ": ["o", "ۆ"],
  "ؤ": ["O", "ؤ"],
  "پ": ["p", "پ"],
  "ث": ["P", "ث"],
  "[": ["[", "{" ],
  "{": ["{", "[" ],
  "]": ["]", "}" ],
  "}": ["}", "]" ],
  "\\": ["\\", "|"],
  "|": ["|", "\\"],

  // Row 3
  "ا": ["a", "ا"],
  "آ": ["A", "آ"],
  "س": ["s", "س"],
  "ش": ["S", "ش"],
  "د": ["d", "د"],
  "ذ": ["D", "ذ"],
  "ف": ["f", "ف"],
  "إ": ["F", "إ"],
  "گ": ["g", "گ"],
  "غ": ["G", "غ"],
  "ه": ["h", "ه", "ھ"],
  "ھ": ["H", "ھ", "\u200c"],
  "هـ": ["h", "H", "ه", "ھ", "هـ"],
  "ژ": ["j", "ژ"],
  "أ": ["J", "أ"],
  "ک": ["k", "ک", "ك"],
  "ك": ["K", "ك"],
  "ل": ["l", "ل"],
  "ڵ": ["L", "ڵ"],
  "؛": [";", "؛"],
  ":": [":", ";"],
  "'": ["'", '"'],
  '"': ['"', "'"],

  // Row 4
  "ز": ["z", "ز"],
  "ض": ["Z", "ض"],
  "خ": ["x", "خ"],
  "ص": ["X", "ص"],
  "ج": ["c", "ج"],
  "چ": ["C", "چ"],
  "ڤ": ["v", "ڤ"],
  "ظ": ["V", "ظ"],
  "ب": ["b", "ب"],
  "ى": ["B", "ى"],
  "ن": ["n", "ن"],
  "ة": ["N", "ة"],
  "م": ["m", "م"],
  "ـ": ["M", "ـ"],
  "،": [",", "،"],
  ">": [">", ",", "،"],
  ".": ["."],
  "<": ["<", "."],
  "/": ["/"],
  "؟": ["?", "/", "؟"],

  // Row 5
  " ": [" ", "Space"],
};

export default function TypingArena({
  level,
  onBackToMap,
  onNextLevel,
}: TypingArenaProps) {
  const { recordLevelCompletion, saveLevelCompletionToFirestore } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [showRedFlash, setShowRedFlash] = useState(false);
  const [completedResult, setCompletedResult] = useState<{
    stars: number;
    xpEarned: number;
  } | null>(null);

  // Educational Milestone Modal state
  const [showMilestone, setShowMilestone] = useState<boolean>(Boolean(level.milestone));

  const arenaRef = useRef<HTMLDivElement>(null);

  const textChars = Array.from(level.targetText || level.exerciseText);
  const currentChar = textChars[currentIndex] || "";
  const progressPercent = Math.round((currentIndex / textChars.length) * 100);

  // Group text characters into words and spaces to preserve Arabic/Kurdish cursive joining
  const wordTokens = useMemo(() => {
    const tokens: Array<
      | { type: "word"; chars: Array<{ char: string; index: number; displayChar: string }> }
      | { type: "space"; index: number }
    > = [];

    let currentWord: Array<{ char: string; index: number; displayChar: string }> = [];

    for (let i = 0; i < textChars.length; i++) {
      const ch = textChars[i];
      if (ch === " ") {
        if (currentWord.length > 0) {
          tokens.push({ type: "word", chars: currentWord });
          currentWord = [];
        }
        tokens.push({ type: "space", index: i });
      } else {
        currentWord.push({
          char: ch,
          index: i,
          displayChar: ch,
        });
      }
    }
    if (currentWord.length > 0) {
      tokens.push({ type: "word", chars: currentWord });
    }

    // For single-letter words that are "ه", render with the initial form "هـ" (with curved top tail & void)
    for (const token of tokens) {
      if (token.type === "word" && token.chars.length === 1 && token.chars[0].char === "ه") {
        token.chars[0].displayChar = "هـ";
      }
    }

    return tokens;
  }, [textChars]);

  const currentIndexRef = useRef(0);
  const totalKeystrokesRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Auto-focus typing listener
  const autoFocusTyping = useCallback(() => {
    if (typeof window !== "undefined") {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      window.focus();
      if (arenaRef.current) {
        arenaRef.current.focus();
      }
    }
  }, []);

  // Reset exercise states
  const resetExercise = useCallback(() => {
    currentIndexRef.current = 0;
    totalKeystrokesRef.current = 0;
    startTimeRef.current = null;
    setCurrentIndex(0);
    setErrorIndex(null);
    setErrorCount(0);
    setTotalKeystrokes(0);
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsCompleted(false);
    setCompletedResult(null);

    if (!level.milestone) {
      autoFocusTyping();
    }
  }, [autoFocusTyping, level.milestone]);

  // Resume logic when user dismisses MilestonePopup
  const handleDismissMilestone = useCallback(() => {
    setShowMilestone(false);
    const now = Date.now();
    startTimeRef.current = now;
    setStartTime(now);
    setTimeout(() => {
      autoFocusTyping();
    }, 50);
  }, [autoFocusTyping]);

  // Synchronize and intercept milestone when level changes
  useEffect(() => {
    const hasMilestone = Boolean(level.milestone);
    setShowMilestone(hasMilestone);
    resetExercise();
    if (!hasMilestone) {
      autoFocusTyping();
    }
  }, [level.id, level.milestone, resetExercise, autoFocusTyping]);

  // Handle Next button from Victory Popup: writes newly earned stats to Firestore before advancing
  const handleNextLevel = useCallback(async () => {
    if (completedResult) {
      await saveLevelCompletionToFirestore(
        level.id,
        completedResult.stars,
        completedResult.xpEarned || level.xpReward,
        wpm,
        accuracy
      );
    }

    // 1. Immediately set the victory modal visibility state to 'false' so it disappears from the screen
    setIsCompleted(false);
    setCompletedResult(null);

    // 2. Reset the typing states: set current character index to 0, clear any typed text, and reset the WPM/Accuracy counters
    resetExercise();

    // 3. Increment the 'currentLevel' state to the next level
    onNextLevel(level.id + 1);

    // 4. Auto-focus the typing listener so the user can immediately start typing the new word
    autoFocusTyping();
  }, [
    accuracy,
    autoFocusTyping,
    completedResult,
    level.id,
    level.xpReward,
    onNextLevel,
    resetExercise,
    saveLevelCompletionToFirestore,
    wpm,
  ]);

  // Update live WPM & Accuracy timer
  useEffect(() => {
    if (!startTime || isCompleted) return;
    const interval = setInterval(() => {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      if (elapsedMinutes > 0) {
        const wordsTyped = currentIndexRef.current / 5;
        const currentWpm = Math.round(wordsTyped / elapsedMinutes);
        setWpm(Math.max(0, currentWpm));
      }
    }, 500);
    return () => clearInterval(interval);
  }, [startTime, isCompleted]);

  // Handle typing input
  const handleKeyInput = useCallback(
    (inputChar: string) => {
      if (isCompleted || showMilestone) return;

      const currentIdx = currentIndexRef.current;
      const target = textChars[currentIdx];
      if (!target) return;

      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        setStartTime(Date.now());
      }

      totalKeystrokesRef.current += 1;
      setTotalKeystrokes(totalKeystrokesRef.current);

      // Match character (supporting direct Kurdish Unicode, space, and Latin QWERTY physical key map)
      const isMatch =
        inputChar === target ||
        (inputChar === " " && target === " ") ||
        Boolean(KEY_CHAR_MAP[target] && KEY_CHAR_MAP[target].includes(inputChar));

      if (isMatch) {
        // Correct Keystroke
        audioManager.playMechanicalKey();
        setErrorIndex(null);
        const nextIdx = currentIdx + 1;
        currentIndexRef.current = nextIdx;
        setCurrentIndex(nextIdx);

        // Update live accuracy
        const total = totalKeystrokesRef.current;
        const correct = nextIdx;
        setAccuracy(Math.min(100, Math.round((correct / total) * 100)));

        // Check if finished
        if (nextIdx >= textChars.length) {
          const finalElapsed = (Date.now() - (startTimeRef.current || Date.now())) / 60000;
          const finalWpm = Math.max(
            level.minWpm,
            Math.round(textChars.length / 5 / Math.max(0.05, finalElapsed))
          );
          const finalAcc = Math.min(100, Math.round((textChars.length / total) * 100));

          const res = recordLevelCompletion(level.id, finalWpm, finalAcc, level.xpReward);
          setCompletedResult(res);
          setIsCompleted(true);
        }
      } else {
        // Incorrect Keystroke: subtle screen shake, red vignette flash, error audio
        audioManager.playWrongKey();
        setErrorIndex(currentIdx);
        setErrorCount((prev) => prev + 1);
        setShakeTrigger((prev) => prev + 1);
        setShowRedFlash(true);
        setTimeout(() => setShowRedFlash(false), 200);

        const total = totalKeystrokesRef.current;
        setAccuracy(Math.max(0, Math.round((currentIdx / total) * 100)));
      }
    },
    [isCompleted, level, recordLevelCompletion, showMilestone, textChars]
  );

  // Global keydown listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent browser from scrolling down when spacebar is pressed during typing
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
      }

      if (showMilestone) return;

      // Ignore functional meta keys
      if (
        e.key === "Tab" ||
        e.key === "Alt" ||
        e.key === "Control" ||
        e.key === "Meta" ||
        e.key === "Shift"
      ) {
        return;
      }
      if (e.key === "Escape") {
        onBackToMap();
        return;
      }
      handleKeyInput(e.key);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKeyInput, onBackToMap, showMilestone]);

  return (
    <div
      ref={arenaRef}
      tabIndex={0}
      onClick={() => {
        if (arenaRef.current) arenaRef.current.focus();
        window.focus();
      }}
      className="relative w-full flex flex-col items-center outline-none focus:outline-none"
      id="typing-arena-wrapper"
    >
      {/* Red Screen Vignette Flash on Error */}
      {showRedFlash && (
        <div className="fixed inset-0 bg-rose-500/15 pointer-events-none z-40 transition-opacity duration-150 animate-pulse" />
      )}

      {/* Main Arena Wrapper with Framer Motion Screen Shake on Wrong Key */}
      <motion.div
        animate={
          shakeTrigger > 0
            ? { x: [-8, 8, -6, 6, -3, 3, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.25 }}
        className="w-full max-w-5xl bg-white/75 backdrop-blur-2xl rounded-[36px] border-2 border-white/95 shadow-[0_20px_50px_rgba(16,185,129,0.12)] p-5 md:p-8 flex flex-col items-center"
      >
        {/* Top Arena Navigation Bar */}
        <div className="w-full flex items-center justify-between mb-4 border-b border-slate-200/80 pb-3" dir="rtl">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMap}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>گەڕانەوە بۆ نەخشەی ئاستەکان</span>
            </button>
            <div className="flex flex-col text-right">
              <span className="text-sm font-black text-slate-800">
                {level.title} • {level.subtitle}
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                {level.description}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetExercise}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="دووبارەکردنەوە"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live HUD Stats Bar */}
        <div className="w-full grid grid-cols-3 gap-3 mb-4" dir="rtl">
          {/* Progress Pill */}
          <div className="bg-slate-100/90 rounded-2xl p-2.5 px-4 border border-slate-200/80 flex flex-col">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>پێشکەوتن:</span>
              <span className="font-black text-slate-800">%{progressPercent}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.15 }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>

          {/* WPM Pill */}
          <div className="bg-slate-100/90 rounded-2xl p-2.5 px-4 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-500">خێرایی:</span>
            </div>
            <span className="text-base font-black text-emerald-600">
              {wpm} <span className="text-[10px] text-slate-400">وشە لە خولەکێکدا</span>
            </span>
          </div>

          {/* Accuracy Pill */}
          <div className="bg-slate-100/90 rounded-2xl p-2.5 px-4 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-500">وردی:</span>
            </div>
            <span className="text-base font-black text-sky-600">%{accuracy}</span>
          </div>
        </div>

        {/* Target Text Practice Container */}
        <div
          id="target-text-container"
          className="w-full bg-slate-50/90 rounded-3xl p-6 md:p-8 border-2 border-slate-200/80 shadow-inner mb-6 text-center select-none min-h-[150px] flex flex-col justify-center"
          dir="rtl"
        >
          {showMilestone ? (
            <div
              id="target-text-hidden-placeholder"
              className="py-5 px-3 flex flex-col items-center justify-center text-center select-none animate-pulse"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-900 font-black text-xs sm:text-sm mb-2 shadow-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>دەقی ڕاهێنانەکە شاردراوەتەوە تا پەیامی فێربوون دەخوێنیتەوە</span>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-400">
                سەرەتا پەیامی ڕێنمایی بخوێنەرەوە و دوگمەی &quot;تێگەیشتم، با بنووسین!&quot; دابگرە بۆ دەستپێکردن
              </span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 leading-relaxed text-2xl md:text-3xl lg:text-4xl font-black font-sans">
                {wordTokens.map((token, tIdx) => {
                  if (token.type === "space") {
                    const isTyped = token.index < currentIndex;
                    const isCurrent = token.index === currentIndex;
                    const isError = token.index === errorIndex;

                    let spaceClass = "text-slate-300";
                    if (isTyped) {
                      spaceClass = "text-emerald-500/40";
                    } else if (isCurrent) {
                      spaceClass = "text-emerald-600 bg-emerald-100 px-1.5 rounded-md";
                    }
                    if (isError) {
                      spaceClass = "text-rose-600 bg-rose-200 px-1.5 rounded-md";
                    }

                    return (
                      <span
                        key={`space-${token.index}`}
                        className={`inline-block select-none text-xl md:text-2xl transition-all ${spaceClass}`}
                      >
                        ␣
                      </span>
                    );
                  }

                  // Word token: contains letters that connect in cursive
                  const hasCurrent = token.chars.some((c) => c.index === currentIndex);
                  const wordBoxClass = hasCurrent
                    ? "bg-emerald-50/80 px-1.5 py-0.5 rounded-xl border border-emerald-200/50 shadow-xs"
                    : "px-0.5";

                  return (
                    <div
                      key={`word-${tIdx}`}
                      className={`inline-block transition-all ${wordBoxClass}`}
                    >
                      {token.chars.map(({ char, index, displayChar }) => {
                        const isTyped = index < currentIndex;
                        const isCurrent = index === currentIndex;
                        const isError = index === errorIndex;

                        let charClass = "text-slate-400";
                        if (isTyped) {
                          charClass = "text-emerald-600";
                        } else if (isCurrent) {
                          charClass =
                            "text-slate-950 underline decoration-emerald-500 decoration-4 underline-offset-8";
                        }

                        if (isError) {
                          charClass =
                            "text-rose-600 underline decoration-rose-500 decoration-4 underline-offset-8";
                        }

                        return (
                          <span
                            key={`char-${index}`}
                            id={`text-char-${index}`}
                            data-char={char}
                            className={`inline transition-colors duration-100 ${charClass}`}
                          >
                            {displayChar}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Typing Prompt Tooltip */}
              <div className="mt-5 text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  پیتە داواکراوەکە دابگرە:{" "}
                  <b
                    id="target-char-display"
                    className="text-emerald-700 text-base font-black px-3 py-0.5 bg-white rounded-md border border-emerald-200 shadow-xs"
                  >
                    {currentChar === " "
                      ? "بۆشایی"
                      : currentChar === "ه" || currentChar === "ھ"
                      ? "هـ"
                      : currentChar}
                  </b>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Virtual Keyboard Synchronized to Target Key */}
        <div className="w-full">
          <Keyboard targetKey={showMilestone ? "" : currentChar} onKeyPress={handleKeyInput} />
        </div>
      </motion.div>

      {/* Educational Milestone Popup (Full-screen overlay matching LevelCompleteModal) */}
      <AnimatePresence>
        {showMilestone && level.milestone && (
          <MilestonePopup
            milestone={level.milestone}
            onDismiss={handleDismissMilestone}
          />
        )}
      </AnimatePresence>

      {/* Completion Modal */}
      {isCompleted && completedResult && (
        <LevelCompleteModal
          level={level}
          wpm={wpm}
          accuracy={accuracy}
          stars={completedResult.stars}
          xpEarned={completedResult.xpEarned}
          onRetry={resetExercise}
          onBackToMap={onBackToMap}
          onNextLevel={handleNextLevel}
        />
      )}
    </div>
  );
}
