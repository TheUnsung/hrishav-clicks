'use client';

import React, { useEffect, useRef } from 'react';

export function ApertureCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Do not run on mobile / touch-only devices
    const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!hasMouse) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const LIFE = 1800; // ms each badge stays
    const MAX = 90;
    const R = 19; // cursor radius
    const LOGO_CHANCE = 0.22; // chance a burst item is an Lr / Ps logo

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

    /* ---------- badge sprites (drawn once, reused) ---------- */
    const SC = Math.max(2, window.devicePixelRatio || 1);
    function sprite(
      w: number,
      h: number,
      draw: (x: CanvasRenderingContext2D, w: number, h: number) => void
    ) {
      const c = document.createElement('canvas');
      c.width = w * SC;
      c.height = h * SC;
      const x = c.getContext('2d');
      if (x) {
        x.scale(SC, SC);
        draw(x, w, h);
      }
      return { c, w, h };
    }

    function rr(
      x: CanvasRenderingContext2D,
      px: number,
      py: number,
      w: number,
      h: number,
      r: number
    ) {
      x.beginPath();
      x.moveTo(px + r, py);
      x.arcTo(px + w, py, px + w, py + h, r);
      x.arcTo(px + w, py + h, px, py + h, r);
      x.arcTo(px, py + h, px, py, r);
      x.arcTo(px, py, px + w, py, r);
      x.closePath();
    }

    const FORMATS: Record<string, string> = {
      PNG: '#3b82f6',
      JPEG: '#f59e0b',
      RAW: '#ef4444',
      TIFF: '#8b5cf6',
      DNG: '#10b981',
      HEIC: '#ec4899',
      WEBP: '#06b6d4',
      CR3: '#f97316',
      NEF: '#ca8a04',
      ARW: '#14b8a6',
      PSD: '#1e40af',
    };

    const formatSprites = Object.entries(FORMATS).map(([label, color]) => {
      const m = document.createElement('canvas').getContext('2d');
      if (m) {
        m.font = '700 10px system-ui, sans-serif';
      }
      const w = m ? Math.ceil(m.measureText(label).width) + 16 : 40;
      const h = 20;
      return sprite(w, h, (x) => {
        rr(x, 0.5, 0.5, w - 1, h - 1, 6);
        const g = x.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, color);
        g.addColorStop(1, 'rgba(0,0,0,.35)');
        x.fillStyle = color;
        x.fill();
        x.fillStyle = g;
        x.fill();
        x.strokeStyle = 'rgba(255,255,255,.45)';
        x.lineWidth = 1;
        x.stroke();
        x.fillStyle = '#fff';
        x.font = '700 10px system-ui, sans-serif';
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.fillText(label, w / 2, h / 2 + 0.5);
      });
    });

    const logoSprites = [
      ['Lr', '#0b2a3d', '#74c7ff'],
      ['Ps', '#001e36', '#31a8ff'],
    ].map(([t, bg, fg]) =>
      sprite(26, 26, (x, w, h) => {
        rr(x, 1, 1, w - 2, h - 2, 6);
        x.fillStyle = bg;
        x.fill();
        x.strokeStyle = fg;
        x.lineWidth = 1.5;
        x.stroke();
        x.fillStyle = fg;
        x.font = '700 13px system-ui, sans-serif';
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.fillText(t, w / 2, h / 2 + 1);
      })
    );

    /* ---------- state ---------- */
    const mouse = { x: -100, y: -100, seen: false };
    interface Particle {
      s: { c: HTMLCanvasElement; w: number; h: number };
      x: number;
      y: number;
      vx: number;
      vy: number;
      rot: number;
      vr: number;
      born: number;
    }
    interface Ripple {
      x: number;
      y: number;
      born: number;
    }

    const parts: Particle[] = [];
    const ripples: Ripple[] = [];
    let down = false;
    let hovering = false;
    let open = 0;
    let openV = 0; // spring for the iris
    let animId: number;

    function spawn(x: number, y: number, vx: number, vy: number) {
      if (parts.length >= MAX) parts.shift();
      const pool = Math.random() < LOGO_CHANCE ? logoSprites : formatSprites;
      parts.push({
        s: pool[(Math.random() * pool.length) | 0],
        x,
        y,
        vx,
        vy,
        rot: (Math.random() - 0.5) * 0.7,
        vr: (Math.random() - 0.5) * 0.02,
        born: performance.now(),
      });
    }

    const onPointerMove = (e: MouseEvent | PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.seen = true;
      const targetEl = e.target as HTMLElement | null;
      hovering = !!(
        targetEl &&
        targetEl.closest &&
        targetEl.closest('a, button, [role="button"], input, select, textarea, label')
      );
    };

    const onPointerDown = () => {
      down = true;
      if (reduce) return;
      ripples.push({ x: mouse.x, y: mouse.y, born: performance.now() });
      for (let i = 0; i < 8; i++) {
        // burst of badges on click
        const a = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
        const v = 2.2 + Math.random() * 1.6;
        spawn(mouse.x, mouse.y, Math.cos(a) * v, Math.sin(a) * v);
      }
    };

    const onPointerUp = () => {
      down = false;
    };

    const onPointerCancel = () => {
      down = false;
    };

    const onMouseLeave = () => {
      mouse.seen = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    document.documentElement.addEventListener('pointerleave', onMouseLeave);

    /* ---------- aperture drawing ---------- */
    function drawAperture(x: number, y: number, o: number) {
      if (!ctx) return;
      const r = 4 + Math.min(o, 1.2) * 8.5; // hole radius
      const rot = -Math.PI / 2 + o * 0.7 + (reduce ? 0 : 0); // blades twist as it opens
      const sc = down ? 1.12 : 1;
      const v = (i: number): [number, number] => [
        Math.cos(rot + (i * Math.PI) / 3) * r,
        Math.sin(rot + (i * Math.PI) / 3) * r,
      ];

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sc, sc);
      ctx.shadowColor = 'rgba(0,0,0,.55)';
      ctx.shadowBlur = 8;

      // lens body
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      const body = ctx.createRadialGradient(-6, -8, 2, 0, 0, R);
      body.addColorStop(0, '#4a4a55');
      body.addColorStop(1, '#14141a');
      ctx.fillStyle = body;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, R - 1, 0, Math.PI * 2);
      ctx.clip();

      // blade seams
      ctx.strokeStyle = 'rgba(255,255,255,.22)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const [ax, ay] = v(i);
        const [bx, by] = v(i + 1);
        const dx = bx - ax;
        const dy = by - ay;
        const l = Math.hypot(dx, dy) || 1;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + (dx / l) * 40, by + (dy / l) * 40);
        ctx.stroke();
      }

      // light coming through the opening
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const [px, py] = v(i);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r + 1);
      glow.addColorStop(0, '#fffbe8');
      glow.addColorStop(0.6, '#ffd27a');
      glow.addColorStop(1, '#ff9d2e');
      ctx.fillStyle = glow;
      ctx.shadowColor = 'rgba(255,190,90,.9)';
      ctx.shadowBlur = 6 + o * 14;
      ctx.fill();
      ctx.restore();

      // outer ring
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(235,235,240,.9)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, R - 3.2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    const easeOutBack = (x: number) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    };

    function tick(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // badges
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        const age = (t - p.born) / LIFE;
        if (age >= 1) {
          parts.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy = p.vy * 0.95 - 0.008;
        p.rot += p.vr;
        const pop = age < 0.14 ? Math.max(0, easeOutBack(age / 0.14)) : 1;
        const alpha = age > 0.6 ? 1 - (age - 0.6) / 0.4 : 1;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(pop, pop);
        ctx.shadowColor = 'rgba(0,0,0,.45)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.drawImage(p.s.c, -p.s.w / 2, -p.s.h / 2, p.s.w, p.s.h);
        ctx.restore();
      }

      // click ripples (like a shutter flash)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const q = ripples[i];
        const a = (t - q.born) / 550;
        if (a >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(q.x, q.y, R + a * 55, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,224,160,${(1 - a) * 0.7})`;
        ctx.lineWidth = 2 * (1 - a) + 0.5;
        ctx.stroke();
      }

      // iris spring: opens wide while pressed, half-opens over links/buttons
      const target = down ? 1 : hovering ? 0.4 : 0;
      openV += (target - open) * 0.2;
      openV *= 0.72;
      open += openV;

      if (mouse.seen) {
        drawAperture(mouse.x, mouse.y, open);
      }

      animId = requestAnimationFrame(tick);
    }

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      document.documentElement.removeEventListener('pointerleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="aperture-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-[99999]"
      style={{ pointerEvents: 'none' }}
    />
  );
}
