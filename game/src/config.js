// Game Configuration and Constants
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const COLORS = {
  bg: '#060814',
  primary: '#00f0ff',
  secondary: '#ff0077',
  accent: '#ffe600',
  emerald: '#00ff88',
  purple: '#9d00ff',
  white: '#ffffff',
  textDim: '#7a889b',
  hudBg: 'rgba(10, 16, 32, 0.85)',
  shield: 'rgba(0, 240, 255, 0.4)',
};

export const PLAYER_CONFIG = {
  radius: 16,
  speed: 290,
  turnSpeed: Math.PI * 1.6,
  maxHealth: 100,
  maxShield: 100,
  shieldRegenRate: 18,
  shieldRegenDelay: 2.8,
  fireRate: 0.13,
};

export const ENEMY_TYPES = {
  SCOUT: {
    type: 'SCOUT',
    radius: 14,
    speed: 130,
    health: 20,
    score: 150,
    color: '#00ff88',
    fireRate: 2.2,
  },
  STALKER: {
    type: 'STALKER',
    radius: 16,
    speed: 180,
    health: 35,
    score: 250,
    color: '#ff0077',
    fireRate: 1.5,
  },
  ASTEROID: {
    type: 'ASTEROID',
    radius: 24,
    speed: 70,
    health: 50,
    score: 100,
    color: '#8b9bb4',
  },
  CRUISER: {
    type: 'CRUISER',
    radius: 32,
    speed: 55,
    health: 180,
    score: 800,
    color: '#ffe600',
    fireRate: 1.2,
  },
  VOID_BOSS: {
    type: 'VOID_BOSS',
    radius: 52,
    speed: 40,
    health: 800,
    score: 5000,
    color: '#9d00ff',
    fireRate: 0.8,
  },
};

export const POWERUP_TYPES = {
  TRIPLE_LASER: { type: 'TRIPLE_LASER', duration: 12, label: 'TRIPLE LASER', color: '#00f0ff' },
  SHIELD_BOOST: { type: 'SHIELD_BOOST', duration: 0, label: 'SHIELD RECHARGE', color: '#00ff88' },
  EMP_BOMB: { type: 'EMP_BOMB', duration: 0, label: 'EMP BLAST', color: '#ffe600' },
  OVERDRIVE: { type: 'OVERDRIVE', duration: 8, label: 'OVERDRIVE RAPID-FIRE', color: '#ff0077' },
};
