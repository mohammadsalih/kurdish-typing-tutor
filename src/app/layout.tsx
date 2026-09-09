import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "پیتیک - تەختەکلیلی گەیمی کوردی سۆرانی (فێربوونی خێرای تایپکردن)",
  description: "تەختەکلیلی گەیمی کوردی سۆرانی - ڕاهێنانی دەستلێدانی ڕاستەقینە بە ستانداردی مایکرۆسۆفت",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ku" dir="rtl" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Vazirmatn:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased bg-[#f7fee7] text-slate-800 selection:bg-emerald-200">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
