import { Wall, BombSite } from './maps';
import { Bullet, Particle, Bot, FloatingText, Grenade, SmokeArea } from './types';

// Render the entire retro 2D CS battlefield
export function renderGameScene(
  ctx: CanvasRenderingContext2D,
  viewWidth: number,
  viewHeight: number,
  cameraX: number,
  cameraY: number,
  mapWalls: Wall[],
  mapWidth: number,
  mapHeight: number,
  bombSites: BombSite[],
  coverProps: { x: number; y: number; r: number; color: string }[],
  player: {
    x: number;
    y: number;
    angle: number;
    health: number;
    armor: number;
    isReloading: boolean;
    weaponColor: string;
    weaponCategory: string;
  },
  bots: Bot[],
  bullets: Bullet[],
  particles: Particle[],
  grenades: Grenade[],
  smokes: SmokeArea[],
  floatingTexts: FloatingText[],
  bomb: { isPlanted: boolean; x: number; y: number; timer: number; site: 'A' | 'B' },
  screenShake: { x: number; y: number },
  flashDuration: number
) {
  ctx.save();

  // Screen shake translation
  ctx.translate(screenShake.x, screenShake.y);

  // Background map floor
  ctx.fillStyle = '#1e1c18'; // Dust2 warm sand/stone floor
  ctx.fillRect(0, 0, viewWidth, viewHeight);

  // Camera translation
  const offsetX = viewWidth / 2 - cameraX;
  const offsetY = viewHeight / 2 - cameraY;

  ctx.save();
  ctx.translate(offsetX, offsetY);

  // Draw ground tiles / grid
  ctx.strokeStyle = '#27231c';
  ctx.lineWidth = 1;
  const tileSize = 64;
  const startX = Math.floor(Math.max(0, cameraX - viewWidth / 2) / tileSize) * tileSize;
  const endX = Math.min(mapWidth, cameraX + viewWidth / 2 + tileSize);
  const startY = Math.floor(Math.max(0, cameraY - viewHeight / 2) / tileSize) * tileSize;
  const endY = Math.min(mapHeight, cameraY + viewHeight / 2 + tileSize);

  for (let x = startX; x <= endX; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, mapHeight);
    ctx.stroke();
  }
  for (let y = startY; y <= endY; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(mapWidth, y);
    ctx.stroke();
  }

  // Draw Bomb Sites
  for (const site of bombSites) {
    // Zone circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(site.x, site.y, site.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(234, 88, 12, 0.12)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)';
    ctx.setLineDash([8, 6]);
    ctx.stroke();

    // Site letter indicator
    ctx.fillStyle = 'rgba(249, 115, 22, 0.4)';
    ctx.font = 'bold 36px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(site.id, site.x, site.y);
    ctx.restore();
  }

  // Draw Bomb if planted
  if (bomb.isPlanted) {
    ctx.save();
    ctx.translate(bomb.x, bomb.y);
    // Beep halo
    const pulse = (Date.now() % 600) / 600;
    ctx.beginPath();
    ctx.arc(0, 0, 16 + pulse * 12, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(239, 68, 68, ${0.4 * (1 - pulse)})`;
    ctx.fill();

    // C4 backpack body
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-10, -8, 20, 16);
    // Yellow wire
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(6, -4);
    ctx.stroke();
    // Red blinking LED
    ctx.fillStyle = pulse < 0.5 ? '#ef4444' : '#7f1d1d';
    ctx.fillRect(2, 2, 4, 4);
    ctx.restore();
  }

  // Draw Map Walls & Obstacles
  for (const wall of mapWalls) {
    if (wall.type === 'crate') {
      // Wood crate texture
      ctx.fillStyle = '#78350f';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
      // X pattern on crate
      ctx.beginPath();
      ctx.moveTo(wall.x, wall.y);
      ctx.lineTo(wall.x + wall.w, wall.y + wall.h);
      ctx.moveTo(wall.x + wall.w, wall.y);
      ctx.lineTo(wall.x, wall.y + wall.h);
      ctx.stroke();
    } else if (wall.type === 'sandbag') {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = '#d97706';
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
    } else if (wall.type === 'metal') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
    } else {
      // Standard Brick Wall
      ctx.fillStyle = '#292524';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 2;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);

      // Top highlighted 3D rim
      ctx.fillStyle = '#3f3935';
      ctx.fillRect(wall.x + 2, wall.y + 2, wall.w - 4, 4);
    }
  }

  // Draw Props (Barrels)
  for (const prop of coverProps) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(prop.x, prop.y, prop.r, 0, Math.PI * 2);
    ctx.fillStyle = prop.color;
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Inner ring
    ctx.beginPath();
    ctx.arc(prop.x, prop.y, prop.r * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Draw Bullets / Tracers
  for (const b of bullets) {
    ctx.save();
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const len = 14;
    const vLen = Math.hypot(b.vx, b.vy);
    const dirX = b.vx / vLen;
    const dirY = b.vy / vLen;
    ctx.moveTo(b.x - dirX * len, b.y - dirY * len);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }

  // Draw Grenades
  for (const g of grenades) {
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#14532d';
    ctx.stroke();
    // Pin indicator
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-1, -7, 2, 3);
    ctx.restore();
  }

  // Draw Smokes
  for (const s of smokes) {
    ctx.save();
    const alpha = (s.life / s.maxLife) * 0.85;
    ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
    // Smoke core
    ctx.fillStyle = `rgba(203, 213, 225, ${alpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Bots
  for (const bot of bots) {
    if (bot.health <= 0) continue;
    drawCharacter(
      ctx,
      bot.x,
      bot.y,
      bot.angle,
      bot.team === 'CT' ? '#38bdf8' : '#f97316',
      bot.weapon.color,
      bot.weapon.category,
      bot.name,
      bot.health,
      bot.maxHealth,
      bot.isReloading,
      false
    );
  }

  // Draw Player (CT)
  if (player.health > 0) {
    drawCharacter(
      ctx,
      player.x,
      player.y,
      player.angle,
      '#06b6d4', // Distinct Player Cyan
      player.weaponColor,
      player.weaponCategory,
      'YOU (CT)',
      player.health,
      100,
      player.isReloading,
      true
    );
  }

  // Draw Particles (Blood, Sparks, Casings)
  for (const p of particles) {
    ctx.save();
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = p.color;

    if (p.type === 'casing') {
      ctx.translate(p.x, p.y);
      if (p.rotation) ctx.rotate(p.rotation);
      ctx.fillRect(-2, -1, 4, 2);
    } else if (p.type === 'flash') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Floating Damage / Kill Texts
  for (const ft of floatingTexts) {
    ctx.save();
    const alpha = ft.life / ft.maxLife;
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${ft.size || 14}px "Chakra Petch", monospace`;
    ctx.fillStyle = ft.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore(); // Restore camera translation

  // Flashbang Blind effect
  if (flashDuration > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, flashDuration / 1.5)})`;
    ctx.fillRect(0, 0, viewWidth, viewHeight);
  }

  // Vignette overlay around screen
  const gradient = ctx.createRadialGradient(
    viewWidth / 2,
    viewHeight / 2,
    viewWidth * 0.35,
    viewWidth / 2,
    viewHeight / 2,
    viewWidth * 0.75
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, viewWidth, viewHeight);

  // Red damage border flash if low health
  if (player.health < 35 && player.health > 0) {
    const pulse = (Math.sin(Date.now() / 150) + 1) / 2;
    ctx.fillStyle = `rgba(220, 38, 38, ${0.2 * pulse})`;
    ctx.fillRect(0, 0, viewWidth, viewHeight);
  }

  ctx.restore(); // Restore screen shake
}

// Helper to draw top-down pixel soldier
function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  uniformColor: string,
  weaponColor: string,
  weaponCat: string,
  label: string,
  health: number,
  maxHealth: number,
  isReloading: boolean,
  isPlayer: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  // Health bar above head
  ctx.save();
  const barW = 32;
  const barH = 4;
  const barY = -24;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-barW / 2, barY, barW, barH);
  ctx.fillStyle = health > 30 ? '#22c55e' : '#ef4444';
  ctx.fillRect(-barW / 2, barY, (health / maxHealth) * barW, barH);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeRect(-barW / 2, barY, barW, barH);

  // Name tag
  ctx.font = 'bold 9px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = isPlayer ? '#67e8f9' : '#e2e8f0';
  ctx.fillText(label, 0, barY - 4);
  ctx.restore();

  // Rotate soldier to aim angle
  ctx.rotate(angle);

  // Shadow
  ctx.beginPath();
  ctx.arc(1, 2, 14, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();

  // Hands & Shoulders
  ctx.fillStyle = uniformColor;
  // Left shoulder / arm
  ctx.beginPath();
  ctx.arc(8, -10, 5, 0, Math.PI * 2);
  ctx.fill();
  // Right shoulder / arm
  ctx.beginPath();
  ctx.arc(8, 10, 5, 0, Math.PI * 2);
  ctx.fill();

  // Torso / Vest
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#1e293b'; // Tactical vest
  ctx.fill();
  ctx.strokeStyle = uniformColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Helmet / Head
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = uniformColor;
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Goggles / Visor forward indicator
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(4, -3, 3, 6);

  // Weapon barrel held in hands
  ctx.fillStyle = weaponColor;
  const gunLength = weaponCat === 'awp' ? 24 : weaponCat === 'rifle' ? 18 : weaponCat === 'knife' ? 8 : 12;
  const gunWidth = weaponCat === 'shotgun' ? 5 : 3.5;

  ctx.fillRect(10, -gunWidth / 2, gunLength, gunWidth);

  // Suppressor or barrel tip
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(10 + gunLength - 3, -gunWidth / 2 - 0.5, 3, gunWidth + 1);

  // Reloading indicator
  if (isReloading) {
    ctx.rotate(-angle); // keep icon upright
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('RELOAD', 16, 0);
  }

  ctx.restore();
}
