export const STAR_INTERSECTION_OPTIONS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: '0px 0px -10% 0px',
};

export const NEBULA_INTERSECTION_OPTIONS: IntersectionObserverInit = {
  threshold: 0.1,
  rootMargin: '0px 0px -15% 0px',
};

// #365: threshold 0 / no rootMargin — the philosophy progress dots should stay
// visible as long as *any* part of the panelled section is still on screen,
// and hide only once the section has fully scrolled out of the viewport
// (i.e. the closing CTA / footer is what remains in view).
export const PHILOSOPHY_PANEL_INTERSECTION_OPTIONS: IntersectionObserverInit = {
  threshold: 0,
};
