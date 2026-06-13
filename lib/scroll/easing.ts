export const scrollEase = [0.22, 1, 0.36, 1] as const;

export const scrollViewport = {
  once: true,
  margin: '-80px' as const,
  amount: 0.2 as const,
};

export const scrollTransition = {
  duration: 0.9,
  ease: scrollEase,
};
