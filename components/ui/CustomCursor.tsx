'use client';

import { useEffect, useRef, useState } from 'react';
import { cursor as cursorTokens } from '@/lib/design/tokens';
import {
  setCustomCursorActive,
  shouldEnableCustomCursor,
} from '@/lib/design/custom-cursor';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';

const KEYBOARD_FOCUS_KEYS = new Set([
  'Tab',
  'Enter',
  ' ',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]);

export default function CustomCursor() {
  const { profile, isReady } = useDeviceProfile();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const inputModeRef = useRef<'pointer' | 'keyboard'>('pointer');
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const frame = useRef(0);

  const isActive = shouldEnableCustomCursor(profile, isReady);

  useEffect(() => {
    if (!isActive) {
      setCustomCursorActive(false);
      return;
    }

    const stopAnimation = () => {
      if (frame.current) {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
      }
    };

    const animate = () => {
      if (!visibleRef.current) {
        stopAnimation();
        return;
      }

      ring.current.x += (pos.current.x - ring.current.x) * cursorTokens.followerLerp;
      ring.current.y += (pos.current.y - ring.current.y) * cursorTokens.followerLerp;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }

      frame.current = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (!frame.current) {
        frame.current = requestAnimationFrame(animate);
      }
    };

    const showCursor = (x: number, y: number) => {
      pos.current = { x, y };
      ring.current = { x, y };
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
        setCustomCursorActive(true);
      }
      startAnimation();
    };

    const hideCursor = () => {
      visibleRef.current = false;
      setVisible(false);
      setCustomCursorActive(false);
      stopAnimation();
    };

    const onMove = (event: MouseEvent) => {
      showCursor(event.clientX, event.clientY);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (KEYBOARD_FOCUS_KEYS.has(event.key)) {
        inputModeRef.current = 'keyboard';
      }
    };

    const onPointerDown = () => {
      inputModeRef.current = 'pointer';
    };

    const showCursorAtElement = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      showCursor(rect.left + rect.width / 2, rect.top + rect.height / 2);
    };

    const repositionToFocusedElement = () => {
      if (inputModeRef.current !== 'keyboard' || !visibleRef.current) {
        return;
      }

      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) {
        return;
      }

      showCursorAtElement(active);
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (inputModeRef.current !== 'keyboard') {
        if (!target.matches(':focus-visible')) {
          return;
        }
        inputModeRef.current = 'keyboard';
      }

      showCursorAtElement(target);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hideCursor();
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('blur', hideCursor);
    window.addEventListener('scroll', repositionToFocusedElement, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', repositionToFocusedElement);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.documentElement.addEventListener('mouseleave', hideCursor);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('blur', hideCursor);
      window.removeEventListener('scroll', repositionToFocusedElement, true);
      window.removeEventListener('resize', repositionToFocusedElement);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.documentElement.removeEventListener('mouseleave', hideCursor);
      visibleRef.current = false;
      setCustomCursorActive(false);
      stopAnimation();
    };
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  const dotStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: cursorTokens.size,
    height: cursorTokens.size,
    marginLeft: -cursorTokens.size / 2,
    marginTop: -cursorTokens.size / 2,
    borderRadius: '50%',
    background: 'var(--accent)',
    pointerEvents: 'none' as const,
    zIndex: 9999,
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.3s',
    ...(visible ? { willChange: 'transform' as const } : {}),
  };

  const ringStyle = {
    ...dotStyle,
    width: cursorTokens.followerSize,
    height: cursorTokens.followerSize,
    marginLeft: -cursorTokens.followerSize / 2,
    marginTop: -cursorTokens.followerSize / 2,
    background: 'transparent',
    border: '1px solid var(--accent-subtle)',
    opacity: visible ? cursorTokens.followerOpacity : 0,
  };

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" style={dotStyle} aria-hidden="true" />
      <div ref={ringRef} className="custom-cursor-ring" style={ringStyle} aria-hidden="true" />
    </>
  );
}
