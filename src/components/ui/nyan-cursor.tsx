'use client';

import React, { useEffect, useRef } from 'react';

export function NyanCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Do not run on mobile / touch-only devices
    const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!hasMouse) return;

    const COLORS = ['#ff0000', '#ff9900', '#ffff00', '#33ff00', '#0099ff', '#6633ff'];
    const S = 3;              // pixel scale of the cat
    const BAND = 5;           // rainbow band thickness
    const MAX_TRAIL = 40;     // trail length (points)
    const EASE = 0.22;        // follow smoothness (0-1)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!canvas || !ctx) return;
      dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resize);
    resize();

    const target = { x: W / 2, y: H / 2 };
    const pos = { x: W / 2, y: H / 2 };
    const trail: Array<{ x: number; y: number }> = [];
    let hasMoved = false;
    let isVisible = false;
    let animId: number;

    const onPointerMove = (e: MouseEvent | PointerEvent) => {
      if (!hasMoved) {
        hasMoved = true;
        // Snap initial pos to current pointer so it doesn't fly from center on first move
        pos.x = e.clientX;
        pos.y = e.clientY;
      }
      isVisible = true;
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const onPointerLeave = () => {
      isVisible = false;
    };

    const onPointerEnter = (e: MouseEvent) => {
      isVisible = true;
      target.x = e.clientX;
      target.y = e.clientY;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);
    document.addEventListener('mouseenter', onPointerEnter);

    const r = (x: number, y: number, w: number, h: number, c: string) => {
      if (!ctx) return;
      ctx.fillStyle = c;
      ctx.fillRect(x * S, y * S, w * S, h * S);
    };

    function drawCat(frame: number) {
      if (!ctx) return;
      const bob = frame % 2 ? 1 : 0;
      ctx.save();
      ctx.translate(-17 * S, -10 * S + bob * S); // center on the pointer

      // tail
      r(0, 9, 5, 4, '#000');
      r(1, 10, 4, 2, '#999');

      // legs
      const l = frame % 2 ? 1 : 0;
      ([
        [6, 0],
        [11, 1],
        [19, 1],
        [24, 0],
      ] as const).forEach(([x, o]) => {
        r(x, 18 + (o ^ l) * 1, 3, 3, '#000');
        r(x + 0.5, 18 + (o ^ l) * 1, 2, 2, '#999');
      });

      // pop-tart
      r(4, 3, 21, 16, '#000');
      r(5, 4, 19, 14, '#ffcc99');
      r(7, 6, 15, 10, '#ff99ff');

      // sprinkles
      ([
        [9, 7],
        [14, 8],
        [18, 7],
        [11, 11],
        [16, 12],
        [20, 10],
        [9, 14],
        [14, 14],
        [19, 14],
      ] as const).forEach(([x, y]) => r(x, y, 1.2, 1.2, '#ff3399'));

      // head
      r(18, 6, 14, 12, '#000');
      r(19, 7, 12, 10, '#999');

      // ears
      r(18, 3, 4, 4, '#000');
      r(19, 4, 2, 3, '#999');
      r(28, 3, 4, 4, '#000');
      r(29, 4, 2, 3, '#999');

      // eyes
      r(21, 10, 2, 2, '#000');
      r(21, 10, 0.8, 0.8, '#fff');
      r(27, 10, 2, 2, '#000');
      r(27, 10, 0.8, 0.8, '#fff');

      // cheeks + mouth
      r(19.5, 13, 2, 2, '#ffaaaa');
      r(28.5, 13, 2, 2, '#ffaaaa');
      r(23, 13, 1, 2, '#000');
      r(26, 13, 1, 2, '#000');
      r(23, 14, 4, 1, '#000');

      ctx.restore();
    }

    function drawTrail(t: number) {
      if (!ctx || trail.length < 2) return;
      for (let b = 0; b < COLORS.length; b++) {
        ctx.strokeStyle = COLORS[b];
        ctx.lineWidth = BAND + 1;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i < trail.length; i++) {
          const p = trail[i];
          // blocky wave so the rainbow ripples like the original
          const wave = Math.round(Math.sin((i + t * 0.01) * 0.6) * 2) * 2;
          const y = p.y + (b - 2.5) * BAND + wave - 2;
          if (i === 0) {
            ctx.moveTo(p.x, y);
          } else {
            ctx.lineTo(p.x, y);
          }
        }
        ctx.stroke();
      }
    }

    let alpha = 0;

    function tick(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // Smooth fade in / fade out when pointer is active or leaves window
      if (isVisible && hasMoved) {
        alpha = Math.min(1, alpha + 0.1);
      } else {
        alpha = Math.max(0, alpha - 0.08);
      }

      if (alpha > 0.01) {
        pos.x += (target.x - pos.x) * EASE;
        pos.y += (target.y - pos.y) * EASE;

        // the trail starts at the cat's body and fades by shrinking away
        trail.unshift({ x: pos.x - 14 * S, y: pos.y });
        if (trail.length > MAX_TRAIL) trail.pop();

        // pull the tail end in when the cat is still, so the rainbow retracts
        if (Math.hypot(target.x - pos.x, target.y - pos.y) < 1 && trail.length > 2) {
          trail.pop();
        }

        ctx.save();
        ctx.globalAlpha = 0.95 * alpha;
        drawTrail(t);

        ctx.globalAlpha = 1 * alpha;
        ctx.translate(pos.x, pos.y);
        drawCat(reduce ? 0 : Math.floor(t / 120));
        ctx.restore();
      } else if (trail.length > 0) {
        trail.length = 0;
      }

      animId = requestAnimationFrame(tick);
    }

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
      document.removeEventListener('mouseenter', onPointerEnter);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="nyan-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-[99999]"
      style={{ pointerEvents: 'none' }}
    />
  );
}
