import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "NexTrade Pro - Crypto Trading Platform",
  description: "Professional crypto trading platform with RBAC authentication",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0a0e17] text-white">{children}</body>
    </html>
  );
}