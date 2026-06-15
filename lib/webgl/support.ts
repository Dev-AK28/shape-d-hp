/**
 * Detects WebGL 2 (preferred) or WebGL 1 support.
 * Cached after the first call — WebGL capability does not change during a session.
 * Must only be called in a browser context; returns false on the server.
 */
let _cached: boolean | null = null;

export function detectWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  if (_cached !== null) return _cached;
  try {
    const canvas = document.createElement('canvas');
    _cached = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    _cached = false;
  }
  return _cached;
}

/** Reset the cached result — for use in tests only. */
export function resetWebGLSupportCache(): void {
  _cached = null;
}
