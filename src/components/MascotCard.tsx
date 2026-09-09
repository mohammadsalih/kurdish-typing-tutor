"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function MascotCard() {
  const { isGuest, stats } = useAuth();

  return (
    <div className="flex flex-col items-center relative select-none">
      {/* CONDITIONAL SCORING RULE: Completely hide XP & Streak badges for Guest users */}
      {!isGuest && (
        <>
          {/* Top Floating Badge: +50 خاڵ */}
          <motion.div
            id="mascot-xp-badge"
            animate={{
              y: [0, -5, 0],
              rotate: [6, 8, 5, 6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-3 -right-2 z-20 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-black text-xs px-3 py-1.5 rounded-2xl shadow-lg border-2 border-white flex items-center gap-1.5 cursor-default"
          >
            <span>⭐</span>
            <span>+{stats.xp > 0 ? "٥٠ خاڵ" : "خاڵ"}</span>
          </motion.div>

          {/* Bottom Floating Badge: Streak */}
          <motion.div
            id="mascot-streak-badge"
            animate={{
              y: [0, 4, 0],
              rotate: [-6, -4, -7, -6],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute bottom-4 -left-3 z-20 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-xs px-3 py-1.5 rounded-2xl shadow-lg border-2 border-white flex items-center gap-1 cursor-default"
          >
            <span>🔥</span>
            <span>x{stats.streak || 1} ستریك</span>
          </motion.div>
        </>
      )}

      {/* Mascot Card Frame */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          rotate: [0, 0.8, -0.6, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.03 }}
        className="w-48 h-48 md:w-56 md:h-56 rounded-3xl bg-gradient-to-b from-white to-amber-50/50 p-2 shadow-xl border-2 border-white/90 flex items-center justify-center overflow-hidden relative cursor-pointer"
      >
        <Image
          src="/mascot.jpg"
          alt="کەڵی کێوی زاگرۆس"
          width={224}
          height={224}
          priority
          className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 hover:scale-105"
        />
      </motion.div>
    </div>
  );
}
