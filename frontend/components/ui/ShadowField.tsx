'use client';

import { useEffect, useRef } from 'react';

// Shy shadow figures scattered in the dark. They drift gently on their own and
// flee + spin + fade away when the flashlight (cursor glow) gets close — you can
// never quite catch one with the light.

type Shape = {
  top: number; // % of viewport height
  left: number; // % of viewport width
  size: number; // px
  radius: string; // organic blob silhouette
  duration: number; // idle float seconds
  delay: number;
  spin: 1 | -1; // direction it spins when fleeing
};

const SHAPES: Shape[] = [
  { top: 22, left: 14, size: 150, radius: '47% 53% 60% 40% / 55% 48% 52% 45%', duration: 8, delay: 0, spin: 1 },
  { top: 68, left: 20, size: 80, radius: '60% 40% 45% 55% / 50% 60% 40% 50%', duration: 9, delay: 1.2, spin: -1 },
  { top: 28, left: 80, size: 175, radius: '52% 48% 43% 57% / 42% 55% 45% 58%', duration: 10, delay: 0.6, spin: -1 },
  { top: 74, left: 70, size: 110, radius: '45% 55% 55% 45% / 58% 42% 58% 42%', duration: 8.5, delay: 1.8, spin: 1 },
  { top: 46, left: 50, size: 60, radius: '50% 50% 60% 40% / 55% 45% 55% 45%', duration: 11, delay: 0.9, spin: -1 },
  { top: 14, left: 56, size: 95, radius: '55% 45% 50% 50% / 48% 52% 48% 52%', duration: 7, delay: 2.4, spin: 1 },
  { top: 58, left: 90, size: 130, radius: '48% 52% 52% 48% / 60% 40% 60% 40%', duration: 9.5, delay: 0.3, spin: 1 },
  { top: 40, left: 30, size: 55, radius: '58% 42% 48% 52% / 45% 58% 42% 55%', duration: 7.5, delay: 1.6, spin: -1 },
  { top: 84, left: 44, size: 100, radius: '50% 50% 45% 55% / 52% 48% 55% 45%', duration: 10.5, delay: 0.5, spin: -1 },
  { top: 8, left: 36, size: 70, radius: '53% 47% 57% 43% / 47% 53% 43% 57%', duration: 8, delay: 2.8, spin: 1 },
  { top: 52, left: 8, size: 90, radius: '46% 54% 52% 48% / 56% 44% 58% 42%', duration: 9, delay: 2, spin: 1 },
  { top: 88, left: 82, size: 65, radius: '54% 46% 48% 52% / 50% 52% 46% 54%', duration: 7.5, delay: 1, spin: -1 },
];

const FLEE_RADIUS = 340; // px around the cursor where shapes start to hide
const MAX_PUSH = 230; // px max displacement away from the light
const MAX_SPIN = 320; // deg of tumble at full flee
const EASE = 0.14;
const BASE_OPACITY = 0.8;

export function ShadowField() {
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    const onResize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Start the cursor off-screen so nothing flees until the user moves.
    let mouseX = -9999;
    let mouseY = -9999;
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    // Per-shape smoothed state.
    const state = SHAPES.map(() => ({ px: 0, py: 0, rot: 0, op: BASE_OPACITY }));

    let frame: number;
    const animate = () => {
      for (let i = 0; i < SHAPES.length; i++) {
        const node = nodesRef.current[i];
        if (!node) continue;

        const anchorX = (SHAPES[i].left / 100) * vw;
        const anchorY = (SHAPES[i].top / 100) * vh;
        const dx = anchorX - mouseX;
        const dy = anchorY - mouseY;
        const dist = Math.hypot(dx, dy) || 1;

        let targetPX = 0;
        let targetPY = 0;
        let targetRot = 0;
        let targetOp = BASE_OPACITY;

        if (dist < FLEE_RADIUS) {
          const force = 1 - dist / FLEE_RADIUS; // 0..1, stronger when closer
          targetPX = (dx / dist) * force * MAX_PUSH;
          targetPY = (dy / dist) * force * MAX_PUSH;
          targetRot = force * MAX_SPIN * SHAPES[i].spin; // tumble away
          targetOp = BASE_OPACITY * (1 - force); // fade into the dark as the light nears
        }

        const s = state[i];
        s.px += (targetPX - s.px) * EASE;
        s.py += (targetPY - s.py) * EASE;
        s.rot += (targetRot - s.rot) * EASE;
        s.op += (targetOp - s.op) * EASE;

        node.style.transform = `translate3d(${s.px}px, ${s.py}px, 0) rotate(${s.rot}deg)`;
        node.style.opacity = String(s.op);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {SHAPES.map((shape, i) => (
        <div
          key={i}
          ref={(el) => {
            nodesRef.current[i] = el;
          }}
          style={{
            position: 'absolute',
            top: `${shape.top}%`,
            left: `${shape.left}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            marginLeft: `${-shape.size / 2}px`,
            marginTop: `${-shape.size / 2}px`,
            opacity: BASE_OPACITY,
            willChange: 'transform, opacity',
          }}
        >
          {/* inner element carries the gentle idle float so it never fights the flee transform */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: shape.radius,
              background:
                'radial-gradient(circle at 50% 45%, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.32) 45%, transparent 72%)',
              animation: `shadowDrift ${shape.duration}s ease-in-out ${shape.delay}s infinite`,
            }}
          />
        </div>
      ))}

      <style>{`
        @keyframes shadowDrift {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(14px, -20px) rotate(6deg) scale(1.06); }
          50% { transform: translate(-10px, -32px) rotate(-5deg) scale(1.1); }
          75% { transform: translate(-16px, -12px) rotate(4deg) scale(1.04); }
        }
      `}</style>
    </div>
  );
}
