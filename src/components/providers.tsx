"use client";

import { ReactLenis } from "lenis/react";
import { Toaster } from "sonner";
import { MotionConfig, useReducedMotion } from "motion/react";
import { useMemo, useSyncExternalStore } from "react";

const desktopScrollQuery =
  "(min-width: 901px) and (hover: hover) and (pointer: fine)";
const subscribeScrollMode = (notify: () => void) => {
  const query = window.matchMedia(desktopScrollQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const desktopScrollSnapshot = () =>
  window.matchMedia(desktopScrollQuery).matches;

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const reduced = useReducedMotion();
  const desktopScroll = useSyncExternalStore(
    subscribeScrollMode,
    desktopScrollSnapshot,
    () => false,
  );
  const scrollOptions = useMemo(
    () => ({ smoothWheel: desktopScroll && !reduced, syncTouch: false }),
    [desktopScroll, reduced],
  );
  return (
    <ReactLenis root options={scrollOptions}>
      <MotionConfig reducedMotion="user">
        {children}
        <Toaster
          position="bottom-right"
          mobileOffset={{
            left: 16,
            right: 16,
            bottom: "max(16px, env(safe-area-inset-bottom))",
          }}
          toastOptions={{
            style: {
              background: "var(--card)",
              color: "var(--foreground)",
              borderColor: "var(--border)",
            },
          }}
        />
      </MotionConfig>
    </ReactLenis>
  );
}
