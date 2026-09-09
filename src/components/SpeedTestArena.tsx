"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, Zap, Target, Timer, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import { SPEED_TEXT_ITEMS, SpeedTextItem } from "@/data/speedTexts";
import { isCharMatch } from "@/lib/kurdishKeyMap";
import { audioManager } from "@/lib/audioManager";
import Keyboard from "@/components/Keyboard";
import SpeedTestModal from "@/components/SpeedTestModal";

interface SpeedTestArenaProps {
  onBackToMap: () => void;
}

const TOTAL_DURATION_SECONDS = 60;

/**
 * Randomly pick a text index different from the previous index
 */
function getDifferentRandomIndex(previousIndex?: number): number {
  const indices = SPEED_TEXT_ITEMS.map((_, i) => i).filter((i) => i !== previousIndex);
  if (indices.length === 0) return 0;
  const randomIndex = Math.floor(Math.random() * indices.length);
  return indices[randomIndex];
}

export default function SpeedTestArena({ onBackToMap }: SpeedTestArenaProps) {
  // Current text selection
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(() => getDifferentRandomIndex());
  const currentTextItem: SpeedTextItem = SPEED_TEXT_ITEMS[currentTextIndex] || SPEED_TEXT_ITEMS[0];

  // Typing state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);

  // Timer & End state
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_DURATION_SECONDS);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [showResultsModal, setShowResultsModal] = useState<boolean>(false);

  // Metrics
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);

  // Visual feedback
  const [shakeTrigger, setShakeTrigger] = useState<number>(0);
  const [showRedFlash, setShowRedFlash] = useState<boolean>(false);

  const arenaRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  const totalKeystrokesRef = useRef(0);
  const isLockedRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Synchronize refs
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    totalKeystrokesRef.current = totalKeystrokes;
  }, [totalKeystrokes]);

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  const textChars = useMemo(() => Array.from(currentTextItem.text), [currentTextItem.text]);
  const currentChar = textChars[currentIndex] || "";

  // Group characters into cursive word tokens and spaces
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

    // Preserve initial Kurdish "هـ" display when solitary
    for (const token of tokens) {
      if (token.type === "word" && token.chars.length === 1 && token.chars[0].char === "ه") {
        token.chars[0].displayChar = "هـ";
      }
    }

    return tokens;
  }, [textChars]);

  // Focus utility
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

  // Finish test handler: locks input and opens modal
  const handleFinishTest = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsLocked(true);
    isLockedRef.current = true;

    // Calculate final metrics
    const finalKeystrokes = totalKeystrokesRef.current;
    const finalCorrect = currentIndexRef.current;
    const elapsedSeconds = startTimeRef.current
      ? Math.min(TOTAL_DURATION_SECONDS, Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)))
      : TOTAL_DURATION_SECONDS;
    const elapsedMinutes = elapsedSeconds / 60;
    const finalWpm = Math.round((finalCorrect / 5) / elapsedMinutes);
    const finalAcc = finalKeystrokes > 0 ? Math.min(100, Math.round((finalCorrect / finalKeystrokes) * 100)) : 100;

    setWpm(finalWpm);
    setAccuracy(finalAcc);
    setShowResultsModal(true);
  }, []);

  // Expose verification helpers for automated browser testing
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { __finishSpeedTest?: () => void }).__finishSpeedTest = () => {
        handleFinishTest();
      };
      (window as unknown as { __setSpeedTestTimeLeft?: (sec: number) => void }).__setSpeedTestTimeLeft = (sec: number) => {
        setTimeLeft(sec);
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as unknown as { __finishSpeedTest?: () => void }).__finishSpeedTest;
        delete (window as unknown as { __setSpeedTestTimeLeft?: (sec: number) => void }).__setSpeedTestTimeLeft;
      }
    };
  }, [handleFinishTest]);

  // Timer countdown effect
  useEffect(() => {
    if (!hasStarted || isLocked) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinishTest();
          return 0;
        }

        // Live WPM update
        const elapsedSeconds = TOTAL_DURATION_SECONDS - (prev - 1);
        if (elapsedSeconds > 0) {
          const currentWords = currentIndexRef.current / 5;
          const liveWpm = Math.round(currentWords / (elapsedSeconds / 60));
          setWpm(Math.max(0, liveWpm));
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [hasStarted, isLocked, handleFinishTest]);

  // Reset / Try Again with guaranteed non-repeating new random text
  const handleReset = useCallback(
    (forceNewText = true) => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      if (forceNewText) {
        setCurrentTextIndex((prev) => getDifferentRandomIndex(prev));
      }

      currentIndexRef.current = 0;
      totalKeystrokesRef.current = 0;
      startTimeRef.current = null;
      isLockedRef.current = false;

      setCurrentIndex(0);
      setErrorIndex(null);
      setErrorCount(0);
      setTotalKeystrokes(0);
      setTimeLeft(TOTAL_DURATION_SECONDS);
      setHasStarted(false);
      setIsLocked(false);
      setShowResultsModal(false);
      setWpm(0);
      setAccuracy(100);

      autoFocusTyping();
    },
    [autoFocusTyping]
  );

  // Initial focus on mount
  useEffect(() => {
    autoFocusTyping();
  }, [autoFocusTyping]);

  // Handle typing key input
  const handleKeyInput = useCallback(
    (inputChar: string) => {
      // Strictly lock input when timer expired or results modal is visible
      if (isLockedRef.current || showResultsModal) return;

      const currentIdx = currentIndexRef.current;
      const target = textChars[currentIdx];
      if (!target) return;

      // Start timer on very first typed character
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        setHasStarted(true);
      }

      totalKeystrokesRef.current += 1;
      setTotalKeystrokes(totalKeystrokesRef.current);

      const isMatch = isCharMatch(inputChar, target);

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

        // If completed whole paragraph before 60s, finish test
        if (nextIdx >= textChars.length) {
          handleFinishTest();
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
    [handleFinishTest, showResultsModal, textChars]
  );

  // Global key listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent browser from scrolling down when spacebar is pressed during typing
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
      }

      if (showResultsModal) return;

      // Ignore meta modifier keys
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
  }, [handleKeyInput, onBackToMap, showResultsModal]);

  // Timer color indicator
  const getTimerStyles = () => {
    if (timeLeft <= 10) {
      return {
        pill: "bg-rose-50 border-rose-300 text-rose-600 animate-pulse",
        text: "text-rose-600 font-black",
        bar: "bg-rose-500",
      };
    }
    if (timeLeft <= 25) {
      return {
        pill: "bg-amber-50 border-amber-300 text-amber-700",
        text: "text-amber-700 font-black",
        bar: "bg-amber-500",
      };
    }
    return {
      pill: "bg-emerald-50 border-emerald-300 text-emerald-700",
      text: "text-emerald-600 font-black",
      bar: "bg-emerald-500",
    };
  };

  const timerStyle = getTimerStyles();
  const timerPercent = Math.round((timeLeft / TOTAL_DURATION_SECONDS) * 100);

  return (
    <div
      ref={arenaRef}
      tabIndex={0}
      onClick={() => {
        if (arenaRef.current) arenaRef.current.focus();
        window.focus();
      }}
      className="relative w-full flex flex-col items-center outline-none focus:outline-none select-none"
      id="speed-test-arena-wrapper"
    >
      {/* Red Screen Vignette Flash on Error */}
      {showRedFlash && (
        <div className="fixed inset-0 bg-rose-500/15 pointer-events-none z-40 transition-opacity duration-150 animate-pulse" />
      )}

      {/* Main Speed Test Card */}
      <motion.div
        animate={
          shakeTrigger > 0
            ? { x: [-8, 8, -6, 6, -3, 3, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.25 }}
        className="w-full max-w-5xl bg-white/80 backdrop-blur-2xl rounded-[36px] border-2 border-white/95 shadow-[0_20px_50px_rgba(16,185,129,0.14)] p-5 md:p-8 flex flex-col items-center"
      >
        {/* Top Speed Test Header */}
        <div className="w-full flex items-center justify-between mb-4 border-b border-slate-200/80 pb-3.5" dir="rtl">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMap}
              id="speed-arena-back-btn"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>گەڕانەوە بۆ نەخشەی ئاستەکان</span>
            </button>
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900">
                  تاقیکردنەوەی خێرایی (١ خولەک)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 border border-purple-200">
                  {currentTextItem.category}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {currentTextItem.title} • {currentTextItem.author}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleReset(true)}
              id="speed-arena-reset-btn"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="گۆڕینی دەق و دووبارە دەستپێکردنەوە"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>دەقی نوێ</span>
            </button>
          </div>
        </div>

        {/* Live HUD Stats Bar */}
        <div className="w-full grid grid-cols-3 gap-3 mb-4" dir="rtl">
          {/* 60s Countdown Timer Pill */}
          <div className={`rounded-2xl p-2.5 px-4 border-2 flex flex-col justify-between transition-colors ${timerStyle.pill}`}>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <div className="flex items-center gap-1.5">
                <Timer className="w-4 h-4" />
                <span>کاتی ماوە:</span>
              </div>
              <span id="speed-test-timer-display" className={`text-base font-black ${timerStyle.text}`}>
                {timeLeft} چرکە
              </span>
            </div>
            {/* Countdown Progress Bar */}
            <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${timerPercent}%` }}
                transition={{ duration: 0.3 }}
                className={`h-full rounded-full ${timerStyle.bar}`}
              />
            </div>
          </div>

          {/* WPM Pill */}
          <div className="bg-slate-100/90 rounded-2xl p-2.5 px-4 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-500">خێرایی:</span>
            </div>
            <span id="speed-test-live-wpm" className="text-base font-black text-emerald-600">
              {wpm} <span className="text-[10px] text-slate-400">وشە/خولەک</span>
            </span>
          </div>

          {/* Accuracy Pill */}
          <div className="bg-slate-100/90 rounded-2xl p-2.5 px-4 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-500">وردی:</span>
            </div>
            <span id="speed-test-live-acc" className="text-base font-black text-sky-600">
              %{accuracy}
            </span>
          </div>
        </div>

        {/* Start Notice Banner if not yet started */}
        {!hasStarted && (
          <div
            id="speed-test-start-prompt"
            className="w-full mb-3 px-4 py-2 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-center gap-2"
            dir="rtl"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>
              کاتژمێری ٦٠ چرکە بە شێوەیەکی ئۆتۆماتیکی لەگەڵ یەکەم پیتی نووسراو دەستپێدەکات!
            </span>
          </div>
        )}

        {/* Kurdish Target Practice Text Box */}
        <div
          id="speed-target-text-container"
          className="w-full bg-slate-50/90 rounded-3xl p-6 md:p-8 border-2 border-slate-200/80 shadow-inner mb-6 text-center select-none min-h-[170px] flex flex-col justify-center relative"
          dir="rtl"
        >
          {/* Target Text Words */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3.5 leading-relaxed text-2xl md:text-3xl font-black font-sans">
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

              // Word token with cursive preservation
              const hasCurrent = token.chars.some((c) => c.index === currentIndex);
              const wordBoxClass = hasCurrent
                ? "bg-emerald-50/90 px-1.5 py-0.5 rounded-xl border border-emerald-200/60 shadow-xs"
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
                        id={`speed-char-${index}`}
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

          {/* Current Target Character Prompt */}
          <div className="mt-5 text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              پیتی پێویست بۆ تایپکردن:{" "}
              <b
                id="speed-target-char-display"
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
        </div>

        {/* Virtual Keyboard (Interactive, highlight synchronized to current char) */}
        <div className="w-full">
          <Keyboard
            targetKey={isLocked ? "" : currentChar}
            onKeyPress={(char) => {
              if (!isLocked) {
                handleKeyInput(char);
              }
            }}
          />
        </div>
      </motion.div>

      {/* Results Modal upon 60s completion */}
      {showResultsModal && (
        <SpeedTestModal
          wpm={wpm}
          accuracy={accuracy}
          totalKeystrokes={totalKeystrokes}
          correctChars={currentIndex}
          errorCount={errorCount}
          textTitle={currentTextItem.title}
          textAuthor={currentTextItem.author}
          onRetry={() => handleReset(true)}
          onBackToMap={onBackToMap}
        />
      )}
    </div>
  );
}
