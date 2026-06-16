'use client';

import { useEffect, useRef } from 'react';

const GLOW_SIZE = 600;
const EASE = 0.08;

export function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    // Start centered so the effect is visible before any mouse movement.
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const place = (x: number, y: number) => {
      glow.style.transform = `translate3d(${x - GLOW_SIZE / 2}px, ${y - GLOW_SIZE / 2}px, 0)`;
    };
    place(currentX, currentY);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMove);

    let frame: number;
    const animate = () => {
      currentX += (targetX - currentX) * EASE;
      currentY += (targetY - currentY) * EASE;
      place(currentX, currentY);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${GLOW_SIZE}px`,
        height: `${GLOW_SIZE}px`,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,158,117,0.25) 0%, transparent 70%)',
        filter: 'blur(40px)',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
        zIndex: 0,
        willChange: 'transform',
      }}
    />
  );
}
