/**
 * ANIMATION SYSTEM - Professional animations & transitions
 * Centralized animation utilities for consistent UX
 */

// Animation durations (ms)
export const DURATIONS = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700,
} as const;

// Easing functions
export const EASINGS = {
  smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// Fade animations
export const fadeIn = (duration: number = DURATIONS.normal) => `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  animation: fadeIn ${duration}ms ${EASINGS.smooth};
`;

export const fadeOut = (duration: number = DURATIONS.normal) => `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  animation: fadeOut ${duration}ms ${EASINGS.smooth};
`;

// Slide animations
export const slideIn = (direction: 'up' | 'down' | 'left' | 'right', duration: number = DURATIONS.normal) => {
  const transforms = {
    up: 'translateY(20px)',
    down: 'translateY(-20px)',
    left: 'translateX(20px)',
    right: 'translateX(-20px)',
  };
  
  return `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: ${transforms[direction]};
      }
      to {
        opacity: 1;
        transform: translateY(0) translateX(0);
      }
    }
    animation: slideIn ${duration}ms ${EASINGS.smooth};
  `;
};

// Scale animations
export const scaleIn = (duration: number = DURATIONS.normal) => `
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  animation: scaleIn ${duration}ms ${EASINGS.smooth};
`;

// Pulse animation
export const pulse = (duration: number = DURATIONS.slow) => `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  animation: pulse ${duration}ms ${EASINGS.smooth} infinite;
`;

// Shimmer/loading animation
export const shimmer = () => `
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
`;

// Transition utilities
export const transition = (
  property: string = 'all',
  duration: number = DURATIONS.normal,
  easing: string = EASINGS.smooth
) => `transition: ${property} ${duration}ms ${easing};`;

// Hover scale effect
export const hoverScale = (scale: number = 1.05) => ({
  transition: transition('transform'),
  cursor: 'pointer',
  '&:hover': {
    transform: `scale(${scale})`,
  },
});

// Button press effect
export const buttonPress = () => ({
  transition: transition('transform', DURATIONS.fast),
  cursor: 'pointer',
  '&:active': {
    transform: 'scale(0.95)',
  },
});

// Stagger delay helper
export const staggerDelay = (index: number, baseDelay: number = 50) => ({
  animationDelay: `${index * baseDelay}ms`,
});

