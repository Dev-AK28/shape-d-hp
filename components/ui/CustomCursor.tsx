'use client';

import { useEffect, useRef, useState } from 'react';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { cursor as cursorTokens } from '@/lib/design/tokens';

const CUSTOM_CURSOR_ATTR = 'data-custom-cursor';

function setCustomCursorActive(active: boolean): void {
  if (active) {
    document.documentElement.setAttribute(CUSTOM_CURSOR_ATTR, 'active');
    return;
  }
  document.documentElement.removeAttribute(CUSTOM_CURSOR_ATTR);
}

export default function CustomCursor() {
  const { profile, isReady } = useDeviceProfile();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const frame = useRef(0);

  const isActive =
    isReady &&
    !profile.prefersReducedMotion &&
    !profile.isMobile &&
    !profile.prefersCoarsePointer;

  useEffect(() => {
    if (!isActive) {
      setCustomCursorActive(false);
      return;
    }

    const showCursor = (x: number, y: number) => {
      pos.current = { x, y };
      ring.current = { x, y };
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
        setCustomCursorActive(true);
      }
    };

    const onMove = (event: MouseEvent) => {
      showCursor(event.clientX, event.clientY);
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const rect = target.getBoundingClientRect();
      showCursor(rect.left + rect.width / 2, rect.top + rect.height / 2);
    };

    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
      setCustomCursorActive(false);
    };

    const animate = () => {
      if (visibleRef.current) {
        ring.current.x += (pos.current.x - ring.current.x) * cursorTokens.followerLerp;
        ring.current.y += (pos.current.y - ring.current.y) * cursorTokens.followerLerp;

        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
        }
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
        }
      }

      frame.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('focusin', onFocusIn);
    document.documentElement.addEventListener('mouseleave', onLeave);
    frame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('focusin', onFocusIn);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(frame.current);
      visibleRef.current = false;
      setCustomCursorActive(false);
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
    willChange: 'transform' as const,
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
      <div ref={dotRef} style={dotStyle} aria-hidden="true" />
      <div ref={ringRef} style={ringStyle} aria-hidden="true" />
    </>
  );
}
