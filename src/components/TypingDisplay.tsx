"use client";

import React, { useMemo } from "react";

export interface TypingDisplayProps {
  targetText: string;
  currentIndex: number;
  errorIndex?: number | null;
  className?: string;
  charSizeClass?: string;
}

/**
 * TypingDisplay (also exported as LetterBox, WordContainer)
 * Reusable text-rendering component from the learning/challenge page.
 * Groups characters into words to preserve cursive Arabic/Kurdish joining,
 * and renders individual characters with inline spans and proper highlight states.
 */
export default function TypingDisplay({
  targetText,
  currentIndex,
  errorIndex = null,
  className = "",
  charSizeClass = "text-2xl md:text-3xl lg:text-4xl",
}: TypingDisplayProps) {
  const textChars = Array.from(targetText);

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

    // For single-letter words that are "ه", render with the initial form "هـ"
    for (const token of tokens) {
      if (token.type === "word" && token.chars.length === 1 && token.chars[0].char === "ه") {
        token.chars[0].displayChar = "هـ";
      }
    }

    return tokens;
  }, [textChars]);

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-3 leading-relaxed ${charSizeClass} font-black font-[family-name:var(--font-vazirmatn)] select-none ${className}`}
      dir="rtl"
    >
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
              id={`space-char-${token.index}`}
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
  );
}

export { TypingDisplay as LetterBox, TypingDisplay as WordContainer };
