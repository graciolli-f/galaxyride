'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var PropTypes = require('prop-types');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var PropTypes__default = /*#__PURE__*/_interopDefaultLegacy(PropTypes);

const GalaxyCanvas = ({
  effect = 'starfield',
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

    // Effect configurations
    const effectConfigs = {
      starfield: {
        particles: options.stars || 400,
        speed: options.speed || 0.7,
        colorStart: options.colorStart || '#ffffff',
        colorEnd: options.colorEnd || '#0000ff',
        maxDepth: options.maxDepth || 1000
      },
      fireflies: {
        particles: options.fireflies || 50,
        maxSpeed: options.maxSpeed || 1,
        size: options.size || 4,
        glowSize: options.glowSize || 20,
        color: options.color || 'purple',
        magnetic: options.magnetic !== undefined ? options.magnetic : true,
        magneticRadius: options.magneticRadius || 200
      },
      spiral: {
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
      }
    };

    // Helper functions
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

    // Initialize particles based on effect
    const initializeParticles = () => {
      const config = effectConfigs[effect];
      particles = [];
      switch (effect) {
        case 'starfield':
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
        case 'fireflies':
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
        case 'spiral':
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
              active: true
            });
          }
          break;
      }
    };

    // Animation functions for each effect
    const animationFunctions = {
      starfield: () => {
        const config = effectConfigs.starfield;
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
      // Add other effect animations here...
      spiral: () => {
        const config = effectConfigs.spiral;
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
      }
    };

    // Animation loop
    const animate = () => {
      if (animationFunctions[effect]) {
        animationFunctions[effect]();
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
  }, [effect, options, width, height, background]);
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
  effect: PropTypes__default["default"].oneOf(['starfield', 'fireflies', 'spiral']),
  options: PropTypes__default["default"].object,
  width: PropTypes__default["default"].number,
  height: PropTypes__default["default"].number,
  background: PropTypes__default["default"].string
};

exports.GalaxyCanvas = GalaxyCanvas;
exports["default"] = GalaxyCanvas;
//# sourceMappingURL=index.js.map
