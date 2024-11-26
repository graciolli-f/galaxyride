'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var PropTypes = require('prop-types');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var PropTypes__default = /*#__PURE__*/_interopDefaultLegacy(PropTypes);

const GalaxyCanvas = ({
  options = {},
  width = window.innerWidth,
  height = window.innerHeight,
  background = '#000000'
}) => {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Initialize canvas
    canvas.width = width;
    canvas.height = height;
    const effectConfigs = {
      [EFFECTS.SPIRAL]: {
        particles: options.particles || 2000,
        minRadius: options.minRadius || 5,
        maxRadius: options.maxRadius || 300,
        speed: options.speed || 0.02,
        particleSize: options.particleSize || 2,
        colorStart: options.colorStart || '#ff0088',
        colorEnd: options.colorEnd || '#00ffff',
        inwardSpeed: options.inwardSpeed || 0.5,
        trail: options.trail || 8,
        loop: options.loop !== undefined ? options.loop : true
      },
      [EFFECTS.STARFIELD]: {
        particles: options.stars || 400,
        speed: options.speed || 0.7,
        colorStart: options.colorStart || '#ffffff',
        colorEnd: options.colorEnd || '#0000ff',
        maxDepth: options.maxDepth || 1000
      },
      [EFFECTS.FIREFLIES]: {
        particles: options.fireflies || 50,
        maxSpeed: options.maxSpeed || 1,
        size: options.size || 4,
        glowSize: options.glowSize || 20,
        color: options.color || 'purple',
        magnetic: options.magnetic !== undefined ? options.magnetic : true,
        magneticRadius: options.magneticRadius || 200
      }
    };

    // Initialize particles based on selected effect
    const initializeParticles = () => {
      const config = effectConfigs[options.effect];
      if (!config) {
        console.warn(`Effect "${options.effect}" not found. Please use one of: `, Object.values(EFFECTS));
        return;
      }
      particles = [];
      switch (options.effect) {
        case EFFECTS.SPIRAL:
          const centerX = width / 2;
          const centerY = height / 2;
          for (let i = 0; i < config.particles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = config.maxRadius;
            particles.push({
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius,
              angle: angle,
              radius: radius,
              speed: config.speed * (0.5 + Math.random() * 0.5),
              trail: [],
              active: true
            });
          }
          break;
        case EFFECTS.STARFIELD:
          for (let i = 0; i < config.particles; i++) {
            particles.push({
              x: Math.random() * width - width / 2,
              y: Math.random() * height - height / 2,
              z: Math.random() * config.maxDepth,
              prevX: 0,
              prevY: 0
            });
          }
          break;
        case EFFECTS.FIREFLIES:
          for (let i = 0; i < config.particles; i++) {
            particles.push({
              x: Math.random() * width,
              y: Math.random() * height,
              vx: (Math.random() - 0.5) * config.maxSpeed,
              vy: (Math.random() - 0.5) * config.maxSpeed,
              phase: Math.random() * Math.PI * 2,
              brightness: Math.random()
            });
          }
          break;
        default:
          console.warn(`Effect "${options.effect}" not found, defaulting to spiral`);
          initializeParticles(EFFECTS.SPIRAL);
          break;
      }
    };

    // Animation functions
    const animationFunctions = {
      [EFFECTS.SPIRAL]: () => {
        const config = effectConfigs[EFFECTS.SPIRAL];
        const centerX = width / 2;
        const centerY = height / 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
        particles.forEach(p => {
          if (!config.loop && !p.active) return;
          p.trail.push({
            x: p.x,
            y: p.y
          });
          if (p.trail.length > config.trail) {
            p.trail.shift();
          }
          p.angle += p.speed * (1 + (config.maxRadius - p.radius) / config.maxRadius);
          p.radius -= config.inwardSpeed;
          p.x = centerX + Math.cos(p.angle) * p.radius;
          p.y = centerY + Math.sin(p.angle) * p.radius;
          if (p.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let i = 1; i < p.trail.length; i++) {
              ctx.lineTo(p.trail[i].x, p.trail[i].y);
            }
            const colorFactor = 1 - p.radius / config.maxRadius;
            ctx.strokeStyle = interpolateColor(config.colorStart, config.colorEnd, colorFactor);
            ctx.lineWidth = config.particleSize;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
          if (p.radius < config.minRadius) {
            if (config.loop) {
              p.radius = config.maxRadius;
              p.angle = Math.random() * Math.PI * 2;
              p.trail = [];
            } else {
              p.active = false;
            }
          }
        });
      },
      [EFFECTS.STARFIELD]: () => {
        const config = effectConfigs[EFFECTS.STARFIELD];
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
        particles.forEach(star => {
          star.z -= config.speed;
          if (star.z < 1) {
            star.z = config.maxDepth;
            star.x = Math.random() * width - width / 2;
            star.y = Math.random() * height - height / 2;
          }
          const scale = config.maxDepth / (config.maxDepth + star.z);
          const x = star.x * scale + width / 2;
          const y = star.y * scale + height / 2;
          const colorFactor = 1 - star.z / config.maxDepth;
          ctx.fillStyle = interpolateColor(config.colorStart, config.colorEnd, colorFactor);
          ctx.beginPath();
          ctx.arc(x, y, scale * 2, 0, Math.PI * 2);
          ctx.fill();
        });
      },
      [EFFECTS.FIREFLIES]: () => {
        const config = effectConfigs[EFFECTS.FIREFLIES];
        ctx.fillStyle = config.color;
        ctx.fillRect(0, 0, width, height);
        particles.forEach(firefly => {
          firefly.vx += (Math.random() - 0.5) * config.maxSpeed;
          firefly.vy += (Math.random() - 0.5) * config.maxSpeed;
          firefly.x += firefly.vx;
          firefly.y += firefly.vy;
          const glow = firefly.brightness * config.glowSize;
          ctx.fillStyle = `rgba(${firefly.color}, ${firefly.color}, ${firefly.color}, ${firefly.brightness})`;
          ctx.beginPath();
          ctx.arc(firefly.x, firefly.y, config.size + glow, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    };

    // Helper function for color interpolation
    const interpolateColor = (color1, color2, factor) => {
      const hex2rgb = hex => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
      };
      const c1 = hex2rgb(color1);
      const c2 = hex2rgb(color2);
      const r = Math.round(c1[0] + (c2[0] - c1[0]) * factor);
      const g = Math.round(c1[1] + (c2[1] - c1[1]) * factor);
      const b = Math.round(c1[2] + (c2[2] - c1[2]) * factor);
      return `rgb(${r}, ${g}, ${b})`;
    };

    // Animation loop
    const animate = () => {
      if (animationFunctions[options.effect]) {
        animationFunctions[options.effect]();
      }
      animationFrameId = window.requestAnimationFrame(animate);
    };

    // Initialize and start animation
    initializeParticles();
    animate();

    // Cleanup
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [options, width, height, background]);
  return /*#__PURE__*/React__default["default"].createElement("canvas", {
    ref: canvasRef,
    style: {
      display: 'block',
      width: '100%',
      height: '100%'
    }
  });
};
GalaxyCanvas.propTypes = {
  options: PropTypes__default["default"].shape({
    effect: PropTypes__default["default"].oneOf(Object.values(EFFECTS)).isRequired,
    particles: PropTypes__default["default"].number,
    speed: PropTypes__default["default"].number,
    colorStart: PropTypes__default["default"].string,
    colorEnd: PropTypes__default["default"].string
    // ... other option props
  }),
  width: PropTypes__default["default"].number,
  height: PropTypes__default["default"].number,
  background: PropTypes__default["default"].string
};

const EFFECTS = {
  STARFIELD: 'starfield',
  SPIRAL: 'spiral',
  FIREFLIES: 'fireflies'
};
({
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
});

exports.EFFECTS = EFFECTS;
exports.GalaxyCanvas = GalaxyCanvas;
exports["default"] = GalaxyCanvas;
//# sourceMappingURL=index.js.map
