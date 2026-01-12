"use client";

import { Suspense } from "react";
import { usePageView } from "@/hooks/use-analytics";

function AnalyticsTracker() {
  usePageView();
  return null;
}

export function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTracker />
    </Suspense>
  );
}
