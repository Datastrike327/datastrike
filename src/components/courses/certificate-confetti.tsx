"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function CertificateConfetti() {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#a78bfa", "#c4b5fd", "#fbbf24", "#34d399"],
    });
  }, []);

  return null;
}
