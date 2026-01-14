"use client";

import * as React from "react";

/**
 * Reading Progress Bar - Awwwards 2026 style
 * Shows reading progress at the top of the page
 */
export function ReadingProgress() {
  const [progress, setProgress] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const updateProgress = () => {
      // Get the article element or fall back to body
      const article = document.querySelector("article");
      const target = article || document.body;

      const scrollTop = window.scrollY;
      const docHeight = target.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setProgress(Math.min(100, Math.max(0, scrollPercent)));

      // Show progress bar after scrolling 100px
      setIsVisible(scrollTop > 100);
    };

    // Initial update
    updateProgress();

    // Use requestAnimationFrame for smooth updates
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 h-1 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-background-subtle/80 backdrop-blur-sm" />

      {/* Progress bar */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent/80 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />

      {/* Glow effect at the end */}
      <div
        className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent to-accent/30 blur-sm transition-[left] duration-150 ease-out"
        style={{ left: `calc(${progress}% - 48px)` }}
      />
    </div>
  );
}
