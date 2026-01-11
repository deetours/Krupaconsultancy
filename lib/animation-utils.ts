/**
 * Animation Utilities - Helper functions for complex animations
 */

/**
 * Calculate 3D tilt angle based on mouse position relative to element
 * Returns { rotateX, rotateY } for use in Framer Motion transforms
 */
export const calculateTilt = (
  e: React.MouseEvent<HTMLElement>,
  element: HTMLElement | null,
  intensity: number = 5
): { rotateX: number; rotateY: number } => {
  if (!element) return { rotateX: 0, rotateY: 0 };

  const rect = element.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const rotateX = ((mouseY - centerY) / centerY) * -intensity;
  const rotateY = ((mouseX - centerX) / centerX) * intensity;

  return { rotateX, rotateY };
};

/**
 * Calculate magnetic cursor effect - offsets element toward mouse
 * Returns { x, y } for transform translation
 */
export const magneticCursor = (
  e: React.MouseEvent<HTMLElement>,
  element: HTMLElement | null,
  strength: number = 0.3
): { x: number; y: number } => {
  if (!element) return { x: 0, y: 0 };

  const rect = element.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const offsetX = (mouseX - centerX) * strength;
  const offsetY = (mouseY - centerY) * strength;

  return { x: offsetX, y: offsetY };
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation between two values
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

/**
 * Ease out cubic curve (used for animations)
 * Equivalent to cubic-bezier(0.215, 0.61, 0.355, 1)
 */
export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

/**
 * Spring easing approximation
 */
export const spring = (t: number, damping: number = 0.8): number => {
  return 1 - Math.cos(t * Math.PI) * Math.exp(-t * damping);
};

/**
 * Create staggered animation delays for multiple children
 * Returns array of delays in milliseconds
 */
export const createStaggerDelays = (
  count: number,
  baseDelay: number = 50
): number[] => {
  return Array.from({ length: count }, (_, i) => i * baseDelay);
};

/**
 * Convert HSL to RGB (for dynamic color animations if needed)
 */
export const hslToRgb = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Detect if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Generate random number between min and max
 */
export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Generate random particle positions for confetti
 */
export const generateConfettiParticles = (
  count: number = 5
): Array<{ x: number; y: number; rotate: number }> => {
  return Array.from({ length: count }, () => ({
    x: randomBetween(-100, 100),
    y: randomBetween(-150, -50),
    rotate: randomBetween(-360, 360),
  }));
};

/**
 * Smoothly animate scroll to element
 */
export const scrollToElement = (
  element: HTMLElement,
  behavior: ScrollBehavior = "smooth"
): void => {
  element.scrollIntoView({ behavior, block: "center" });
};

/**
 * Create a debounced function for expensive operations
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Create a throttled function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Format numbers with commas for count-up animations
 */
export const formatNumber = (num: number): string => {
  return Math.round(num).toLocaleString();
};

/**
 * Animate SVG stroke-dasharray for drawing animations
 */
export const calculateStrokeDasharray = (
  element: SVGElement | null
): number => {
  if (!element) return 0;
  const pathElement = element as unknown as { getTotalLength?: () => number };
  return pathElement.getTotalLength?.() ?? 0;
};

/**
 * Get transform values from element style
 */
export const getTransformValues = (
  element: HTMLElement | null
): { x: number; y: number; scale: number } => {
  if (!element) return { x: 0, y: 0, scale: 1 };

  const transform = element.style.transform;
  const values = { x: 0, y: 0, scale: 1 };

  // Simple regex parsing (Framer Motion outputs transform strings)
  const translateMatch = transform.match(/translate\(([^,]+)[,\s]+([^)]+)\)/);
  if (translateMatch) {
    values.x = parseFloat(translateMatch[1]);
    values.y = parseFloat(translateMatch[2]);
  }

  const scaleMatch = transform.match(/scale\(([^)]+)\)/);
  if (scaleMatch) {
    values.scale = parseFloat(scaleMatch[1]);
  }

  return values;
};
