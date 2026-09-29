// Weapon definitions and characteristics

export interface WeaponDef {
  id: string;
  name: string;
  category: 'pistol' | 'rifle' | 'awp' | 'shotgun' | 'smg' | 'knife';
  price: number;
  damage: number;
  headshotMultiplier: number;
  fireRate: number; // bullets per sec
  magazineSize: number;
  reloadTime: number; // in seconds
  spread: number; // in radians
  pellets: number; // shotgun pellet count
  recoil: number;
  bulletSpeed: number;
  range: number;
  isAutomatic: boolean;
  color: string;
  description: string;
}

export const WEAPONS: Record<string, WeaponDef> = {
  knife: {
    id: 'knife',
    name: 'Karambit',
    category: 'knife',
    price: 0,
    damage: 65,
    headshotMultiplier: 1.5,
    fireRate: 2.2,
    magazineSize: 999,
    reloadTime: 0.1,
    spread: 0,
    pellets: 1,
    recoil: 0,
    bulletSpeed: 0,
    range: 55,
    isAutomatic: false,
    color: '#e2e8f0',
    description: 'Silent and lethal in close quarters.'
  },
  glock: {
    id: 'glock',
    name: 'Glock-18',
    category: 'pistol',
    price: 200,
    damage: 24,
    headshotMultiplier: 2.4,
    fireRate: 4.5,
    magazineSize: 20,
    reloadTime: 1.4,
    spread: 0.05,
    pellets: 1,
    recoil: 1.2,
    bulletSpeed: 950,
    range: 500,
    isAutomatic: false,
    color: '#94a3b8',
    description: 'High capacity standard sidearm.'
  },
  deagle: {
    id: 'deagle',
    name: 'Desert Eagle',
    category: 'pistol',
    price: 700,
    damage: 62,
    headshotMultiplier: 2.8,
    fireRate: 2.5,
    magazineSize: 7,
    reloadTime: 1.6,
    spread: 0.03,
    pellets: 1,
    recoil: 4.5,
    bulletSpeed: 1100,
    range: 650,
    isAutomatic: false,
    color: '#f59e0b',
    description: 'Hand cannon. 1-tap headshot potential.'
  },
  mp9: {
    id: 'mp9',
    name: 'MP9 / SMG',
    category: 'smg',
    price: 1250,
    damage: 22,
    headshotMultiplier: 2.0,
    fireRate: 11.0,
    magazineSize: 30,
    reloadTime: 1.8,
    spread: 0.08,
    pellets: 1,
    recoil: 1.8,
    bulletSpeed: 900,
    range: 480,
    isAutomatic: true,
    color: '#38bdf8',
    description: 'Rapid spray for run-and-gun combat.'
  },
  nova: {
    id: 'nova',
    name: 'Nova Pump',
    category: 'shotgun',
    price: 1400,
    damage: 20, // 20 * 7 = 140 max
    headshotMultiplier: 1.8,
    fireRate: 1.2,
    magazineSize: 8,
    reloadTime: 2.2,
    spread: 0.16,
    pellets: 7,
    recoil: 5.0,
    bulletSpeed: 850,
    range: 350,
    isAutomatic: false,
    color: '#fb923c',
    description: 'Devastating close-range blast.'
  },
  ak47: {
    id: 'ak47',
    name: 'AK-47',
    category: 'rifle',
    price: 2700,
    damage: 36,
    headshotMultiplier: 3.1, // 1-shot headshot
    fireRate: 7.5,
    magazineSize: 30,
    reloadTime: 2.0,
    spread: 0.045,
    pellets: 1,
    recoil: 2.8,
    bulletSpeed: 1150,
    range: 750,
    isAutomatic: true,
    color: '#eab308',
    description: 'Classic high-powered assault rifle.'
  },
  m4a4: {
    id: 'm4a4',
    name: 'M4A4',
    category: 'rifle',
    price: 3100,
    damage: 32,
    headshotMultiplier: 2.7,
    fireRate: 8.2,
    magazineSize: 30,
    reloadTime: 1.9,
    spread: 0.03,
    pellets: 1,
    recoil: 2.2,
    bulletSpeed: 1200,
    range: 750,
    isAutomatic: true,
    color: '#60a5fa',
    description: 'Accurate and dependable counter-terrorist weapon.'
  },
  awp: {
    id: 'awp',
    name: 'AWP Sniper',
    category: 'awp',
    price: 4750,
    damage: 115, // One shot torso/head
    headshotMultiplier: 2.5,
    fireRate: 0.9,
    magazineSize: 5,
    reloadTime: 2.6,
    spread: 0.015,
    pellets: 1,
    recoil: 8.0,
    bulletSpeed: 1600,
    range: 1200,
    isAutomatic: false,
    color: '#a855f7',
    description: 'High risk, high reward. One shot, one kill.'
  }
};
