"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Milestone } from "@/data/levels";
import { audioManager } from "@/lib/audioManager";

interface MilestonePopupProps {
  milestone: Milestone;
  onDismiss: () => void;
}

export default function MilestonePopup({
  milestone,
  onDismiss,
}: MilestonePopupProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleButtonClick = () => {
    audioManager.playMechanicalKey();
    onDismiss();
  };

  const kurdishTitle = milestone.title.includes("(")
    ? milestone.title.split("(")[0].trim()
    : milestone.title;

  const content = (
    <div
      id="milestone-popup-overlay"
      style={{ zIndex: 9999 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md select-none"
    >
      <motion.div
        id="milestone-card"
        initial={{ opacity: 0, scale: 0.9, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 25 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[36px] border-2 border-white shadow-2xl p-6 md:p-8 text-slate-800 text-center"
        dir="rtl"
      >
        {/* Educational Lightbulb Icon popping out of top header */}
        <div className="w-16 h-16 mx-auto -mt-12 md:-mt-14 rounded-3xl bg-gradient-to-tr from-[#58cc02] to-emerald-500 border-4 border-white shadow-xl flex items-center justify-center text-3xl select-none">
          💡
        </div>

        {/* Milestone Title with Sleek Kurdish Badge */}
        <div id="milestone-title" className="flex flex-col items-center mt-3">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {kurdishTitle}
          </h2>
          <div className="mt-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-800 text-xs font-black shadow-xs inline-flex items-center gap-1">
            <span>پەیامی فێربوون</span>
          </div>
        </div>

        {/* Message Content Container */}
        <div
          id="milestone-message-box"
          className="w-full bg-slate-50 rounded-2xl p-4 md:p-5 border-2 border-slate-200/80 my-5 text-slate-700 space-y-3 max-h-60 overflow-y-auto"
        >
          {milestone.message.split("\n\n").map((paragraph, idx) => (
            <p
              key={idx}
              dir="rtl"
              className="whitespace-pre-line text-sm md:text-base leading-relaxed text-right font-black text-slate-800"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Action Button: "تێگەیشتم، با بنووسین!" */}
        <motion.button
          id="milestone-got-it-btn"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98, y: 3 }}
          onClick={handleButtonClick}
          className="btn-3d-green w-full py-4 px-6 rounded-2xl font-black text-white flex items-center justify-center gap-3 cursor-pointer shadow-md"
        >
          <Play className="w-5 h-5 fill-current" />
          <span className="text-base md:text-lg font-black tracking-tight">
            تێگەیشتم، با بنووسین!
          </span>
        </motion.button>
      </motion.div>
    </div>
  );

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
