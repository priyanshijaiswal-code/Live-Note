import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeApplier from "@/components/ThemeApplier";
import MotionProvider from "@/components/MotionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Live Notes - Real-Time Collaborative Workspace",
  description: "A futuristic real-time collaborative notes application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-dark">
      <body className={`${inter.className} h-screen w-screen flex text-gray-100 overflow-hidden`}>
        <ThemeApplier />
        <MotionProvider>
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
