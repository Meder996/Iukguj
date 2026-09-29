import { Wall } from './maps';
import { Particle } from './types';

// Fast distance check
export function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

// Check circle to box collision
export function circleBoxCollision(
  cx: number,
  cy: number,
  cr: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): { collides: boolean; nx: number; ny: number; overlap: number } {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));

  const dx = cx - closestX;
  const dy = cy - closestY;
  const d2 = dx * dx + dy * dy;

  if (d2 < cr * cr) {
    const d = Math.sqrt(d2);
    if (d === 0) {
      return { collides: true, nx: 1, ny: 0, overlap: cr };
    }
    return {
      collides: true,
      nx: dx / d,
      ny: dy / d,
      overlap: cr - d,
    };
  }
  return { collides: false, nx: 0, ny: 0, overlap: 0 };
}

// Raycast against walls
export function raycast(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  walls: Wall[]
): { hit: boolean; hitX: number; hitY: number; dist: number } {
  let closestDist = Math.hypot(x2 - x1, y2 - y1);
  let hit = false;
  let hitX = x2;
  let hitY = y2;

  const dx = x2 - x1;
  const dy = y2 - y1;

  for (const w of walls) {
    // 4 edges of rectangle
    const edges = [
      { p1: { x: w.x, y: w.y }, p2: { x: w.x + w.w, y: w.y } },
      { p1: { x: w.x + w.w, y: w.y }, p2: { x: w.x + w.w, y: w.y + w.h } },
      { p1: { x: w.x + w.w, y: w.y + w.h }, p2: { x: w.x, y: w.y + w.h } },
      { p1: { x: w.x, y: w.y + w.h }, p2: { x: w.x, y: w.y } },
    ];

    for (const edge of edges) {
      const denom = (y2 - y1) * (edge.p2.x - edge.p1.x) - (x2 - x1) * (edge.p2.y - edge.p1.y);
      if (denom === 0) continue;

      const ua = ((edge.p2.x - edge.p1.x) * (y1 - edge.p1.y) - (edge.p2.y - edge.p1.y) * (x1 - edge.p1.x)) / denom;
      const ub = ((x2 - x1) * (y1 - edge.p1.y) - (y2 - y1) * (x1 - edge.p1.x)) / denom;

      if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        const hx = x1 + ua * dx;
        const hy = y1 + ua * dy;
        const d = Math.hypot(hx - x1, hy - y1);
        if (d < closestDist) {
          closestDist = d;
          hit = true;
          hitX = hx;
          hitY = hy;
        }
      }
    }
  }

  return { hit, hitX, hitY, dist: closestDist };
}

// Line of sight check between two points
export function hasLineOfSight(x1: number, y1: number, x2: number, y2: number, walls: Wall[]): boolean {
  const result = raycast(x1, y1, x2, y2, walls);
  return !result.hit || result.dist >= Math.hypot(x2 - x1, y2 - y1) - 4;
}

// Particle emitters
export function createBloodParticles(x: number, y: number, count: number = 8): Particle[] {
  const p: Particle[] = [];
  const colors = ['#dc2626', '#b91c1c', '#991b1b', '#ef4444', '#7f1d1d'];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 140;
    p.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.35 + Math.random() * 0.4,
      maxLife: 0.75,
      size: 2 + Math.random() * 3.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: 'blood',
    });
  }
  return p;
}

export function createSparks(x: number, y: number, angle: number, count: number = 6): Particle[] {
  const p: Particle[] = [];
  const colors = ['#fbbf24', '#f59e0b', '#fef08a', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const a = angle + (Math.random() - 0.5) * 1.2;
    const speed = 70 + Math.random() * 180;
    p.push({
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0.15 + Math.random() * 0.25,
      maxLife: 0.4,
      size: 1.5 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: 'spark',
    });
  }
  return p;
}

export function createMuzzleFlash(x: number, y: number, angle: number): Particle[] {
  const p: Particle[] = [];
  p.push({
    x: x + Math.cos(angle) * 12,
    y: y + Math.sin(angle) * 12,
    vx: Math.cos(angle) * 30,
    vy: Math.sin(angle) * 30,
    life: 0.05,
    maxLife: 0.05,
    size: 12 + Math.random() * 6,
    color: '#ffedd5',
    type: 'flash',
  });
  // Bullet casing ejecting perpendicular
  const ejectAngle = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.4;
  p.push({
    x,
    y,
    vx: Math.cos(ejectAngle) * (60 + Math.random() * 40),
    vy: Math.sin(ejectAngle) * (60 + Math.random() * 40),
    life: 0.4,
    maxLife: 0.4,
    size: 3,
    color: '#fbbf24',
    type: 'casing',
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 20,
  });
  return p;
}

export function createExplosionParticles(x: number, y: number): Particle[] {
  const p: Particle[] = [];
  const colors = ['#f97316', '#ef4444', '#fbbf24', '#ffffff', '#334155'];
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 320;
    p.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.4 + Math.random() * 0.6,
      maxLife: 1.0,
      size: 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: 'debris',
    });
  }
  return p;
}
