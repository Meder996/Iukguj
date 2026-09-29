import { WeaponDef } from './weapons';

export type Team = 'CT' | 'T';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type?: 'spark' | 'blood' | 'smoke' | 'debris' | 'flash' | 'casing';
  rotation?: number;
  rotSpeed?: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  headshotMultiplier: number;
  shooterId: string;
  shooterTeam: Team;
  weaponId: string;
  distanceTraveled: number;
  maxDistance: number;
  color: string;
}

export interface Grenade {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  timer: number;
  type: 'he' | 'flash' | 'smoke';
  ownerTeam: Team;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  size?: number;
}

export interface SmokeArea {
  id: number;
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
}

export interface Bot {
  id: string;
  name: string;
  team: Team;
  x: number;
  y: number;
  angle: number;
  health: number;
  maxHealth: number;
  armor: number;
  weapon: WeaponDef;
  ammo: number;
  isReloading: boolean;
  reloadTimer: number;
  shootCooldown: number;
  state: 'idle' | 'patrol' | 'rush' | 'attack' | 'flee' | 'defuse' | 'plant';
  targetX: number;
  targetY: number;
  stateTimer: number;
  reactionTimer: number;
  sightRange: number;
  isDefusing?: boolean;
  isPlanting?: boolean;
}

export interface KillFeedEntry {
  id: number;
  killer: string;
  killerTeam: Team;
  victim: string;
  victimTeam: Team;
  weapon: string;
  isHeadshot: boolean;
  timestamp: number;
}

export interface BombState {
  isPlanted: boolean;
  isDefused: boolean;
  isExploded: boolean;
  x: number;
  y: number;
  site: 'A' | 'B';
  timer: number; // 40s countdown
  plantProgress: number; // 0 to 1
  defuseProgress: number; // 0 to 1
  planterId: string | null;
  defuserId: string | null;
}

export interface PlayerStats {
  kills: number;
  deaths: number;
  headshots: number;
  damageDealt: number;
  mvps: number;
  score: number;
}
