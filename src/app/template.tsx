"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Loading from "./loading";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [contentOpacity, setContentOpacity] = useState(0);

  // Use useMemo to ensure the children don't re-calculate 
  // until the loading state is finished.
  const renderedChildren = useMemo(() => children, [children]);

  useEffect(() => {
    // 1. Lock the loading state immediately
    setLoading(true);
    setContentOpacity(0);

    // 2. Set the 1s timer
    const timer = setTimeout(() => {
      setLoading(false);
      // Small nested timeout to trigger the fade transition
      const fadeTimer = setTimeout(() => setContentOpacity(1), 50);
      return () => clearTimeout(fadeTimer);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]); // Only re-run when the URL actually changes

  return (
    <>
      {/* The Loading screen is fixed and on top. 
        We use conditional rendering to show/hide the logo.
      */}
      {loading && <Loading />}

      <div
        style={{
          opacity: contentOpacity,
          transition: "opacity 0.8s ease-in-out",
          // Use visibility instead of display:none to prevent 
          // layout shifts or component unmounting issues
          visibility: loading ? "hidden" : "visible",
          height: loading ? "100vh" : "auto",
          overflow: loading ? "hidden" : "visible",
        }}
      >
        {renderedChildren}
      </div>
    </>
  );
}