"use client";

import React, { useState, useEffect, useCallback } from "react";
import { audioManager } from "@/lib/audioManager";

interface KeyConfig {
  label: string;
  shiftLabel?: string;
  keyId: string;
  width?: string;
  flex?: number;
  isSpecial?: boolean;
  isAction?: boolean;
  isEnter?: boolean;
  altChars?: string[];
}

interface KeyboardProps {
  targetKey?: string;
  onKeyPress?: (char: string) => void;
  showHud?: boolean;
}

// Characters that require Shift in the official Windows Central Kurdish (KBDKURD.DLL) standard
export const SHIFTED_TARGET_CHARS = new Set([
  "!", "@", "#", "$", "٪", "^", "&", "*", ")", "(", "_", "+",
  "~", "`", "وو", "ي", "ڕ", "ط", "ێ", "ء", "ع", "ؤ", "ث", "}", "{", "|",
  "آ", "ش", "ذ", "إ", "غ", "ھ", "\u200c", "أ", "ڵ", ":", '"',
  "ض", "ص", "چ", "ظ", "ى", "ة", "ـ", ">", "<", "؟"
]);

export default function Keyboard({ targetKey, onKeyPress, showHud = true }: KeyboardProps = {}) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);

  // Row 1 keys (14 keys) - 100% standard Windows Sorani Kurdish Shift mapping
  const row1: KeyConfig[] = [
    { label: "`", shiftLabel: "~", keyId: "~", altChars: ["`", "~"] },
    { label: "١", shiftLabel: "!", keyId: "1", altChars: ["1", "١", "!"] },
    { label: "٢", shiftLabel: "@", keyId: "2", altChars: ["2", "٢", "@"] },
    { label: "٣", shiftLabel: "#", keyId: "3", altChars: ["3", "٣", "#"] },
    { label: "٤", shiftLabel: "$", keyId: "4", altChars: ["4", "٤", "$"] },
    { label: "٥", shiftLabel: "٪", keyId: "5", altChars: ["5", "٥", "٪", "%"] },
    { label: "٦", shiftLabel: "^", keyId: "6", altChars: ["6", "٦", "^"] },
    { label: "٧", shiftLabel: "&", keyId: "7", altChars: ["7", "٧", "&"] },
    { label: "٨", shiftLabel: "*", keyId: "8", altChars: ["8", "٨", "*"] },
    { label: "٩", shiftLabel: ")", keyId: "9", altChars: ["9", "٩", ")"] },
    { label: "٠", shiftLabel: "(", keyId: "0", altChars: ["0", "٠", "("] },
    { label: "-", shiftLabel: "_", keyId: "-", altChars: ["-", "_"] },
    { label: "=", shiftLabel: "+", keyId: "=", altChars: ["=", "+"] },
    { label: "سڕینەوە ⌫", keyId: "Backspace", flex: 2, isAction: true },
  ];

  // Row 2 keys (14 keys)
  const row2: KeyConfig[] = [
    { label: "TAB", keyId: "Tab", flex: 1.5, isAction: true },
    { label: "ق", shiftLabel: "`", keyId: "ق", altChars: ["q", "Q", "ق", "`"] },
    { label: "و", shiftLabel: "وو", keyId: "و", altChars: ["w", "W", "و", "وو"] },
    { label: "ە", shiftLabel: "ي", keyId: "ە", altChars: ["e", "E", "ە", "ي"] },
    { label: "ر", shiftLabel: "ڕ", keyId: "ر", isSpecial: true, altChars: ["r", "R", "ر", "ڕ"] },
    { label: "ت", shiftLabel: "ط", keyId: "ت", altChars: ["t", "T", "ت", "ط"] },
    { label: "ی", shiftLabel: "ێ", keyId: "ی", isSpecial: true, altChars: ["y", "Y", "ی", "ي", "ێ"] },
    { label: "ئ", shiftLabel: "ء", keyId: "ئ", altChars: ["u", "U", "ئ", "ء"] },
    { label: "ح", shiftLabel: "ع", keyId: "ح", altChars: ["i", "I", "ح", "ع"] },
    { label: "ۆ", shiftLabel: "ؤ", keyId: "ۆ", isSpecial: true, altChars: ["o", "O", "ۆ", "ؤ"] },
    { label: "پ", shiftLabel: "ث", keyId: "پ", isSpecial: true, altChars: ["p", "P", "پ", "ث"] },
    { label: "[", shiftLabel: "{", keyId: "[", altChars: ["[", "{"] },
    { label: "]", shiftLabel: "}", keyId: "]", altChars: ["]", "}"] },
    { label: "\\", shiftLabel: "|", keyId: "\\", flex: 1.5, altChars: ["\\", "|"] },
  ];

  // Row 3 keys (13 keys)
  const row3: KeyConfig[] = [
    { label: "CAPS", keyId: "CapsLock", flex: 1.75, isAction: true },
    { label: "ا", shiftLabel: "آ", keyId: "ا", altChars: ["a", "A", "ا", "آ"] },
    { label: "س", shiftLabel: "ش", keyId: "س", altChars: ["s", "S", "س", "ش"] },
    { label: "د", shiftLabel: "ذ", keyId: "د", altChars: ["d", "D", "د", "ذ"] },
    { label: "ف", shiftLabel: "إ", keyId: "ف", altChars: ["f", "F", "ف", "إ"] },
    { label: "گ", shiftLabel: "غ", keyId: "گ", isSpecial: true, altChars: ["g", "G", "گ", "غ"] },
    { label: "هـ", shiftLabel: "ھ", keyId: "ه", altChars: ["h", "H", "ه", "ھ", "هـ", "\u200c"] },
    { label: "ژ", shiftLabel: "أ", keyId: "ژ", isSpecial: true, altChars: ["j", "J", "ژ", "أ"] },
    { label: "ك", keyId: "ك", altChars: ["k", "K", "ك", "ک"] },
    { label: "ل", shiftLabel: "ڵ", keyId: "ل", isSpecial: true, altChars: ["l", "L", "ل", "ڵ"] },
    { label: "؛", shiftLabel: ":", keyId: ";", altChars: [";", ":", "؛"] },
    { label: "'", shiftLabel: '"', keyId: "'", altChars: ["'", '"'] },
    { label: "تەواو ⏎", keyId: "Enter", flex: 2.25, isEnter: true },
  ];

  // Row 4 keys (12 keys)
  const row4: KeyConfig[] = [
    { label: "SHIFT", keyId: "ShiftLeft", flex: 2.25, isAction: true },
    { label: "ز", shiftLabel: "ض", keyId: "ز", altChars: ["z", "Z", "ز", "ض"] },
    { label: "خ", shiftLabel: "ص", keyId: "خ", altChars: ["x", "X", "خ", "ص"] },
    { label: "ج", shiftLabel: "چ", keyId: "ج", isSpecial: true, altChars: ["c", "C", "ج", "چ"] },
    { label: "ڤ", shiftLabel: "ظ", keyId: "ڤ", isSpecial: true, altChars: ["v", "V", "ڤ", "ظ"] },
    { label: "ب", shiftLabel: "ى", keyId: "ب", altChars: ["b", "B", "ب", "ى"] },
    { label: "ن", shiftLabel: "ة", keyId: "ن", altChars: ["n", "N", "ن", "ة"] },
    { label: "م", shiftLabel: "ـ", keyId: "م", altChars: ["m", "M", "م", "ـ"] },
    { label: "،", shiftLabel: ">", keyId: "،", altChars: [",", "<", "،", ">"] },
    { label: ".", shiftLabel: "<", keyId: ".", altChars: [".", ">", "<"] },
    { label: "/", shiftLabel: "؟", keyId: "/", altChars: ["/", "?", "؟"] },
    { label: "SHIFT", keyId: "ShiftRight", flex: 2.75, isAction: true },
  ];

  // Row 5 keys (8 keys)
  const row5: KeyConfig[] = [
    { label: "CTRL", keyId: "ControlLeft", flex: 1.25, isAction: true },
    { label: "ALT", keyId: "AltLeft", flex: 1.25, isAction: true },
    { label: "بـۆشـایـی", shiftLabel: "بـۆشـایـی", keyId: " ", flex: 6.25, altChars: ["Space", " "] },
    { label: "ALT", keyId: "AltRight", flex: 1.25, isAction: true },
    { label: "CTRL", keyId: "ControlRight", flex: 1.25, isAction: true },
    { label: "◀", keyId: "ArrowLeft", flex: 1.25, isAction: true },
    { label: "▲▼", keyId: "ArrowUpDown", flex: 1.25, isAction: true },
    { label: "▶", keyId: "ArrowRight", flex: 1.25, isAction: true },
  ];

  const handleKeyTrigger = useCallback(
    (key: KeyConfig) => {
      audioManager.playMechanicalKey();

      // Virtual Shift toggle
      if (key.keyId === "ShiftLeft" || key.keyId === "ShiftRight") {
        setIsShiftPressed((prev) => !prev);
        return;
      }

      // Determine character to emit based on Shift state
      let charToSend = isShiftPressed && key.shiftLabel ? key.shiftLabel : key.label;
      if (key.keyId === " " || key.label.includes("بۆشایی") || key.label.includes("SPACE")) {
        charToSend = " ";
      } else if (key.keyId === "ه" && !isShiftPressed) {
        charToSend = "ه";
      }

      onKeyPress?.(charToSend);
    },
    [isShiftPressed, onKeyPress]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Prevent browser from scrolling down when spacebar is pressed during typing
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
      }

      if (e.key === "Shift" || e.shiftKey) {
        setIsShiftPressed(true);
      }

      const pressed = e.key;
      const allRows = [...row1, ...row2, ...row3, ...row4, ...row5];

      const matched = allRows.find(
        (k) =>
          k.keyId.toLowerCase() === pressed.toLowerCase() ||
          k.label === pressed ||
          (k.shiftLabel && k.shiftLabel === pressed) ||
          (k.altChars && k.altChars.includes(pressed)) ||
          (pressed === " " && k.keyId === " ")
      );

      if (matched) {
        setPressedKeys((prev) => new Set(prev).add(matched.keyId));
        handleKeyTrigger(matched);
      }
    },
    [handleKeyTrigger, row1, row2, row3, row4, row5]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === "Shift" || !e.shiftKey) {
      setIsShiftPressed(false);
    }

    const pressed = e.key;
    const allRows = [...row1, ...row2, ...row3, ...row4, ...row5];
    const matched = allRows.find(
      (k) =>
        k.keyId.toLowerCase() === pressed.toLowerCase() ||
        k.label === pressed ||
        (k.shiftLabel && k.shiftLabel === pressed) ||
        (k.altChars && k.altChars.includes(pressed)) ||
        (pressed === " " && k.keyId === " ")
    );

    if (matched) {
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(matched.keyId);
        return next;
      });
    }
  }, [row1, row2, row3, row4, row5]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const renderKey = (key: KeyConfig, index: number) => {
    const isShiftKey = key.keyId === "ShiftLeft" || key.keyId === "ShiftRight";
    const targetRequiresShift = targetKey ? SHIFTED_TARGET_CHARS.has(targetKey) : false;

    // Green active glow during active keydown or when momentarily targeted
    const isTarget =
      targetKey &&
      (key.label === targetKey ||
        key.shiftLabel === targetKey ||
        key.keyId === targetKey ||
        (key.altChars && key.altChars.includes(targetKey)) ||
        ((targetKey === "ه" || targetKey === "ھ" || targetKey === "هـ") &&
          (key.keyId === "ه" || key.label === "هـ")));

    const isPressed = pressedKeys.has(key.keyId) || (isShiftKey && isShiftPressed);

    let baseClasses =
      "h-10 md:h-12 rounded-xl flex items-center justify-center cursor-pointer select-none font-black transition-all min-w-0 ";
    let colorClasses = "text-slate-800 bg-white ";

    if (isTarget) {
      baseClasses += "keycap-3d keycap-active ";
      colorClasses = "text-white ";
    } else if (isShiftKey && (isShiftPressed || targetRequiresShift)) {
      baseClasses += "keycap-3d ";
      if (isShiftPressed) {
        baseClasses += "keycap-active ";
        colorClasses = "text-white ";
      } else {
        colorClasses = "text-emerald-700 bg-emerald-100 ring-2 ring-emerald-400/80 animate-pulse text-[10px] md:text-xs ";
      }
    } else if (key.isEnter) {
      baseClasses += "keycap-3d ";
      colorClasses = "text-slate-400 text-xs md:text-sm font-black ";
    } else if (key.isAction) {
      baseClasses += "keycap-3d ";
      colorClasses = "text-[10px] md:text-xs text-slate-500 bg-slate-200 ";
    } else {
      baseClasses += "keycap-3d ";
      if (key.isSpecial || (isShiftPressed && key.shiftLabel)) {
        colorClasses = "text-emerald-800 text-sm md:text-base ";
      } else {
        colorClasses = "text-slate-800 text-sm md:text-base ";
      }
    }

    if (isPressed) {
      baseClasses += "key-pressed ";
    }

    const flexRatio = key.flex ?? 1;
    const currentLabel = isShiftPressed && key.shiftLabel ? key.shiftLabel : key.label;

    return (
      <div
        key={`${key.keyId}-${index}`}
        id={`key-${key.keyId}`}
        data-key={key.keyId}
        data-shift-key={key.shiftLabel || ""}
        onMouseDown={() => {
          setPressedKeys((prev) => new Set(prev).add(key.keyId));
          handleKeyTrigger(key);
        }}
        onMouseUp={() => {
          setPressedKeys((prev) => {
            const next = new Set(prev);
            next.delete(key.keyId);
            return next;
          });
        }}
        onMouseLeave={() => {
          setPressedKeys((prev) => {
            const next = new Set(prev);
            next.delete(key.keyId);
            return next;
          });
        }}
        style={{ flex: `${flexRatio} ${flexRatio} 0%` }}
        className={`${baseClasses} ${colorClasses}`}
      >
        <span>{currentLabel}</span>
      </div>
    );
  };

  return (
    <div className="w-full bg-slate-100/95 p-3 md:p-5 rounded-3xl border-2 border-slate-200/90 shadow-inner">
      {/* Live HUD Info Bar inside Keyboard Frame (RTL container for Kurdish labels) */}
      {showHud && (
        <div className="flex items-center justify-between mb-4 px-2 text-xs font-black text-slate-600" dir="rtl">
          {/* Right side in RTL: Targeted Key if active, otherwise general status */}
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {targetKey ? (
              <>
                <span>پیتی داواکراو:</span>
                <span
                  id="target-char"
                  className="text-base font-black px-3 py-0.5 rounded-lg bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-300/60 flex items-center gap-1.5"
                >
                  {targetKey === " "
                    ? "␣"
                    : targetKey === "ه"
                    ? "هـ"
                    : targetKey}
                </span>
                {SHIFTED_TARGET_CHARS.has(targetKey) && (
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Shift + پیتەکە
                  </span>
                )}
              </>
            ) : (
              <span>تەختەکلیلی چالاک: مایکرۆسۆفت سۆرانی</span>
            )}
          </div>

          {/* Left side in RTL: Shift indicator & keyboard stats */}
          <div className="flex items-center gap-2">
            {isShiftPressed && (
              <span
                id="shift-indicator"
                className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider animate-pulse"
              >
                Shift چالاکە
              </span>
            )}
            <span className="bg-white px-3 py-1 rounded-xl shadow-xs border border-slate-200/80 text-emerald-600">
              خێرایی: <b>٩٥ وشە لە خولەکێکدا</b>
            </span>
            <span className="bg-white px-3 py-1 rounded-xl shadow-xs border border-slate-200/80 text-sky-600">
              وردی: <b>%١٠٠</b>
            </span>
          </div>
        </div>
      )}

      {/* Keyboard Grid */}
      <div className="flex flex-col gap-1.5 md:gap-2 select-none w-full" dir="ltr">
        {/* Row 1 */}
        <div className="w-full flex gap-1 md:gap-1.5 justify-center">
          {row1.map((k, i) => renderKey(k, i))}
        </div>

        {/* Row 2 */}
        <div className="w-full flex gap-1 md:gap-1.5 justify-center">
          {row2.map((k, i) => renderKey(k, i))}
        </div>

        {/* Row 3 */}
        <div className="w-full flex gap-1 md:gap-1.5 justify-center">
          {row3.map((k, i) => renderKey(k, i))}
        </div>

        {/* Row 4 */}
        <div className="w-full flex gap-1 md:gap-1.5 justify-center">
          {row4.map((k, i) => renderKey(k, i))}
        </div>

        {/* Row 5 */}
        <div className="w-full flex gap-1 md:gap-1.5 justify-center">
          {row5.map((k, i) => renderKey(k, i))}
        </div>
      </div>

      {/* Footer subtle tip */}
      <div className="mt-3 text-center text-[10px] font-bold text-slate-400">
        پیتی تایبەتی سۆرانی لە شوێنی ڕاستەقینەی خۆیان (پ، چ، گ، ژ، ڤ، ڵ، ڕ، ێ، ۆ) • کلیلی Shift بۆ پیتە لاوەکییەکان
      </div>
    </div>
  );
}
