"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/audio";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setAuthError(null);
    soundFx.playTargetSuccess();
    login(email, name || undefined);
  };

  const handleGoogleLogin = async () => {
    soundFx.playTargetSuccess();
    setIsGoogleLoading(true);
    setAuthError(null);

    try {
      const res = await loginWithGoogle();
      if (res && !res.success && res.error) {
        if (res.error.includes("popup-closed-by-user")) {
          setAuthError("پەنجەرەی Google لەلایەن بەکارهێنەر داخرا.");
        } else if (res.error.includes("configuration-not-found")) {
          setAuthError("تکایە شێوازی چوونەژوورەوەی Google چالاک بکە لە بەشی Authentication لە کۆنسۆڵی Firebase.");
        } else if (res.error.includes("auth/unauthorized-domain") || res.error.includes("auth/api-key-not-valid")) {
          setAuthError("تکایە دڵنیابە لە کلیلەکانی Firebase لە فایلی .env.local");
        } else {
          setAuthError(res.error);
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || "هەڵەیەک ڕوویدا");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        {/* Backdrop click dismiss */}
        <div className="absolute inset-0" onClick={closeAuthModal} />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[32px] border-2 border-white shadow-2xl p-6 md:p-8 z-10 text-slate-800"
          dir="rtl"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 left-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#58cc02] to-[#86efac] flex items-center justify-center shadow-lg shadow-emerald-500/25 border-2 border-white">
              <span className="text-white font-black text-3xl">پ</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {isSignUp ? "دروستکردنی هەژماری نوێ" : "چوونە ژوورەوە بۆ پیتیک"}
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1">
              خاڵەکانت بپارێزە و ستریكی ڕۆژانەت بەردەوام بکە!
            </p>
          </div>

          {/* Error Message Box */}
          {authError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold text-center">
              {authError}
            </div>
          )}

          {/* 1-Click Google Login Button */}
          <motion.button
            whileHover={{ y: isGoogleLoading ? 0 : -1 }}
            whileTap={{ y: isGoogleLoading ? 0 : 2 }}
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            id="google-login-btn"
            className="w-full py-3 px-4 rounded-2xl bg-white border-2 border-slate-200 shadow-xs hover:bg-slate-50 flex items-center justify-center gap-3 font-black text-sm text-slate-700 transition-colors mb-4 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>{isGoogleLoading ? "پەیوەستبوون بە Google..." : "بەردەوامبە لەگەڵ Google"}</span>
          </motion.button>

          <div className="relative flex items-center justify-center mb-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-black text-slate-400 uppercase">
              یان بە ئیمەیڵ
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  ناوی تەواو
                </label>
                <div className="relative">
                  <User className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ئاراس ئەحمەد"
                    className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white text-sm font-bold outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                ئیمەیڵ
              </label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@example.com"
                  className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white text-sm font-bold outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                وشەی نهێنی
              </label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white text-sm font-bold outline-none transition-colors"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ y: -2 }}
              whileTap={{ y: 2 }}
              className="btn-3d-green w-full py-3.5 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2 cursor-pointer shadow-md mt-4"
            >
              <LogIn className="w-5 h-5" />
              <span>{isSignUp ? "تۆمارکردنی هەژمار" : "چوونە ژوورەوە"}</span>
            </motion.button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                soundFx.playTargetSuccess();
                login("demo.pro@pitik.krd", "یاریزانی پاڵەوان");
              }}
              id="demo-login-btn"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>چوونە ژوورەوەی خێرا</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
            >
              {isSignUp ? "هەژمارت هەیە؟ بچۆ ژوورەوە" : "هەژمارت نییە؟ دروستی بکە"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
