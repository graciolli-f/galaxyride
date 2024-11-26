export const EFFECTS = {
  STARFIELD: 'starfield',
  SPIRAL: 'spiral',
  FIREFLIES: 'fireflies'
};

export const DEFAULT_CONFIGS = {
  [EFFECTS.SPIRAL]: {
    particles: 2000,
    minRadius: 5,
    maxRadius: 300,
    speed: 0.02,
    particleSize: 2,
    colorStart: '#ff0088',
    colorEnd: '#00ffff',
    inwardSpeed: 0.5,
    trail: 8,
    loop: true
  },
  [EFFECTS.STARFIELD]: {
    particles: 400,
    speed: 0.7,
    colorStart: '#ffffff',
    colorEnd: '#0000ff',
    maxDepth: 1000
  },
  [EFFECTS.FIREFLIES]: {
    particles: 50,
    maxSpeed: 1,
    size: 4,
    glowSize: 20,
    color: 'purple',
    magnetic: true,
    magneticRadius: 200
  }
}; 