"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface InteractiveLogoProps {
  className?: string;
}

export function InteractiveLogo({ className = "" }: InteractiveLogoProps) {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: "#1A759F" }}
    >
      {/* Interactive Logo */}
      <motion.div
        className="relative cursor-pointer"
        whileHover={{ scale: 1.08, rotate: 180 }}
        whileTap={{ scale: 0.95, rotate: 360 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        onHoverStart={() => setHasInteracted(true)}
        onTap={() => setHasInteracted(true)}
      >
        {/* GlobFam Flower Logo - White version */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <path d="M 12 12 C 10 9 10 5 12 2 C 14 5 14 9 12 12" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none"/>
          <path d="M 12 12 C 14 10 17.5 8.5 20.5 9.5 C 17.5 11.5 14.5 12 12 12" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none"/>
          <path d="M 12 12 C 14.5 12 17.5 12.5 20.5 14.5 C 17.5 15.5 14 14 12 12" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none"/>
          <path d="M 12 12 C 14 15 14 19 12 22 C 10 19 10 15 12 12" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none"/>
          <path d="M 12 12 C 9.5 12 6.5 12.5 3.5 14.5 C 6.5 15.5 10 14 12 12" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none"/>
          <path d="M 12 12 C 10 10 6.5 8.5 3.5 9.5 C 6.5 11.5 9.5 12 12 12" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none"/>
        </svg>
      </motion.div>

      {/* Interaction hint - fades out after first interaction */}
      <motion.div
        className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2"
        initial={{ opacity: 1 }}
        animate={{ opacity: hasInteracted ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated hand/cursor icon */}
        <motion.div
          animate={{
            y: [0, -4, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-70"
          >
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        </motion.div>
        <span className="text-white/70 text-xs font-medium tracking-wide uppercase">
          Try hovering
        </span>
      </motion.div>

      {/* Decorative ring */}
      <motion.div
        className="absolute w-56 h-56 rounded-full border border-white/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
