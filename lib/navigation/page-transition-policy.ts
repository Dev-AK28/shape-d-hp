/** Whether page content should fade on route change (first visit, PRM, and mobile skip fade). */
export function shouldPageTransitionFade(
  hasVisitedOnce: boolean,
  reduceMotion: boolean | null,
  isMobile = false,
): boolean {
  return hasVisitedOnce && reduceMotion === false && !isMobile;
}
