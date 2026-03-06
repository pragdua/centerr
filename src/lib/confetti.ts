import confetti from "canvas-confetti";

export function fireCompletionConfetti() {
  const defaults = {
    spread: 60,
    ticks: 100,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
    colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF", "#FF8B94"],
  };

  confetti({
    ...defaults,
    particleCount: 40,
    origin: { x: 0.2, y: 0.6 },
    angle: 60,
  });

  confetti({
    ...defaults,
    particleCount: 40,
    origin: { x: 0.8, y: 0.6 },
    angle: 120,
  });

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 25,
      origin: { x: 0.5, y: 0.4 },
      spread: 100,
    });
  }, 200);
}
