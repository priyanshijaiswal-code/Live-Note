"use client";

import { MotionConfig } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

/**
 * MotionProvider — wraps the app with Framer Motion's MotionConfig.
 * When reducedMotion is enabled in settings, all Framer Motion animations are disabled.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useAppStore(s => s.settings.reducedMotion);
  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}
