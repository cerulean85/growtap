"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

export function ConfettiBurst({ tick }: { tick: number }) {
  useEffect(() => {
    if (tick === 0) return;

    const duration = 1500;
    const end = Date.now() + duration;
    const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899", "#a855f7"];

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    let raf = 0;
    const fire = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });
      raf = requestAnimationFrame(fire);
    };
    raf = requestAnimationFrame(fire);

    return () => cancelAnimationFrame(raf);
  }, [tick]);

  return null;
}
