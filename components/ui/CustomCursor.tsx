'use client';

import { useEffect, useRef, useState } from 'react';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { cursor as cursorTokens } from '@/lib/design/tokens';

export default function CustomCursor() {
  const { profile, isReady } = useDeviceProfile();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const frame = useRef(0);

  useEffect(() => {
    if (
      !isReady ||
      profile.prefersReducedMotion ||
      profile.isMobile ||
      profile.prefersCoarsePointer
    ) {
      return;
    }

    const onMove = (event: MouseEvent) => {
      pos.current = { x: event.clientX, y: event.clientY };
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
    };

    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    const animate = () => {
      if (visibleRef.current) {
        ring.current.x += (pos.current.x - ring.current.x) * 0.12;
        ring.current.y += (pos.current.y - ring.current.y) * 0.12;

        if (dotRef.current) {
          dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
        }
        if (ringRef.current) {
          ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)`;
        }
      }

      frame.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);
    frame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(frame.current);
    };
  }, [isReady, profile.isMobile, profile.prefersCoarsePointer, profile.prefersReducedMotion]);

  if (
    !isReady ||
    profile.prefersReducedMotion ||
    profile.isMobile ||
    profile.prefersCoarsePointer
  ) {
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
