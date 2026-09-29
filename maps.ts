// Map layouts, obstacles, and bomb sites

export interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'brick' | 'crate' | 'metal' | 'sandbag' | 'water';
}

export interface BombSite {
  id: 'A' | 'B';
  x: number;
  y: number;
  radius: number;
}

export interface MapData {
  id: string;
  name: string;
  theme: 'dust2' | 'inferno' | 'mirage';
  width: number;
  height: number;
  walls: Wall[];
  bombSites: BombSite[];
  ctSpawn: { x: number; y: number };
  tSpawn: { x: number; y: number };
  coverProps: { x: number; y: number; r: number; color: string }[];
}

export const MAP_DUST2: MapData = {
  id: 'dust2',
  name: 'de_dust2_pixel',
  theme: 'dust2',
  width: 1400,
  height: 1000,
  bombSites: [
    { id: 'A', x: 1160, y: 260, radius: 75 },
    { id: 'B', x: 260, y: 260, radius: 75 },
  ],
  ctSpawn: { x: 700, y: 150 },
  tSpawn: { x: 700, y: 880 },
  walls: [
    // Outer boundaries
    { x: 0, y: 0, w: 1400, h: 30, type: 'brick' },
    { x: 0, y: 970, w: 1400, h: 30, type: 'brick' },
    { x: 0, y: 0, w: 30, h: 1000, type: 'brick' },
    { x: 1370, y: 0, w: 30, h: 1000, type: 'brick' },

    // Middle Courtyard / Doors
    { x: 580, y: 400, w: 30, h: 220, type: 'brick' },
    { x: 790, y: 400, w: 30, h: 220, type: 'brick' },
    // Mid double doors gap
    { x: 670, y: 460, w: 20, h: 80, type: 'metal' },
    { x: 710, y: 460, w: 20, h: 80, type: 'metal' },

    // A Long Corridor & A Site
    { x: 980, y: 120, w: 30, h: 380, type: 'brick' },
    { x: 1100, y: 380, w: 180, h: 30, type: 'brick' },
    { x: 980, y: 620, w: 220, h: 30, type: 'brick' },
    { x: 1200, y: 620, w: 30, h: 260, type: 'brick' },

    // B Tunnels & B Site
    { x: 390, y: 120, w: 30, h: 380, type: 'brick' },
    { x: 120, y: 380, w: 180, h: 30, type: 'brick' },
    { x: 200, y: 620, w: 220, h: 30, type: 'brick' },
    { x: 200, y: 620, w: 30, h: 260, type: 'brick' },

    // Crates in A Site (Goose / Pit / Car)
    { x: 1120, y: 200, w: 40, h: 40, type: 'crate' },
    { x: 1180, y: 210, w: 45, h: 45, type: 'crate' },
    { x: 1050, y: 460, w: 45, h: 45, type: 'crate' },
    { x: 1280, y: 780, w: 50, h: 50, type: 'sandbag' },

    // Crates in B Site (Big box, Window, Car)
    { x: 220, y: 200, w: 45, h: 45, type: 'crate' },
    { x: 280, y: 220, w: 40, h: 40, type: 'crate' },
    { x: 310, y: 460, w: 45, h: 45, type: 'crate' },
    { x: 80, y: 780, w: 50, h: 50, type: 'sandbag' },

    // Mid Crates / Xbox
    { x: 675, y: 600, w: 50, h: 50, type: 'crate' },
    { x: 630, y: 720, w: 40, h: 40, type: 'crate' },
    { x: 730, y: 720, w: 40, h: 40, type: 'crate' },

    // Spawn barricades
    { x: 620, y: 180, w: 50, h: 25, type: 'sandbag' },
    { x: 730, y: 180, w: 50, h: 25, type: 'sandbag' },
    { x: 620, y: 830, w: 50, h: 25, type: 'sandbag' },
    { x: 730, y: 830, w: 50, h: 25, type: 'sandbag' },
  ],
  coverProps: [
    { x: 240, y: 180, r: 14, color: '#475569' }, // Barrel
    { x: 1150, y: 180, r: 14, color: '#475569' }, // Barrel
    { x: 700, y: 350, r: 12, color: '#334155' },
    { x: 1020, y: 700, r: 12, color: '#334155' },
    { x: 380, y: 700, r: 12, color: '#334155' },
  ]
};

export const MAP_INFERNO: MapData = {
  id: 'inferno',
  name: 'de_inferno_pixel',
  theme: 'inferno',
  width: 1400,
  height: 1000,
  bombSites: [
    { id: 'A', x: 1120, y: 280, radius: 75 },
    { id: 'B', x: 280, y: 320, radius: 75 },
  ],
  ctSpawn: { x: 700, y: 160 },
  tSpawn: { x: 700, y: 870 },
  walls: [
    { x: 0, y: 0, w: 1400, h: 30, type: 'brick' },
    { x: 0, y: 970, w: 1400, h: 30, type: 'brick' },
    { x: 0, y: 0, w: 30, h: 1000, type: 'brick' },
    { x: 1370, y: 0, w: 30, h: 1000, type: 'brick' },

    // Banana to B
    { x: 180, y: 450, w: 30, h: 300, type: 'brick' },
    { x: 360, y: 480, w: 30, h: 270, type: 'brick' },
    { x: 220, y: 420, w: 80, h: 30, type: 'sandbag' },

    // Apartments & Alt Mid
    { x: 920, y: 420, w: 30, h: 340, type: 'brick' },
    { x: 1050, y: 420, w: 30, h: 240, type: 'brick' },
    { x: 950, y: 420, w: 100, h: 30, type: 'brick' },

    // Mid Courtyard
    { x: 550, y: 360, w: 30, h: 260, type: 'brick' },
    { x: 820, y: 360, w: 30, h: 260, type: 'brick' },

    // Coffin & Site props
    { x: 250, y: 260, w: 40, h: 50, type: 'crate' },
    { x: 310, y: 270, w: 45, h: 45, type: 'crate' },
    { x: 1080, y: 240, w: 45, h: 45, type: 'crate' },
    { x: 1160, y: 240, w: 45, h: 45, type: 'crate' },
    { x: 1110, y: 340, w: 40, h: 40, type: 'sandbag' },

    // Boiler & Library
    { x: 820, y: 260, w: 120, h: 30, type: 'brick' },
    { x: 460, y: 260, w: 120, h: 30, type: 'brick' },
  ],
  coverProps: [
    { x: 330, y: 230, r: 14, color: '#475569' },
    { x: 1050, y: 200, r: 14, color: '#475569' },
    { x: 690, y: 640, r: 12, color: '#334155' },
    { x: 280, y: 650, r: 12, color: '#334155' },
  ]
};

export const MAPS: Record<string, MapData> = {
  dust2: MAP_DUST2,
  inferno: MAP_INFERNO
};
