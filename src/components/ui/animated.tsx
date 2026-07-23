import { motion } from 'motion/react';
import React from 'react';

// ─── Fade In desde abajo (para cards, secciones) ───────────────────────────
export const FadeUp = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── Fade In desde la izquierda (para sidebar, headers) ────────────────────
export const FadeLeft = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── Stagger container (anima hijos en cascada) ────────────────────────────
export const StaggerList = ({
  children,
  className = '',
  staggerDelay = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{
      hidden: {},
      show: { transition: { staggerChildren: staggerDelay } },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── Scale on hover (para botones y cards interactivas) ────────────────────
export const ScaleHover = ({
  children,
  className = '',
  scale = 1.025,
}: {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.18, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── Animated number counter ──────────────────────────────────────────────
export const AnimatedNumber = ({
  value,
  className = '',
}: {
  value: number | string;
  className?: string;
}) => {
  const isNumeric = typeof value === 'number' || /^\d[\d,.]*$/.test(String(value));
  if (!isNumeric) return <span className={className}>{value}</span>;

  return (
    <motion.span
      key={String(value)}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {value}
    </motion.span>
  );
};

// ─── Page transition wrapper ──────────────────────────────────────────────
export const PageTransition = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── Animated progress bar ────────────────────────────────────────────────
export const AnimatedBar = ({
  pct,
  className = '',
  delay = 0,
}: {
  pct: number;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${pct}%` }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  />
);

// ─── Animated badge/chip ─────────────────────────────────────────────────
export const PopIn = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.75 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay, type: 'spring', stiffness: 300, damping: 20 }}
    className={className}
  >
    {children}
  </motion.span>
);
