/** Whether page content should fade on route change (first visit and PRM skip fade). */
export function shouldPageTransitionFade(
  hasVisitedOnce: boolean,
  reduceMotion: boolean | null,
): boolean {
  return hasVisitedOnce && reduceMotion === false;
}
