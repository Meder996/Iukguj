import { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { MAPS } from './game/maps';
import { WEAPONS, WeaponDef } from './game/weapons';
import { sounds } from './utils/audio';
import { getHighScores, saveHighScore, HighScoreRecord } from './utils/highscores';
import { StartScreen } from './components/StartScreen';
import { GameHUD } from './components/GameHUD';
import { BuyMenu } from './components/BuyMenu';
import { GameOverModal, HighScoresModal } from './components/GameOverModal';
import { VirtualControls } from './components/VirtualControls';
import { renderGameScene } from './game/renderer';
import { dist, circleBoxCollision, hasLineOfSight, createBloodParticles, createSparks, createMuzzleFlash, createExplosionParticles } from './game/physics';
import { Bot, Bullet, Particle, FloatingText, Grenade, SmokeArea, KillFeedEntry, BombState, Team } from './game/types';

export function App() {
  // Game states: 'start' | 'playing' | 'round_end' | 'game_over'
  const [gameState, setGameState] = useState<'start' | 'playing' | 'game_over'>('start');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isBuyMenuOpen, setIsBuyMenuOpen] = useState<boolean>(false);
  const [isHighScoresOpen, setIsHighScoresOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Selected game config
  const [currentMapId, setCurrentMapId] = useState<string>('dust2');
  const [gameMode, setGameMode] = useState<'competitive' | 'casual' | 'deathmatch'>('competitive');

  // Match / Round statistics
  const [scoreCT, setScoreCT] = useState<number>(0);
  const [scoreT, setScoreT] = useState<number>(0);
  const [roundTime, setRoundTime] = useState<number>(115);
  const [money, setMoney] = useState<number>(800);
  const [kills, setKills] = useState<number>(0);
  const [headshots, setHeadshots] = useState<number>(0);
  const [shotsFired, setShotsFired] = useState<number>(0);
  const [shotsHit, setShotsHit] = useState<number>(0);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [highScores, setHighScores] = useState<HighScoreRecord[]>([]);

  // Mobile detection
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // Ref canvas & state holder for 60fps loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game State Container Ref (to avoid React re-render lag)
  const g = useRef({
    // Player
    p: {
      x: 700,
      y: 200,
      vx: 0,
      vy: 0,
      radius: 14,
      speed: 210,
      angle: 0,
      health: 100,
      armor: 0,
      weapon: WEAPONS.glock,
      ammo: WEAPONS.glock.magazineSize,
      isReloading: false,
      reloadTimer: 0,
      shootCooldown: 0,
      hasGrenade: true,
      hasDefuseKit: true,
    },
    // Movement inputs
    keys: {
      w: false,
      a: false,
      s: false,
      d: false,
      isMouseDown: false,
    },
    // Touch inputs
    touch: {
      moveX: 0,
      moveY: 0,
      aimAngle: 0,
      isAiming: false,
      isFiring: false,
    },
    mousePos: { x: 700, y: 500 },
    // Camera
    camera: { x: 700, y: 200 },
    screenShake: { x: 0, y: 0, trauma: 0 },
    flashDuration: 0,
    // Entities
    bots: [] as Bot[],
    bullets: [] as Bullet[],
    particles: [] as Particle[],
    grenades: [] as Grenade[],
    smokes: [] as SmokeArea[],
    floatingTexts: [] as FloatingText[],
    killFeed: [] as KillFeedEntry[],
    bomb: {
      isPlanted: false,
      isDefused: false,
      isExploded: false,
      x: 0,
      y: 0,
      site: 'A' as 'A' | 'B',
      timer: 40,
      plantProgress: 0,
      defuseProgress: 0,
      planterId: null as string | null,
      defuserId: null as string | null,
    } as BombState,
    nextId: 1,
    lastTime: performance.now(),
    bombBeepTimer: 0,
    roundEnding: false,
    roundEndTimer: 0,
  });

  // State mirror for UI renders
  const [uiPlayer, setUiPlayer] = useState({
    health: 100,
    armor: 0,
    weapon: WEAPONS.glock,
    ammo: 20,
    isReloading: false,
    hasGrenade: true,
  });
  const [uiBomb, setUiBomb] = useState(g.current.bomb);
  const [uiKillFeed, setUiKillFeed] = useState<KillFeedEntry[]>([]);
  const [canInteract, setCanInteract] = useState(false);
  const [interactLabel, setInteractLabel] = useState('');
  const [aliveCT, setAliveCT] = useState(5);
  const [aliveT, setAliveT] = useState(5);

  // Initialize high scores
  useEffect(() => {
    setHighScores(getHighScores());
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, []);

  // Update sound state
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  // Setup round
  const setupRound = useCallback((resetScore: boolean = false) => {
    const currentMap = MAPS[currentMapId] || MAPS.dust2;
    const game = g.current;

    if (resetScore) {
      setScoreCT(0);
      setScoreT(0);
      setKills(0);
      setHeadshots(0);
      setShotsFired(0);
      setShotsHit(0);
      setPlayerScore(0);
      setMoney(800);
      game.p.weapon = WEAPONS.glock;
      game.p.armor = 0;
      game.p.hasGrenade = true;
    }

    setRoundTime(115);
    game.roundEnding = false;
    game.roundEndTimer = 0;

    // Reset Player
    game.p.x = currentMap.ctSpawn.x + (Math.random() - 0.5) * 60;
    game.p.y = currentMap.ctSpawn.y + (Math.random() - 0.5) * 40;
    game.p.vx = 0;
    game.p.vy = 0;
    game.p.health = 100;
    game.p.ammo = game.p.weapon.magazineSize;
    game.p.isReloading = false;
    game.p.reloadTimer = 0;
    game.camera.x = game.p.x;
    game.camera.y = game.p.y;

    // Reset Bomb
    game.bomb = {
      isPlanted: false,
      isDefused: false,
      isExploded: false,
      x: 0,
      y: 0,
      site: 'A',
      timer: 40,
      plantProgress: 0,
      defuseProgress: 0,
      planterId: null,
      defuserId: null,
    };
    setUiBomb(game.bomb);

    // Clear projectiles
    game.bullets = [];
    game.particles = [];
    game.grenades = [];
    game.smokes = [];

    // Create 4 CT bots and 5 T bots
    const newBots: Bot[] = [];
    const ctNames = ['Apex', 'Device', 'ZywOo', 'EliGE'];
    const tNames = ['s1mple', 'NiKo', 'm0NESY', 'b1t', 'twistzz'];

    // CT Teammates
    for (let i = 0; i < 4; i++) {
      newBots.push({
        id: `ct_bot_${i}`,
        name: ctNames[i] || `CT_${i + 1}`,
        team: 'CT',
        x: currentMap.ctSpawn.x + (Math.random() - 0.5) * 120,
        y: currentMap.ctSpawn.y + (Math.random() - 0.5) * 80,
        angle: Math.PI / 2,
        health: 100,
        maxHealth: 100,
        armor: 50,
        weapon: Math.random() > 0.4 ? WEAPONS.m4a4 : WEAPONS.mp9,
        ammo: 30,
        isReloading: false,
        reloadTimer: 0,
        shootCooldown: 0,
        state: 'patrol',
        targetX: Math.random() > 0.5 ? currentMap.bombSites[0].x : currentMap.bombSites[1].x,
        targetY: Math.random() > 0.5 ? currentMap.bombSites[0].y : currentMap.bombSites[1].y,
        stateTimer: 0,
        reactionTimer: 0,
        sightRange: 550,
      });
    }

    // T Enemies
    for (let i = 0; i < 5; i++) {
      newBots.push({
        id: `t_bot_${i}`,
        name: tNames[i] || `T_${i + 1}`,
        team: 'T',
        x: currentMap.tSpawn.x + (Math.random() - 0.5) * 140,
        y: currentMap.tSpawn.y + (Math.random() - 0.5) * 80,
        angle: -Math.PI / 2,
        health: 100,
        maxHealth: 100,
        armor: 50,
        weapon: Math.random() > 0.5 ? WEAPONS.ak47 : Math.random() > 0.5 ? WEAPONS.awp : WEAPONS.deagle,
        ammo: 30,
        isReloading: false,
        reloadTimer: 0,
        shootCooldown: 0,
        state: 'rush',
        targetX: Math.random() > 0.5 ? currentMap.bombSites[0].x : currentMap.bombSites[1].x,
        targetY: Math.random() > 0.5 ? currentMap.bombSites[0].y : currentMap.bombSites[1].y,
        stateTimer: 0,
        reactionTimer: 0,
        sightRange: 550,
      });
    }

    game.bots = newBots;
    setAliveCT(5);
    setAliveT(5);
  }, [currentMapId]);

  // Start new match
  const handleStartGame = (mapId: string, diff: 'casual' | 'competitive' | 'deathmatch') => {
    setCurrentMapId(mapId);
    setGameMode(diff);
    setupRound(true);
    setGameState('playing');
    setIsPaused(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (gameState !== 'playing') return;

      if (key === 'w' || key === 'arrowup') g.current.keys.w = true;
      if (key === 'a' || key === 'arrowleft') g.current.keys.a = true;
      if (key === 's' || key === 'arrowdown') g.current.keys.s = true;
      if (key === 'd' || key === 'arrowright') g.current.keys.d = true;

      // Reload
      if (key === 'r') handleReload();
      // Buy Menu
      if (key === 'b') setIsBuyMenuOpen((prev) => !prev);
      // Grenade
      if (key === 'g') handleThrowGrenade();
      // Interact
      if (key === 'e') handleInteract();
      // Pause
      if (key === 'escape' || key === 'p') {
        if (isBuyMenuOpen) {
          setIsBuyMenuOpen(false);
        } else {
          setIsPaused((prev) => !prev);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') g.current.keys.w = false;
      if (key === 'a' || key === 'arrowleft') g.current.keys.a = false;
      if (key === 's' || key === 'arrowdown') g.current.keys.s = false;
      if (key === 'd' || key === 'arrowright') g.current.keys.d = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseScreenX = e.clientX - rect.left;
      const mouseScreenY = e.clientY - rect.top;

      const worldX = mouseScreenX - rect.width / 2 + g.current.camera.x;
      const worldY = mouseScreenY - rect.height / 2 + g.current.camera.y;

      g.current.mousePos = { x: worldX, y: worldY };
      g.current.p.angle = Math.atan2(worldY - g.current.p.y, worldX - g.current.p.x);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && !isBuyMenuOpen && !isPaused) {
        g.current.keys.isMouseDown = true;
        handleShoot(g.current.p.angle);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) g.current.keys.isMouseDown = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gameState, isBuyMenuOpen, isPaused]);

  // Shoot bullet action
  const handleShoot = useCallback((aimAngle: number) => {
    const p = g.current.p;
    if (p.health <= 0 || p.isReloading) return;
    if (p.shootCooldown > 0) return;

    if (p.ammo <= 0) {
      sounds.playEmpty();
      handleReload();
      return;
    }

    // Consume ammo
    p.ammo -= 1;
    p.shootCooldown = 1 / p.weapon.fireRate;
    setShotsFired((prev) => prev + 1);

    // Play gun audio & trigger screen shake
    sounds.playShoot(p.weapon.category);
    g.current.screenShake.trauma = Math.min(1.0, g.current.screenShake.trauma + p.weapon.recoil * 0.08);

    // Muzzle flash & casing particles
    const muzzles = createMuzzleFlash(p.x, p.y, aimAngle);
    g.current.particles.push(...muzzles);

    // Spawn bullet(s)
    for (let i = 0; i < p.weapon.pellets; i++) {
      const spreadAngle = aimAngle + (Math.random() - 0.5) * p.weapon.spread;
      const speed = p.weapon.bulletSpeed;
      g.current.bullets.push({
        id: g.current.nextId++,
        x: p.x + Math.cos(spreadAngle) * 16,
        y: p.y + Math.sin(spreadAngle) * 16,
        vx: Math.cos(spreadAngle) * speed,
        vy: Math.sin(spreadAngle) * speed,
        damage: p.weapon.damage,
        headshotMultiplier: p.weapon.headshotMultiplier,
        shooterId: 'player',
        shooterTeam: 'CT',
        weaponId: p.weapon.name,
        distanceTraveled: 0,
        maxDistance: p.weapon.range,
        color: '#fde047',
      });
    }

    setUiPlayer((prev) => ({ ...prev, ammo: p.ammo }));
  }, []);

  // Reload action
  const handleReload = () => {
    const p = g.current.p;
    if (p.isReloading || p.ammo === p.weapon.magazineSize || p.weapon.category === 'knife') return;
    p.isReloading = true;
    p.reloadTimer = p.weapon.reloadTime;
    sounds.playReload();
    setUiPlayer((prev) => ({ ...prev, isReloading: true }));
  };

  // Throw frag grenade
  const handleThrowGrenade = () => {
    const p = g.current.p;
    if (!p.hasGrenade || p.health <= 0) return;
    p.hasGrenade = false;

    const angle = p.angle;
    const throwSpeed = 450;
    g.current.grenades.push({
      id: g.current.nextId++,
      x: p.x,
      y: p.y,
      vx: Math.cos(angle) * throwSpeed,
      vy: Math.sin(angle) * throwSpeed,
      timer: 1.8,
      type: 'he',
      ownerTeam: 'CT',
    });

    setUiPlayer((prev) => ({ ...prev, hasGrenade: false }));
  };

  // Interact (Defuse bomb or plant)
  const handleInteract = () => {
    const currentMap = MAPS[currentMapId] || MAPS.dust2;
    const game = g.current;

    // If bomb is planted, CT can defuse
    if (game.bomb.isPlanted && !game.bomb.isDefused) {
      if (dist(game.p.x, game.p.y, game.bomb.x, game.bomb.y) < 70) {
        game.bomb.defuseProgress += 0.35;
        if (game.bomb.defuseProgress >= 1) {
          game.bomb.isDefused = true;
          sounds.playRadio('defused');
          sounds.playKill();
          // Add reward
          setMoney((prev) => prev + 1200);
          setPlayerScore((prev) => prev + 300);
          endRound('CT', 'Bomb Defused!');
        }
      }
    } else {
      // Plant bomb at site
      for (const site of currentMap.bombSites) {
        if (dist(game.p.x, game.p.y, site.x, site.y) < site.radius) {
          // In casual deathmatch CT can also test plant
          game.bomb.isPlanted = true;
          game.bomb.site = site.id;
          game.bomb.x = game.p.x;
          game.bomb.y = game.p.y;
          game.bomb.timer = 40;
          sounds.playRadio('planted');
          break;
        }
      }
    }
  };

  // Buy actions
  const handleBuyWeapon = (weapon: WeaponDef) => {
    if (money >= weapon.price) {
      setMoney((m) => m - weapon.price);
      g.current.p.weapon = weapon;
      g.current.p.ammo = weapon.magazineSize;
      g.current.p.isReloading = false;
      setUiPlayer((prev) => ({
        ...prev,
        weapon,
        ammo: weapon.magazineSize,
        isReloading: false,
      }));
    }
  };

  const handleBuyArmor = () => {
    if (money >= 650) {
      setMoney((m) => m - 650);
      g.current.p.armor = 100;
      setUiPlayer((prev) => ({ ...prev, armor: 100 }));
    }
  };

  const handleBuyGrenade = () => {
    if (money >= 300) {
      setMoney((m) => m - 300);
      g.current.p.hasGrenade = true;
      setUiPlayer((prev) => ({ ...prev, hasGrenade: true }));
    }
  };

  // Round completion logic
  const endRound = (winner: Team, reason: string) => {
    if (g.current.roundEnding) return;
    g.current.roundEnding = true;
    g.current.roundEndTimer = 3.5;

    g.current.floatingTexts.push({
      id: g.current.nextId++,
      x: g.current.p.x - 70,
      y: g.current.p.y - 45,
      text: `${winner === 'CT' ? 'CTs WIN' : 'Ts WIN'} - ${reason}`,
      color: winner === 'CT' ? '#38bdf8' : '#f97316',
      life: 3.5,
      maxLife: 3.5,
      size: 20,
    });

    if (winner === 'CT') {
      sounds.playRadio('won');
      setScoreCT((s) => {
        const nextCT = s + 1;
        if (nextCT >= 5 && gameMode === 'competitive') {
          // Trigger match victory
          setTimeout(() => triggerGameOver(true), 2500);
        }
        return nextCT;
      });
      setMoney((m) => m + 3250);
      setPlayerScore((ps) => ps + 250);
    } else {
      sounds.playRadio('lost');
      setScoreT((s) => {
        const nextT = s + 1;
        if (nextT >= 5 && gameMode === 'competitive') {
          setTimeout(() => triggerGameOver(false), 2500);
        }
        return nextT;
      });
      setMoney((m) => m + 1900);
    }
  };

  // Game over state
  const triggerGameOver = (isVictory: boolean) => {
    setGameState('game_over');
    if (isVictory) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    const updated = saveHighScore({
      name: 'Agent_Player',
      score: playerScore + (isVictory ? 1000 : 0),
      kills,
      headshots,
      roundsWon: isVictory ? scoreCT + 1 : scoreCT,
    });
    setHighScores(updated);
  };

  // Main 60FPS Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;
    g.current.lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.1, (time - g.current.lastTime) / 1000);
      g.current.lastTime = time;

      if (!isPaused) {
        updateGame(dt);
      }

      renderGame();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, isPaused, currentMapId, handleShoot]);

  // Update game state per tick
  const updateGame = (dt: number) => {
    const game = g.current;
    const currentMap = MAPS[currentMapId] || MAPS.dust2;
    const p = game.p;

    // Round countdown
    if (!game.roundEnding) {
      setRoundTime((t) => {
        const nextT = t - dt;
        if (nextT <= 0) {
          // Time expired, CT wins if bomb not planted
          if (!game.bomb.isPlanted) {
            endRound('CT', 'Time Expired');
          }
          return 0;
        }
        return nextT;
      });
    } else {
      game.roundEndTimer -= dt;
      if (game.roundEndTimer <= 0) {
        setupRound(false);
      }
    }

    // Screen Shake decay
    if (game.screenShake.trauma > 0) {
      game.screenShake.trauma = Math.max(0, game.screenShake.trauma - dt * 2.5);
      const shakeAmount = game.screenShake.trauma * game.screenShake.trauma * 14;
      game.screenShake.x = (Math.random() - 0.5) * shakeAmount;
      game.screenShake.y = (Math.random() - 0.5) * shakeAmount;
    } else {
      game.screenShake.x = 0;
      game.screenShake.y = 0;
    }

    // Flashbang fade
    if (game.flashDuration > 0) {
      game.flashDuration = Math.max(0, game.flashDuration - dt);
    }

    // Player reload timer
    if (p.isReloading) {
      p.reloadTimer -= dt;
      if (p.reloadTimer <= 0) {
        p.isReloading = false;
        p.ammo = p.weapon.magazineSize;
        setUiPlayer((prev) => ({ ...prev, isReloading: false, ammo: p.ammo }));
      }
    }

    // Player shoot cooldown
    if (p.shootCooldown > 0) {
      p.shootCooldown -= dt;
    }

    // Automatic fire holding mouse or touch
    if ((game.keys.isMouseDown || game.touch.isFiring) && p.weapon.isAutomatic) {
      handleShoot(p.angle);
    }

    // Player Movement (Keyboard or Virtual Stick)
    let moveX = 0;
    let moveY = 0;
    if (game.keys.w) moveY -= 1;
    if (game.keys.s) moveY += 1;
    if (game.keys.a) moveX -= 1;
    if (game.keys.d) moveX += 1;

    // Apply virtual joystick if active
    if (game.touch.moveX !== 0 || game.touch.moveY !== 0) {
      moveX = game.touch.moveX;
      moveY = game.touch.moveY;
    }

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      const spd = p.speed * (p.isReloading ? 0.8 : 1);
      const targetVx = (moveX / len) * spd;
      const targetVy = (moveY / len) * spd;

      p.vx += (targetVx - p.vx) * 14 * dt;
      p.vy += (targetVy - p.vy) * 14 * dt;
    } else {
      p.vx *= Math.pow(0.01, dt);
      p.vy *= Math.pow(0.01, dt);
    }

    // Apply player velocity & collision with map walls
    if (p.health > 0) {
      p.x += p.vx * dt;
      for (const w of currentMap.walls) {
        const col = circleBoxCollision(p.x, p.y, p.radius, w.x, w.y, w.w, w.h);
        if (col.collides) {
          p.x += col.nx * col.overlap;
        }
      }

      p.y += p.vy * dt;
      for (const w of currentMap.walls) {
        const col = circleBoxCollision(p.x, p.y, p.radius, w.x, w.y, w.w, w.h);
        if (col.collides) {
          p.y += col.ny * col.overlap;
        }
      }
    }

    // Camera smoothly follows player
    game.camera.x += (p.x - game.camera.x) * 8 * dt;
    game.camera.y += (p.y - game.camera.y) * 8 * dt;

    // Bomb planted logic & beeping
    if (game.bomb.isPlanted && !game.bomb.isDefused && !game.bomb.isExploded) {
      game.bomb.timer -= dt;
      game.bombBeepTimer -= dt;

      const beepInterval = Math.max(0.12, (game.bomb.timer / 40) * 0.9);
      if (game.bombBeepTimer <= 0) {
        sounds.playBombBeep(40 / Math.max(1, game.bomb.timer));
        game.bombBeepTimer = beepInterval;
      }

      if (game.bomb.timer <= 0) {
        game.bomb.isExploded = true;
        sounds.playExplosion();
        game.screenShake.trauma = 1.0;
        game.particles.push(...createExplosionParticles(game.bomb.x, game.bomb.y));

        // Damage everyone near bomb
        const boomD = dist(p.x, p.y, game.bomb.x, game.bomb.y);
        if (boomD < 400) {
          p.health = 0;
          setUiPlayer((prev) => ({ ...prev, health: 0 }));
        }
        for (const b of game.bots) {
          if (dist(b.x, b.y, game.bomb.x, game.bomb.y) < 400) {
            b.health = 0;
          }
        }

        endRound('T', 'C4 Detonated!');
      }

      setUiBomb({ ...game.bomb });
    }

    // Check interaction prompt
    if (game.bomb.isPlanted && !game.bomb.isDefused && dist(p.x, p.y, game.bomb.x, game.bomb.y) < 80) {
      setCanInteract(true);
      setInteractLabel('Defuse Bomb');
    } else {
      let atSite = false;
      for (const s of currentMap.bombSites) {
        if (dist(p.x, p.y, s.x, s.y) < s.radius && !game.bomb.isPlanted) {
          atSite = true;
          setCanInteract(true);
          setInteractLabel(`Plant C4 (Site ${s.id})`);
          break;
        }
      }
      if (!atSite) setCanInteract(false);
    }

    // Update Bots AI
    let aliveCTCount = p.health > 0 ? 1 : 0;
    let aliveTCount = 0;

    for (const bot of game.bots) {
      if (bot.health <= 0) continue;
      if (bot.team === 'CT') aliveCTCount++;
      if (bot.team === 'T') aliveTCount++;

      bot.stateTimer -= dt;
      bot.shootCooldown -= dt;

      // Find nearest enemy
      let nearestDist = Infinity;
      let targetX = 0;
      let targetY = 0;
      let hasTarget = false;

      // CT bot checks T bots
      // T bot checks Player + CT bots
      const potentialTargets = bot.team === 'CT'
        ? game.bots.filter((b) => b.team === 'T' && b.health > 0)
        : [
            ...(p.health > 0 ? [{ x: p.x, y: p.y, health: p.health, id: 'player' }] : []),
            ...game.bots.filter((b) => b.team === 'CT' && b.health > 0),
          ];

      for (const enemy of potentialTargets) {
        const d = dist(bot.x, bot.y, enemy.x, enemy.y);
        if (d < bot.sightRange && d < nearestDist) {
          // Check line of sight
          if (hasLineOfSight(bot.x, bot.y, enemy.x, enemy.y, currentMap.walls)) {
            nearestDist = d;
            targetX = enemy.x;
            targetY = enemy.y;
            hasTarget = true;
          }
        }
      }

      // Behavior decision
      if (hasTarget) {
        bot.state = 'attack';
        const desiredAngle = Math.atan2(targetY - bot.y, targetX - bot.x);
        bot.angle = desiredAngle;

        // Bot fires
        if (bot.shootCooldown <= 0 && !bot.isReloading) {
          if (bot.ammo > 0) {
            bot.ammo--;
            bot.shootCooldown = 1 / bot.weapon.fireRate + Math.random() * 0.12;

            // Spawn bot bullet
            const spread = bot.weapon.spread * 1.5;
            const bulletAngle = bot.angle + (Math.random() - 0.5) * spread;
            game.bullets.push({
              id: game.nextId++,
              x: bot.x + Math.cos(bulletAngle) * 14,
              y: bot.y + Math.sin(bulletAngle) * 14,
              vx: Math.cos(bulletAngle) * bot.weapon.bulletSpeed,
              vy: Math.sin(bulletAngle) * bot.weapon.bulletSpeed,
              damage: bot.weapon.damage,
              headshotMultiplier: bot.weapon.headshotMultiplier,
              shooterId: bot.id,
              shooterTeam: bot.team,
              weaponId: bot.weapon.name,
              distanceTraveled: 0,
              maxDistance: bot.weapon.range,
              color: bot.team === 'CT' ? '#38bdf8' : '#f97316',
            });

            // Occasional sound attenuation
            if (dist(bot.x, bot.y, p.x, p.y) < 700) {
              sounds.playShoot(bot.weapon.category);
            }
          } else {
            bot.isReloading = true;
            bot.reloadTimer = bot.weapon.reloadTime;
          }
        }
      } else {
        // Objective logic
        if (bot.team === 'T' && !game.bomb.isPlanted) {
          // T bot plants bomb if at site
          const siteA = currentMap.bombSites[0];
          const siteB = currentMap.bombSites[1];
          const chosenSite = dist(bot.x, bot.y, siteA.x, siteA.y) < dist(bot.x, bot.y, siteB.x, siteB.y) ? siteA : siteB;

          if (dist(bot.x, bot.y, chosenSite.x, chosenSite.y) < chosenSite.radius) {
            game.bomb.isPlanted = true;
            game.bomb.site = chosenSite.id;
            game.bomb.x = bot.x;
            game.bomb.y = bot.y;
            game.bomb.timer = 40;
            sounds.playRadio('planted');
          } else {
            targetX = chosenSite.x;
            targetY = chosenSite.y;
            bot.angle = Math.atan2(targetY - bot.y, targetX - bot.x);
          }
        } else if (bot.team === 'CT' && game.bomb.isPlanted && !game.bomb.isDefused) {
          // CT bot rushes to defuse bomb
          targetX = game.bomb.x;
          targetY = game.bomb.y;
          bot.angle = Math.atan2(targetY - bot.y, targetX - bot.x);

          if (dist(bot.x, bot.y, game.bomb.x, game.bomb.y) < 60) {
            game.bomb.defuseProgress += dt * 0.25;
            if (game.bomb.defuseProgress >= 1) {
              game.bomb.isDefused = true;
              sounds.playRadio('defused');
              endRound('CT', 'Bomb Defused by Teammate');
            }
          }
        } else {
          // Patrol
          if (bot.stateTimer <= 0) {
            bot.stateTimer = 3 + Math.random() * 4;
            bot.targetX = bot.x + (Math.random() - 0.5) * 350;
            bot.targetY = bot.y + (Math.random() - 0.5) * 350;
          }
          targetX = bot.targetX;
          targetY = bot.targetY;
          bot.angle = Math.atan2(targetY - bot.y, targetX - bot.x);
        }
      }

      // Move bot forward
      const bSpeed = bot.state === 'attack' ? 70 : 130;
      bot.x += Math.cos(bot.angle) * bSpeed * dt;
      bot.y += Math.sin(bot.angle) * bSpeed * dt;

      // Bot Wall Collisions
      for (const w of currentMap.walls) {
        const col = circleBoxCollision(bot.x, bot.y, 14, w.x, w.y, w.w, w.h);
        if (col.collides) {
          bot.x += col.nx * col.overlap;
          bot.y += col.ny * col.overlap;
        }
      }

      // Bot reload check
      if (bot.isReloading) {
        bot.reloadTimer -= dt;
        if (bot.reloadTimer <= 0) {
          bot.isReloading = false;
          bot.ammo = bot.weapon.magazineSize;
        }
      }
    }

    setAliveCT(aliveCTCount);
    setAliveT(aliveTCount);

    // Check round end by team wipeout
    if (!game.roundEnding) {
      if (aliveTCount === 0 && !game.bomb.isPlanted) {
        endRound('CT', 'Terrorists Neutralized');
      } else if (aliveCTCount === 0 && (game.bomb.isPlanted || aliveTCount > 0)) {
        endRound('T', 'Counter-Terrorists Eliminated');
      }
    }

    // Update Bullets & Collisions
    for (let i = game.bullets.length - 1; i >= 0; i--) {
      const b = game.bullets[i];
      const stepDist = Math.hypot(b.vx, b.vy) * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.distanceTraveled += stepDist;

      // Bullet range exceeded
      if (b.distanceTraveled >= b.maxDistance) {
        game.bullets.splice(i, 1);
        continue;
      }

      // Wall hit check
      let hitWall = false;
      for (const w of currentMap.walls) {
        if (b.x >= w.x && b.x <= w.x + w.w && b.y >= w.y && b.y <= w.y + w.h) {
          hitWall = true;
          // Spark particles
          const sparkAngle = Math.atan2(-b.vy, -b.vx);
          game.particles.push(...createSparks(b.x, b.y, sparkAngle, 5));
          break;
        }
      }
      if (hitWall) {
        game.bullets.splice(i, 1);
        continue;
      }

      // Hit Player (if bullet from T)
      if (b.shooterTeam === 'T' && p.health > 0) {
        if (dist(b.x, b.y, p.x, p.y) < p.radius) {
          // Player hit!
          sounds.playHit(false);
          sounds.playHurt();
          game.screenShake.trauma = Math.min(1.0, game.screenShake.trauma + 0.35);

          const dmg = Math.round(b.damage * (p.armor > 0 ? 0.65 : 1));
          p.health = Math.max(0, p.health - dmg);
          if (p.armor > 0) p.armor = Math.max(0, p.armor - 12);
          setUiPlayer((prev) => ({ ...prev, health: p.health, armor: p.armor }));

          game.particles.push(...createBloodParticles(p.x, p.y, 8));

          if (p.health <= 0) {
            sounds.playKill();
            recordKillFeed(b.shooterId, 'T', 'YOU', 'CT', b.weaponId, false);
          }

          game.bullets.splice(i, 1);
          continue;
        }
      }

      // Hit Bots
      let botHit = false;
      for (const bot of game.bots) {
        if (bot.health <= 0 || bot.team === b.shooterTeam) continue;

        if (dist(b.x, b.y, bot.x, bot.y) < 14) {
          botHit = true;
          const isHeadshot = Math.random() < 0.28 || b.weaponId === 'AWP Sniper' || b.weaponId === 'Desert Eagle';
          const multiplier = isHeadshot ? b.headshotMultiplier : 1;
          const totalDmg = Math.round(b.damage * multiplier);

          bot.health = Math.max(0, bot.health - totalDmg);
          game.particles.push(...createBloodParticles(bot.x, bot.y, isHeadshot ? 14 : 7));

          // Damage floating number
          game.floatingTexts.push({
            id: game.nextId++,
            x: bot.x,
            y: bot.y - 15,
            text: `-${totalDmg}${isHeadshot ? ' HS!' : ''}`,
            color: isHeadshot ? '#ef4444' : '#fbbf24',
            life: 0.8,
            maxLife: 0.8,
            size: isHeadshot ? 16 : 13,
          });

          if (b.shooterId === 'player') {
            sounds.playHit(isHeadshot);
            setShotsHit((prev) => prev + 1);
            setPlayerScore((prev) => prev + (isHeadshot ? 150 : 80));

            if (bot.health <= 0) {
              sounds.playKill();
              setKills((prev) => prev + 1);
              if (isHeadshot) setHeadshots((prev) => prev + 1);
              setMoney((m) => m + 300);
              recordKillFeed('YOU', 'CT', bot.name, bot.team, b.weaponId, isHeadshot);
            }
          }

          break;
        }
      }

      if (botHit) {
        game.bullets.splice(i, 1);
        continue;
      }
    }

    // Update Grenades
    for (let i = game.grenades.length - 1; i >= 0; i--) {
      const gObj = game.grenades[i];
      gObj.x += gObj.vx * dt;
      gObj.y += gObj.vy * dt;
      gObj.vx *= Math.pow(0.5, dt);
      gObj.vy *= Math.pow(0.5, dt);
      gObj.timer -= dt;

      // Grenade Bounce off walls
      for (const w of currentMap.walls) {
        const col = circleBoxCollision(gObj.x, gObj.y, 6, w.x, w.y, w.w, w.h);
        if (col.collides) {
          gObj.vx = -gObj.vx * 0.6;
          gObj.vy = -gObj.vy * 0.6;
          gObj.x += col.nx * col.overlap;
          gObj.y += col.ny * col.overlap;
        }
      }

      if (gObj.timer <= 0) {
        sounds.playExplosion();
        game.screenShake.trauma = 0.8;
        game.particles.push(...createExplosionParticles(gObj.x, gObj.y));

        // Damage radius
        const blastRadius = 180;
        // Player damage
        const pd = dist(gObj.x, gObj.y, p.x, p.y);
        if (pd < blastRadius) {
          const dmg = Math.round((1 - pd / blastRadius) * 85);
          p.health = Math.max(0, p.health - dmg);
          setUiPlayer((prev) => ({ ...prev, health: p.health }));
        }
        // Bots damage
        for (const bot of game.bots) {
          const bd = dist(gObj.x, gObj.y, bot.x, bot.y);
          if (bd < blastRadius && bot.health > 0) {
            const dmg = Math.round((1 - bd / blastRadius) * 95);
            bot.health = Math.max(0, bot.health - dmg);
            if (bot.health <= 0 && gObj.ownerTeam === 'CT') {
              setKills((prev) => prev + 1);
              setPlayerScore((prev) => prev + 200);
              recordKillFeed('YOU', 'CT', bot.name, bot.team, 'HE Grenade', false);
            }
          }
        }

        game.grenades.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = game.particles.length - 1; i >= 0; i--) {
      const part = game.particles[i];
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.life -= dt;
      if (part.rotSpeed && part.rotation !== undefined) {
        part.rotation += part.rotSpeed * dt;
      }
      if (part.life <= 0) {
        game.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = game.floatingTexts.length - 1; i >= 0; i--) {
      const ft = game.floatingTexts[i];
      ft.y -= 25 * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        game.floatingTexts.splice(i, 1);
      }
    }
  };

  const recordKillFeed = (
    killer: string,
    killerTeam: Team,
    victim: string,
    victimTeam: Team,
    weapon: string,
    isHeadshot: boolean
  ) => {
    const entry: KillFeedEntry = {
      id: g.current.nextId++,
      killer,
      killerTeam,
      victim,
      victimTeam,
      weapon,
      isHeadshot,
      timestamp: Date.now(),
    };
    g.current.killFeed.push(entry);
    setUiKillFeed([...g.current.killFeed]);
  };

  // Render pipeline
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI resize
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const currentMap = MAPS[currentMapId] || MAPS.dust2;
    const game = g.current;

    renderGameScene(
      ctx,
      canvas.width,
      canvas.height,
      game.camera.x,
      game.camera.y,
      currentMap.walls,
      currentMap.width,
      currentMap.height,
      currentMap.bombSites,
      currentMap.coverProps,
      {
        x: game.p.x,
        y: game.p.y,
        angle: game.p.angle,
        health: game.p.health,
        armor: game.p.armor,
        isReloading: game.p.isReloading,
        weaponColor: game.p.weapon.color,
        weaponCategory: game.p.weapon.category,
      },
      game.bots,
      game.bullets,
      game.particles,
      game.grenades,
      game.smokes,
      game.floatingTexts,
      game.bomb,
      game.screenShake,
      game.flashDuration
    );
  };

  const accuracyPct = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      
      {/* 2D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Start / Mode Selection Screen */}
      {gameState === 'start' && (
        <StartScreen
          onStart={handleStartGame}
          onOpenScores={() => setIsHighScoresOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* In-game HUD */}
      {gameState === 'playing' && (
        <GameHUD
          health={uiPlayer.health}
          armor={uiPlayer.armor}
          money={money}
          weapon={uiPlayer.weapon}
          ammo={uiPlayer.ammo}
          isReloading={uiPlayer.isReloading}
          scoreCT={scoreCT}
          scoreT={scoreT}
          roundTime={roundTime}
          bombState={uiBomb}
          killFeed={uiKillFeed}
          onOpenBuy={() => setIsBuyMenuOpen(true)}
          onReload={handleReload}
          onThrowGrenade={handleThrowGrenade}
          hasGrenade={uiPlayer.hasGrenade}
          onInteract={handleInteract}
          canInteract={canInteract}
          interactLabel={interactLabel}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused((p) => !p)}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          gameMode={gameMode}
          aliveCT={aliveCT}
          aliveT={aliveT}
        />
      )}

      {/* Mobile Touch Joysticks & Aim Pad */}
      {gameState === 'playing' && isTouchDevice && (
        <VirtualControls
          onMoveChange={(mx, my) => {
            g.current.touch.moveX = mx;
            g.current.touch.moveY = my;
          }}
          onAimChange={(angle) => {
            g.current.touch.aimAngle = angle;
            g.current.p.angle = angle;
          }}
          onFireChange={(isFiring) => {
            g.current.touch.isFiring = isFiring;
            if (isFiring && !g.current.p.weapon.isAutomatic) {
              handleShoot(g.current.p.angle);
            }
          }}
          onReload={handleReload}
          onGrenade={handleThrowGrenade}
          hasGrenade={uiPlayer.hasGrenade}
          onInteract={handleInteract}
          canInteract={canInteract}
        />
      )}

      {/* Buy Menu Modal */}
      <BuyMenu
        isOpen={isBuyMenuOpen}
        onClose={() => setIsBuyMenuOpen(false)}
        money={money}
        currentWeapon={uiPlayer.weapon}
        onBuyWeapon={handleBuyWeapon}
        hasArmor={uiPlayer.armor >= 100}
        onBuyArmor={handleBuyArmor}
        hasGrenade={uiPlayer.hasGrenade}
        onBuyGrenade={handleBuyGrenade}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={gameState === 'game_over'}
        isVictory={scoreCT >= scoreT}
        roundScoreCT={scoreCT}
        roundScoreT={scoreT}
        playerScore={playerScore}
        kills={kills}
        headshots={headshots}
        accuracy={accuracyPct}
        onRestart={() => handleStartGame(currentMapId, gameMode)}
        onViewHighScores={() => setIsHighScoresOpen(true)}
        highScores={highScores}
      />

      {/* Hall of Fame / High Scores Modal */}
      <HighScoresModal
        isOpen={isHighScoresOpen}
        onClose={() => setIsHighScoresOpen(false)}
        scores={highScores}
      />
    </div>
  );
}
export default App;
