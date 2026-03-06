"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, disabled }: CheckboxProps) {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number }[]
  >([]);

  const handleClick = () => {
    if (disabled) return;
    if (!checked) {
      const newParticles = Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 40,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 600);
    }
    onChange(!checked);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="relative flex items-center justify-center w-8 h-8 cursor-pointer disabled:cursor-not-allowed touch-manipulation"
    >
      <motion.div
        className="w-7 h-7 rounded-lg border-2 flex items-center justify-center"
        animate={{
          backgroundColor: checked
            ? "oklch(0.72 0.19 155)"
            : "transparent",
          borderColor: checked
            ? "oklch(0.72 0.19 155)"
            : "#d1d5db",
          scale: checked ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-white"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <motion.path
                d="M5 13l4 4L19 7"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, delay: 0.05 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Particle burst on check */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: "50%",
              top: "50%",
              backgroundColor: "oklch(0.72 0.19 155)",
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}
