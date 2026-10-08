'use client';

import { useEffect, useRef } from 'react';
import { ROSE, SYMBOL_CELLS, cellColor } from '@/lib/v3/brand';

interface PixelFieldProps {
  label: string;
  hint: string;
}

interface Particle {
  x: number; y: number; vx: number; vy: number; hx: number; hy: number; delay: number; color: string;
}

const STIFFNESS = 170;
const DAMPING = 18;
const NOISE_COLORS = ['#F5D3A1', '#F89A5B', '#EF3A78'];

/**
 * The hero: the symbol's 56 modules spring home from scattered positions, the
 * rose dot lands last, and the pointer pushes modules with its own velocity.
 * Every frame integrates from the current position and velocity, so the field
 * can be interrupted at any instant and always settles back.
 * Reduced motion draws the resolved symbol and never animates.
 */
export function PixelField({ label, hint }: PixelFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');

    let W = 0, H = 0, S = 0, ox = 0, oy = 0;
    let raf = 0, lastT = 0, visible = true;
    let noise: { x: number; y: number; c: string }[] = [];
    const ptr = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0 };
    const P: Particle[] = SYMBOL_CELLS.map(([cx, cy]) => ({
      x: 0, y: 0, vx: 0, vy: 0, hx: 0, hy: 0, delay: 0, color: cellColor(cx, cy),
    }));

    const layout = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = Math.max(4, Math.floor(Math.min((W * 0.72) / 10, (H * 0.8) / 12)));
      ox = Math.round((W - S * 10) / 2); oy = Math.round((H - S * 12) / 2);
      P.forEach((p, i) => { p.hx = ox + SYMBOL_CELLS[i][0] * S; p.hy = oy + SYMBOL_CELLS[i][1] * S; });
    };
    const reseedNoise = () => {
      noise = Array.from({ length: 16 }, (_, i) => ({
        x: Math.floor(Math.random() * Math.ceil(W / S)),
        y: Math.floor(Math.random() * Math.ceil(H / S)),
        c: NOISE_COLORS[i % 3],
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 0.16;
      noise.forEach((n) => { ctx.fillStyle = n.c; ctx.fillRect(n.x * S + (ox % S) + 1, n.y * S + (oy % S) + 1, S - 2, S - 2); });
      ctx.globalAlpha = 1;
      P.forEach((p, i) => { ctx.fillStyle = i === 0 ? ROSE : p.color; ctx.fillRect(Math.round(p.x) + 1, Math.round(p.y) + 1, S - 2, S - 2); });
    };
    const settle = () => P.forEach((p) => { p.x = p.hx; p.y = p.hy; p.vx = 0; p.vy = 0; });

    const step = (now: number) => {
      const dt = lastT ? Math.min(0.033, Math.max(0.001, (now - lastT) / 1000)) : 1 / 60;
      const R = S * 2.3;
      let moving = false;
      lastT = now;
      P.forEach((p) => {
        if (now < p.delay) { moving = true; return; }
        let ax = -STIFFNESS * (p.x - p.hx) - DAMPING * p.vx;
        let ay = -STIFFNESS * (p.y - p.hy) - DAMPING * p.vy;
        const dx = p.x + S / 2 - ptr.x, dy = p.y + S / 2 - ptr.y, d = Math.hypot(dx, dy);
        if (d < R && d > 0.01) {
          const f = 1 - d / R;
          ax += (dx / d) * f * 9000 + ptr.vx * f * 40;
          ay += (dy / d) * f * 9000 + ptr.vy * f * 40;
        }
        p.vx += ax * dt; p.vy += ay * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (Math.abs(p.vx) + Math.abs(p.vy) > 0.6 || Math.abs(p.x - p.hx) + Math.abs(p.y - p.hy) > 0.6) moving = true;
      });
      const decay = Math.pow(0.85, dt * 60);
      ptr.vx *= decay; ptr.vy *= decay;
      draw();
      raf = visible && (moving || Date.now() - ptr.t < 300) ? requestAnimationFrame(step) : 0;
      if (!raf) lastT = 0;
    };
    const kick = () => { if (!raf && !rm.matches && visible) { lastT = 0; raf = requestAnimationFrame(step); } };

    layout(); reseedNoise();
    if (rm.matches) {
      settle();
      if (hintRef.current) hintRef.current.hidden = true;
    } else {
      const t0 = performance.now();
      P.forEach((p, i) => { p.x = Math.random() * W; p.y = Math.random() * H; p.delay = i === 0 ? t0 + 1100 : t0; });
    }
    draw(); kick();

    const noiseTimer = window.setInterval(() => {
      if (rm.matches || document.hidden || !visible) return;
      reseedNoise();
      if (!raf) draw();
    }, 1100);

    const onMove = (e: PointerEvent) => {
      if (rm.matches) return;
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top, now = Date.now();
      const d = Math.max(16, now - ptr.t);
      if (ptr.t) { ptr.vx = ((x - ptr.x) / d) * 16; ptr.vy = ((y - ptr.y) / d) * 16; }
      ptr.x = x; ptr.y = y; ptr.t = now;
      kick();
    };
    const onLeave = () => { ptr.x = -1e4; ptr.y = -1e4; ptr.t = 0; };
    const onResize = () => { layout(); reseedNoise(); if (rm.matches) settle(); draw(); kick(); };
    const onMotionPref = () => {
      if (rm.matches) { if (raf) cancelAnimationFrame(raf); raf = 0; settle(); draw(); }
      if (hintRef.current) hintRef.current.hidden = rm.matches;
    };
    // Off screen, the field stops drawing; it resumes from where it was.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(cv);

    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', onResize);
    rm.addEventListener('change', onMotionPref);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearInterval(noiseTimer);
      io.disconnect();
      cv.removeEventListener('pointermove', onMove);
      cv.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
      rm.removeEventListener('change', onMotionPref);
    };
  }, []);

  return (
    <div className="field">
      <canvas ref={canvasRef} role="img" aria-label={label} />
      <span className="hint" ref={hintRef} aria-hidden="true">
        {hint}
      </span>
    </div>
  );
}
