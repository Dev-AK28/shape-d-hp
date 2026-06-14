import {
  ANIMATION_DURATION,
  ANIMATION_EASE,
} from '@/lib/scroll/animation-tokens';
import { gsap, registerGsapPlugins } from '@/lib/scroll/gsap-config';

export type MicroInteractionVariant = 'nav' | 'cta' | 'footer';

type MicroInteractionState = {
  scale?: number;
  opacity?: number;
  letterSpacing?: string;
};

type MicroInteractionPreset = {
  rest: MicroInteractionState;
  hover: MicroInteractionState;
};

/** GSAP quickTo hover presets — Issue #103 SSOT. */
export const MICRO_INTERACTION: Record<MicroInteractionVariant, MicroInteractionPreset> = {
  nav: {
    rest: { scale: 1, opacity: 1, letterSpacing: '0.1em' },
    hover: { scale: 1, opacity: 0.75, letterSpacing: '0.14em' },
  },
  cta: {
    rest: { scale: 1, opacity: 1 },
    hover: { scale: 1.03, opacity: 0.88 },
  },
  footer: {
    rest: { scale: 1, opacity: 1, letterSpacing: '0.02em' },
    hover: { scale: 1, opacity: 0.75, letterSpacing: '0.06em' },
  },
};

export const MICRO_INTERACTION_SELECTOR = '[data-micro-interaction]';

export function isMicroInteractionVariant(
  value: string | undefined,
): value is MicroInteractionVariant {
  return value === 'nav' || value === 'cta' || value === 'footer';
}

/** Desktop fine-pointer hover only — matches globals.css interaction media queries. */
export function shouldEnableMicroInteraction(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !window.matchMedia('(pointer: coarse)').matches &&
    !window.matchMedia('(hover: none)').matches
  );
}

function animatedProps(preset: MicroInteractionPreset): Array<keyof MicroInteractionState> {
  const keys = new Set<keyof MicroInteractionState>();
  for (const prop of Object.keys(preset.rest) as Array<keyof MicroInteractionState>) {
    keys.add(prop);
  }
  for (const prop of Object.keys(preset.hover) as Array<keyof MicroInteractionState>) {
    keys.add(prop);
  }
  return [...keys];
}

/** Attach GSAP quickTo hover handlers. Returns teardown. */
export function bindMicroInteraction(
  element: HTMLElement,
  variant: MicroInteractionVariant,
): () => void {
  if (!shouldEnableMicroInteraction()) {
    return () => {};
  }

  registerGsapPlugins();

  const preset = MICRO_INTERACTION[variant];
  const props = animatedProps(preset);
  const options = {
    duration: ANIMATION_DURATION.interaction,
    ease: ANIMATION_EASE.interaction,
  };

  const quickScale =
    props.includes('scale') ? gsap.quickTo(element, 'scale', options) : null;
  const quickOpacity =
    props.includes('opacity') ? gsap.quickTo(element, 'opacity', options) : null;
  const quickLetterSpacing = props.includes('letterSpacing')
    ? (gsap.quickTo(element, 'letterSpacing', options) as unknown as (
        value: string,
      ) => void)
    : null;

  gsap.set(element, preset.rest);

  const applyState = (state: MicroInteractionState) => {
    if (state.scale !== undefined) {
      quickScale?.(state.scale);
    }
    if (state.opacity !== undefined) {
      quickOpacity?.(state.opacity);
    }
    if (state.letterSpacing !== undefined) {
      quickLetterSpacing?.(state.letterSpacing);
    }
  };

  const onEnter = () => applyState(preset.hover);
  const onLeave = () => applyState(preset.rest);

  element.addEventListener('mouseenter', onEnter);
  element.addEventListener('mouseleave', onLeave);

  return () => {
    element.removeEventListener('mouseenter', onEnter);
    element.removeEventListener('mouseleave', onLeave);
    gsap.set(element, preset.rest);
  };
}

/** Bind all `[data-micro-interaction]` elements in a root. Returns teardown. */
export function bindMicroInteractionScope(root: ParentNode = document): () => void {
  if (!shouldEnableMicroInteraction()) {
    return () => {};
  }

  const cleanups: Array<() => void> = [];

  root.querySelectorAll(MICRO_INTERACTION_SELECTOR).forEach((node) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const variant = node.dataset.microInteraction;
    if (!isMicroInteractionVariant(variant)) {
      return;
    }

    cleanups.push(bindMicroInteraction(node, variant));
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
