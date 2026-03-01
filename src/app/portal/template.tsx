"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageTransition, pageVariants, instantTransition } from "@/components/ui/motion";

export default function PortalTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        transition={prefersReducedMotion ? instantTransition : pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
