"use client";

import { useEffect, useRef } from "react";

export function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      
      // Update global CSS variables on the root document for spotlight background glows
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Smooth lag interpolation for the cursor ring
    const updateCursor = () => {
      const dx = targetRef.current.x - positionRef.current.x;
      const dy = targetRef.current.y - positionRef.current.y;
      
      positionRef.current.x += dx * 0.15;
      positionRef.current.y += dy * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
      }

      requestAnimationFrame(updateCursor);
    };

    const animationId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      {/* Spotlight layer */}
      <div className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 mouse-spotlight" />
      
      {/* Custom lagging ring */}
      <div 
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 w-8 h-8 rounded-full border border-primary/40 -translate-x-1/2 -translate-y-1/2 z-50 mix-blend-screen hidden md:block transition-all duration-75 shadow-[0_0_10px_rgba(0,242,254,0.15)]"
      />
    </>
  );
}
