"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/animation-utils";

interface AnimationContextType {
  isReducedMotion: boolean;
  isGlobalLoading: boolean;
  setCursorType: (type: "default" | "magnetic" | "none") => void;
  cursorType: "default" | "magnetic" | "none";
}

const AnimationContext = createContext<AnimationContextType | undefined>(
  undefined
);

export function AnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [cursorType, setCursorType] = useState<"default" | "magnetic" | "none">(
    "default"
  );

  // Detect reduced motion preference on mount
  useEffect(() => {
    setIsReducedMotion(prefersReducedMotion());

    // Listen for changes to motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <AnimationContext.Provider
      value={{
        isReducedMotion,
        isGlobalLoading,
        setCursorType,
        cursorType,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error("useAnimation must be used within AnimationProvider");
  }
  return context;
}
