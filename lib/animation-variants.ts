/**
 * Animation Variants - Reusable Framer Motion variants
 * Follows spring physics (stiffness: 120, damping: 12-15) and organic curves
 */

export const fadeInUp = {
  initial: { y: 16, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    y: -16,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

export const slideInRight = {
  initial: { x: 100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
    },
  },
  exit: {
    x: 100,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

export const slideInLeft = {
  initial: { x: -100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
    },
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

export const slideInDown = {
  initial: { y: -100, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
    },
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

export const scaleUp = {
  initial: { scale: 0.95, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 12,
    },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

export const rotateInY = {
  initial: { rotateY: 90, opacity: 0 },
  animate: {
    rotateY: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    rotateY: -90,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

/**
 * Container variant for staggering children
 * Use with Framer Motion AnimatePresence and children with variants
 */
export const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

/**
 * Child variant for staggered animations
 */
export const staggerChild = {
  initial: { y: 16, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
  },
  exit: {
    y: -8,
    opacity: 0,
  },
};

/**
 * Hover animations
 */
export const magneticHover = {
  initial: { scale: 1 },
  whileHover: {
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
};

export const tiltHover = {
  whileHover: {
    rotateX: -2,
    rotateY: -2,
    transition: { type: "spring", stiffness: 300, damping: 10 },
  },
};

export const liftHover = {
  whileHover: {
    y: -4,
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)",
    transition: { type: "spring", stiffness: 300, damping: 10 },
  },
};

/**
 * Tap/press animations
 */
export const tapScale = {
  whileTap: {
    scale: 0.96,
    transition: { type: "spring", stiffness: 600, damping: 10 },
  },
};

/**
 * Loading animations
 */
export const breathingSkeleton = {
  animate: {
    scale: [0.98, 1.02, 0.98],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const pulseLoading = {
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Number count animation (use with useCountUp hook)
 */
export const countUpNumber = {
  initial: { y: 16, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/**
 * Badge animations
 */
export const badgePulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const badgeShake = {
  animate: {
    rotate: [0, -2, 2, -2, 0],
    transition: {
      duration: 0.4,
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },
};

/**
 * Checkmark draw animation
 */
export const checkmarkDraw = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.4, ease: "easeOut" },
      opacity: { duration: 0.3 },
    },
  },
};

/**
 * Confetti burst animation
 */
export const confettiBurst = (delay: number = 0) => ({
  initial: { y: 0, x: 0, opacity: 1, scale: 1 },
  animate: {
    y: [0, -100],
    x: 0,
    opacity: [1, 0],
    scale: [1, 0],
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay,
    },
  },
});

/**
 * Page transition animations
 */
export const pageEnter = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/**
 * Modal animations
 */
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: {
    opacity: 0.4,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const modalContent = {
  initial: { scale: 0.95, y: 10, opacity: 0 },
  animate: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
  exit: {
    scale: 0.95,
    y: 10,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

/**
 * Toast animations
 */
export const toastEnter = {
  initial: { x: 400, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
  exit: {
    x: 400,
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.3 },
  },
};

/**
 * Error shake animation
 */
export const errorShake = {
  animate: {
    x: [-4, 4, -4, 4, 0],
    transition: {
      duration: 0.4,
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },
};

/**
 * Success animation
 */
export const successPulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

/**
 * Drawer animations (mobile menu, sidebar)
 */
export const drawerEnter = {
  initial: { x: 384, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 12,
    },
  },
  exit: {
    x: 384,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

/**
 * Gradient animation (opacity shift)
 */
export const gradientShift = {
  animate: {
    backgroundPosition: ["0%", "100%"],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "linear",
    },
  },
};
