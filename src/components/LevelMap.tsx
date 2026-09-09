"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, Star, Play, CheckCircle, ChevronLeft } from "lucide-react";
import { CURRICULUM_UNITS, LevelConfig } from "@/lib/curriculum";
import { useAuth } from "@/context/AuthContext";
import { audioManager } from "@/lib/audioManager";

interface LevelMapProps {
  onSelectLevel: (level: LevelConfig) => void;
  onBackToLobby?: () => void;
}

export default function LevelMap({ onSelectLevel }: LevelMapProps) {
  const { stats } = useAuth();
  const { currentUnlockedLevel, completedLevels } = stats;

  const handleNodeClick = (level: LevelConfig) => {
    const isUnlocked = level.id <= currentUnlockedLevel;
    if (!isUnlocked) {
      audioManager.playMechanicalKey();
      return;
    }
    audioManager.playMechanicalKey();
    onSelectLevel(level);
  };

  // Horizontal offset positions for sinusoidal winding path
  const getOffset = (index: number) => {
    const offsets = [0, 45, 75, 45, 0, -45, -75, -45];
    return offsets[index % offsets.length];
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center py-4 px-4 select-none">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-8 bg-white/70 backdrop-blur-xl rounded-2xl border-2 border-white/90 p-4 shadow-sm" dir="rtl">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            نەخشەی ئاستەکانی فێربوون
          </h2>
          <p className="text-xs font-bold text-slate-500">
            فێربوونی هەنگاو بە هەنگاوی تەختەکلیلی کوردی سۆرانی بە شێوازی مۆدێرن
          </p>
        </div>

        <div className="bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs">
          <span>ئاستی چالاک: {currentUnlockedLevel}</span>
        </div>
      </div>

      {/* Curriculum Units & Map Nodes */}
      <div className="w-full flex flex-col items-center space-y-12">
        {CURRICULUM_UNITS.map((unit) => (
          <div key={unit.id} className="w-full flex flex-col items-center">
            {/* Unit Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full max-w-lg bg-white/85 backdrop-blur-xl rounded-3xl border-2 border-white/95 shadow-md p-5 text-center mb-8 relative overflow-hidden"
              dir="rtl"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: unit.color }}
              />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                بەشی {unit.id} • {unit.kurdishTitle}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                {unit.kurdishTitle}
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                {unit.description}
              </p>
            </motion.div>

            {/* Vertical Nodes Chain */}
            <div className="relative flex flex-col items-center space-y-8 py-2">
              {unit.levels.map((level, idx) => {
                const isCompleted = !!completedLevels[level.id];
                const isActive = level.id === currentUnlockedLevel;
                const isLocked = level.id > currentUnlockedLevel;
                const result = completedLevels[level.id];
                const stars = result ? result.stars : 0;
                const horizontalOffset = getOffset(idx);

                return (
                  <div
                    key={level.id}
                    style={{
                      transform: `translateX(${horizontalOffset}px)`,
                    }}
                    className="relative flex flex-col items-center transition-transform duration-300"
                  >
                    {/* Active Floating Helper Mascot / Pointer */}
                    {isActive && (
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-10 z-20 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[11px] px-3 py-1 rounded-full shadow-lg border border-white flex items-center gap-1 whitespace-nowrap pointer-events-none"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>دەستپێبکە!</span>
                      </motion.div>
                    )}

                    {/* Circular Level Node Button */}
                    <motion.button
                      whileHover={!isLocked ? { scale: 1.08, y: -3 } : {}}
                      whileTap={!isLocked ? { scale: 0.95, y: 3 } : {}}
                      onClick={() => handleNodeClick(level)}
                      id={`level-node-${level.id}`}
                      data-completed={isCompleted ? "true" : "false"}
                      data-active={isActive ? "true" : "false"}
                      className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                        isLocked
                          ? "bg-slate-200 border-4 border-slate-300 shadow-[0_6px_0_#94a3b8] text-slate-400 cursor-not-allowed"
                          : isActive
                          ? "bg-gradient-to-b from-[#58cc02] to-[#46a302] border-4 border-white shadow-[0_8px_0_#368200,0_0_30px_rgba(88,204,2,0.6)] text-white animate-pulse"
                          : "bg-gradient-to-b from-amber-400 to-amber-500 border-4 border-white shadow-[0_6px_0_#b45309] text-white"
                      }`}
                    >
                      {isLocked ? (
                        <Lock className="w-7 h-7 stroke-[2.5]" />
                      ) : isActive ? (
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-black">{level.id}</span>
                          <span className="text-[10px] font-extrabold tracking-tight">سەرەتا</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="w-6 h-6 mb-0.5 stroke-[2.5]" />
                          <span className="text-xs font-black">{level.id}</span>
                        </div>
                      )}
                    </motion.button>

                    {/* Stars Earned underneath completed node */}
                    {isCompleted && (
                      <div id={`level-stars-${level.id}`} className="flex items-center gap-0.5 mt-2 bg-white/90 px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-xs">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= stars
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-200 text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Title tooltip on hover / active */}
                    <span
                      className={`text-xs font-black mt-1 text-center max-w-[130px] ${
                        isActive ? "text-emerald-700" : isLocked ? "text-slate-400" : "text-slate-700"
                      }`}
                    >
                      {level.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
