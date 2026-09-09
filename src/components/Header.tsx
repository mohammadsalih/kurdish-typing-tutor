"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Map, Shield, ChevronDown, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { audioManager } from "@/lib/audioManager";

interface HeaderProps {
  currentView?: "onboarding" | "map" | "arena" | "speedTest";
  onNavigate?: (view: "map" | "speedTest") => void;
}

export default function Header({ currentView = "map", onNavigate }: HeaderProps) {
  const { user, isGuest, stats, loginWithGoogle, logout, openAuthModal } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-close menu when clicking outside of dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogin = () => {
    openAuthModal();
  };

  return (
    <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-20 px-3 md:px-4 py-3 select-none">
      {/* Brand Logo (Always navigates to Level Map) */}
      <div className="flex items-center gap-4">
        <div
          id="brand-logo-btn"
          onClick={() => onNavigate?.("map")}
          className="flex items-center gap-3 cursor-pointer"
          title="گەڕانەوە بۆ نەخشەی ئاستەکان"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#58cc02] to-[#86efac] flex items-center justify-center shadow-lg shadow-emerald-500/25 border-2 border-white"
          >
            <span className="text-white font-black text-2xl tracking-tighter">پ</span>
          </motion.div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-slate-900">پیتیک</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                فێرکاری
              </span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              تەختەکلیلی گەیمی کوردی سۆرانی
            </span>
          </div>
        </div>

        {/* Global Navigation Buttons: Map & Speed Test */}
        {onNavigate && (
          <div className="flex items-center gap-2 mr-2">
            <button
              onClick={() => {
                audioManager.playMechanicalKey();
                onNavigate("map");
              }}
              id="nav-map-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                currentView === "map" || currentView === "arena"
                  ? "bg-emerald-500 text-white shadow-emerald-500/25"
                  : "bg-white/80 hover:bg-white text-slate-700 border border-slate-200"
              }`}
              title="نەخشەی ئاستەکان"
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">نەخشەی ئاستەکان</span>
            </button>

            <button
              onClick={() => {
                audioManager.playMechanicalKey();
                onNavigate("speedTest");
              }}
              id="nav-speed-test-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                currentView === "speedTest"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-500/25"
                  : "bg-white/80 hover:bg-white text-slate-700 border border-slate-200"
              }`}
              title="تاقیکردنەوەی خێرایی تایپکردنی ١ خولەک"
            >
              <Zap className={`w-3.5 h-3.5 ${currentView === "speedTest" ? "text-white" : "text-amber-500"}`} />
              <span>تاقیکردنەوەی خێرایی</span>
            </button>
          </div>
        )}
      </div>

      {/* Center: Live Stats HUD (ONLY shown for Authenticated Users) */}
      <div className="flex items-center gap-3 md:gap-4">
        {!isGuest && (
          <>
            {/* Streak Counter */}
            <motion.div
              id="hud-streak-pill"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="stat-badge flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200/80 shadow-xs"
              title="ستریكی ڕۆژانە"
            >
              <div className="w-7 h-7 rounded-xl bg-orange-500/15 flex items-center justify-center text-lg">
                🔥
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-orange-600">
                  {stats.streak} ڕۆژ پارێزراو
                </span>
                <span className="text-[10px] font-bold text-orange-400">ستریكی چالاك</span>
              </div>
            </motion.div>

            {/* Total XP Gems */}
            <motion.div
              id="hud-xp-pill"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="stat-badge flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-sky-50 to-cyan-50 border border-cyan-200/80 shadow-xs"
              title="کۆی خاڵە بەدەستهاتووەکان"
            >
              <div className="w-7 h-7 rounded-xl bg-cyan-500/15 flex items-center justify-center text-lg">
                💎
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-cyan-600">
                  {stats.xp.toLocaleString()} خاڵ
                </span>
                <span className="text-[10px] font-bold text-cyan-400">
                  ئاستی {stats.level}
                </span>
              </div>
            </motion.div>
          </>
        )}

        {/* Guest Mode Indicator */}
        {isGuest && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>مۆدی میوان • بچۆ ژوورەوە بۆ پاراستنی خاڵ و ستریک</span>
          </div>
        )}
      </div>

      {/* Account / Login Action (Left side in RTL) */}
      <div className="relative">
        {!isGuest && user ? (
          /* When logged in: Profile Picture Button with Dropdown Menu */
          <div ref={dropdownRef} className="relative">
            {/* User Profile Pill Trigger Button */}
            <button
              type="button"
              id="user-profile-btn"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 py-1 px-2.5 rounded-2xl bg-white/95 hover:bg-white backdrop-blur-md border border-slate-200 shadow-xs cursor-pointer transition-all hover:shadow-sm"
              title={user.email}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              {user.photoURL || user.avatar ? (
                <img
                  src={user.photoURL || user.avatar}
                  alt={user.displayName || user.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                  {(user.displayName || user.name || "U").charAt(0)}
                </div>
              )}
              <span className="text-xs font-black text-slate-800 hidden sm:inline max-w-[120px] truncate">
                {user.displayName || user.name}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180 text-slate-600" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  id="profile-dropdown-menu"
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-0 min-w-[200px] p-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 z-50 flex flex-col gap-1"
                  dir="rtl"
                >
                  {/* User Info Header inside dropdown */}
                  <div className="px-3 py-2 border-b border-slate-100 flex flex-col text-right">
                    <span className="text-xs font-black text-slate-900 truncate">
                      {user.displayName || user.name}
                    </span>
                    {user.email && (
                      <span className="text-[11px] font-bold text-slate-400 truncate">
                        {user.email}
                      </span>
                    )}
                  </div>

                  {/* Log Out Button inside dropdown */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    id="logout-btn"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs flex items-center gap-2 transition-colors cursor-pointer text-right justify-start"
                    title="چوونە دەرەوە لە هەژمار"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>چوونە دەرەوە</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Guest: Direct Google Login Button */
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 2 }}
            onClick={handleLogin}
            disabled={isLoggingIn}
            id="header-login-btn"
            className="btn-3d-white px-4 md:px-5 py-2.5 rounded-2xl font-black text-sm text-slate-700 flex items-center gap-2.5 border border-slate-200 cursor-pointer shadow-xs disabled:opacity-75 disabled:cursor-wait"
            title="چوونە ژوورەوە لەگەڵ Google"
          >
            {isLoggingIn ? (
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isLoggingIn ? "چوونە ژوورەوە..." : "چوونە ژوورەوە"}</span>
          </motion.button>
        )}
      </div>
    </header>
  );
}
