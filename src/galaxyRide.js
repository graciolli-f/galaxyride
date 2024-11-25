// First declare the MotionCanvas class
class MotionCanvas {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animations = [];
        this.emitters = [];
        this.options = {
            width: options.width || window.innerWidth,
            height: options.height || window.innerHeight,
            background: options.background || '#000000',
            autoResize: options.autoResize !== false
        };

        this.setupCanvas();
        this.bindEvents();
        this.animate();
    }

    setupCanvas() {
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
    }

    bindEvents() {
        if (this.options.autoResize) {
            window.addEventListener('resize', () => {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            });
        }

        this.canvas.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.triggerInteraction(e);
        });
    }

    addParticle(options = {}) {
        const particle = {
            x: options.x || Math.random() * this.canvas.width,
            y: options.y || Math.random() * this.canvas.height,
            size: options.size || 5,
            color: options.color || '#ffffff',
            velocity: options.velocity || { x: 0, y: 0 },
            acceleration: options.acceleration || { x: 0, y: 0 },
            life: options.life || Infinity,
            created: Date.now(),
            behaviors: options.behaviors || []
        };
        
        this.particles.push(particle);
        return particle;
    }

    addBehavior(particle, behavior) {
        particle.behaviors.push(behavior);
    }

    addEmitter(options = {}) {
        const emitter = {
            x: options.x || this.canvas.width / 2,
            y: options.y || this.canvas.height / 2,
            frequency: options.frequency || 100, // ms between emissions
            lifetime: options.lifetime || Infinity,
            particleOptions: options.particleOptions || {},
            behaviors: options.behaviors || [],
            lastEmit: Date.now(),
            created: Date.now()
        };
        
        this.emitters.push(emitter);
        return emitter;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.options.background) {
            this.ctx.fillStyle = this.options.background;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.particles.forEach((particle, index) => {
            // Apply behaviors
            particle.behaviors.forEach(behavior => behavior(particle, this));

            // Draw particle
            this.ctx.save();
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            // Remove dead particles
            if (Date.now() - particle.created > particle.life) {
                this.particles.splice(index, 1);
            }
        });

        requestAnimationFrame(() => this.animate());
    }

    triggerInteraction(event) {
        this.particles.forEach(particle => {
            particle.behaviors.forEach(behavior => {
                if (behavior.onInteraction) {
                    behavior.onInteraction(particle, event, this);
                }
            });
        });
    }

    addWaveGrid(options = {}) {
        const config = {
            cols: options.cols || 40,
            rows: options.rows || 30,
            spacing: options.spacing || 25,
            dotSize: options.dotSize || 2,
            amplitude: options.amplitude || 30,
            speed: options.speed || 0.001,
            color: options.color || '#D4D4D4',
            hoverColor: options.hoverColor || '#00ff88',
            frequency: options.frequency || 0.3,
            autoWave: options.autoWave !== undefined ? options.autoWave : true,
            mouseInteraction: options.mouseInteraction !== undefined ? options.mouseInteraction : true,
            mouseRadius: options.mouseRadius || 100,
            mouseStrength: options.mouseStrength || 1,
            width: options.width || this.canvas.width,
            height: options.height || this.canvas.height
        };

        // Calculate spacing based on desired width/height if provided
        const calculatedSpacing = {
            x: config.width / config.cols,
            y: config.height / config.rows
        };

        // Calculate starting position to center the grid
        const startX = (this.canvas.width - config.width) / 2;
        const startY = (this.canvas.height - config.height) / 2;

        // Create grid of particles
        for(let row = 0; row < config.rows; row++) {
            for(let col = 0; col < config.cols; col++) {
                const x = startX + (col * calculatedSpacing.x);
                const y = startY + (row * calculatedSpacing.y);
                
                const particle = {
                    x: x,
                    y: y,
                    baseX: x,
                    baseY: y,
                    size: config.dotSize,
                    color: config.color,
                    velocity: { x: 0, y: 0 },
                    acceleration: { x: 0, y: 0 },
                    row: row,
                    col: col,
                    behaviors: [],
                    life: Infinity,
                    created: Date.now(),
                    originalSize: config.dotSize
                };

                this.particles.push(particle);

                // Wave behavior
                const waveBehavior = (p) => {
                    let waveHeight = 0;

                    // Auto wave effect
                    if (config.autoWave) {
                        const time = Date.now() * config.speed;
                        const distanceFromCenter = Math.sqrt(
                            Math.pow(p.col - config.cols/2, 2) + 
                            Math.pow(p.row - config.rows/2, 2)
                        );
                        waveHeight = Math.sin(distanceFromCenter * config.frequency + time) * config.amplitude;
                    }

                    // Mouse interaction
                    if (config.mouseInteraction && this.mouseX && this.mouseY) {
                        const dx = this.mouseX - p.x;
                        const dy = this.mouseY - p.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < config.mouseRadius) {
                            const force = (1 - distance / config.mouseRadius) * config.mouseStrength;
                            waveHeight += -force * 50; // Push particles up near mouse
                            p.size = p.originalSize + (force * 4); // Increase size near mouse
                            
                            // Use the hover color with transition based on distance
                            p.color = config.hoverColor;
                        } else {
                            p.size = p.originalSize;
                            p.color = config.color;
                        }
                    }

                    p.y = p.baseY + waveHeight;
                };

                this.addBehavior(particle, waveBehavior);
            }
        }
    }

    addSpiralGrid(options = {}) {
        const config = {
            particles: options.particles || 200,
            radius: options.radius || 300,
            spacing: options.spacing || 5,
            dotSize: options.dotSize || 2,
            rotationSpeed: options.rotationSpeed || 0.001,
            color: options.color || '#4488ff',
            hoverColor: options.hoverColor || '#ff0088',
            mouseRadius: options.mouseRadius || 100,
            mouseStrength: options.mouseStrength || 1,
            expansionSpeed: options.expansionSpeed || 0.2
        };

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Create particles in a spiral pattern
        for(let i = 0; i < config.particles; i++) {
            // Calculate initial spiral position
            const angle = (i / config.particles) * Math.PI * 20; // Multiple rotations
            const radius = (i / config.particles) * config.radius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            const particle = {
                x: x,
                y: y,
                baseX: x,
                baseY: y,
                angle: angle,
                radius: radius,
                size: config.dotSize,
                color: config.color,
                originalColor: config.color,
                velocity: { x: 0, y: 0 },
                acceleration: { x: 0, y: 0 },
                behaviors: [],
                life: Infinity,
                created: Date.now(),
                originalSize: config.dotSize,
                index: i
            };

            this.particles.push(particle);

            // Spiral behavior
            const spiralBehavior = (p) => {
                const time = Date.now() * config.rotationSpeed;
                
                // Update angle and radius
                p.angle += config.rotationSpeed;
                p.radius = ((p.index / config.particles) * config.radius) + 
                          Math.sin(time + p.index * 0.1) * 20; // Add some wave motion

                // Calculate new position
                p.x = centerX + Math.cos(p.angle) * p.radius;
                p.y = centerY + Math.sin(p.angle) * p.radius;

                // Mouse interaction
                if (this.mouseX && this.mouseY) {
                    const dx = this.mouseX - p.x;
                    const dy = this.mouseY - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < config.mouseRadius) {
                        const force = (1 - distance / config.mouseRadius) * config.mouseStrength;
                        
                        // Push particles away from mouse
                        p.x -= dx * force * 0.1;
                        p.y -= dy * force * 0.1;
                        
                        // Change color and size based on proximity
                        p.size = p.originalSize + (force * 4);
                        p.color = config.hoverColor;
                    } else {
                        p.size = p.originalSize;
                        p.color = p.originalColor;
                    }
                }
            };

            this.addBehavior(particle, spiralBehavior);
        }
    }

    addStarfield(options = {}) {
        const config = {
            stars: options.stars || 100,
            speed: options.speed || 4,
            maxDepth: options.maxDepth || 1000,
            color: options.color || '#ffffff',
            colorStart: options.colorStart,  // Add gradient start color
            colorEnd: options.colorEnd,      // Add gradient end color
            minSize: options.minSize || 1,
            maxSize: options.maxSize || 3,
            trail: options.trail || 0.2
        };

        // Create stars
        for(let i = 0; i < config.stars; i++) {
            const star = {
                x: Math.random() * this.canvas.width - this.canvas.width/2,
                y: Math.random() * this.canvas.height - this.canvas.height/2,
                z: Math.random() * config.maxDepth,
                prevX: 0,
                prevY: 0,
                color: config.color,
                behaviors: []
            };

            this.particles.push(star);

            // Add starfield behavior
            const starfieldBehavior = (p) => {
                p.prevX = p.x;
                p.prevY = p.y;
                p.z -= config.speed;

                if(p.z < 1) {
                    p.z = config.maxDepth;
                    p.x = Math.random() * this.canvas.width - this.canvas.width/2;
                    p.y = Math.random() * this.canvas.height - this.canvas.height/2;
                    p.prevX = p.x;
                    p.prevY = p.y;
                }

                const scale = config.maxDepth / (config.maxDepth + p.z);
                const x = p.x * scale + this.canvas.width/2;
                const y = p.y * scale + this.canvas.height/2;
                const prevX = p.prevX * scale + this.canvas.width/2;
                const prevY = p.prevY * scale + this.canvas.height/2;

                const size = ((config.maxDepth - p.z) / config.maxDepth) * 
                            (config.maxSize - config.minSize) + config.minSize;

                // Calculate color based on depth if gradient is specified
                if (config.colorStart && config.colorEnd) {
                    const progress = (config.maxDepth - p.z) / config.maxDepth;
                    const color = interpolateColor(config.colorStart, config.colorEnd, progress);
                    p.color = color;
                }

                this.ctx.beginPath();
                this.ctx.moveTo(prevX, prevY);
                this.ctx.lineTo(x, y);
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = size;
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.arc(x, y, size/2, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            };

            this.addBehavior(star, starfieldBehavior);
        }
    }

    

    // Add this method to the MotionCanvas class
    addVortex(options = {}) {
        const config = {
            particles: options.particles || 200,
            minRadius: options.minRadius || 5,
            maxRadius: options.maxRadius || 300,
            speed: options.speed || 2,
            particleSize: options.particleSize || 3,
            colorStart: options.colorStart || '#ff0088',
            colorEnd: options.colorEnd || '#00ffff',
            inwardSpeed: options.inwardSpeed || 0.3,
            trail: options.trail || 0.4,
            respawnRadius: options.respawnRadius || 350
        };

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Create particles
        for(let i = 0; i < config.particles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = config.maxRadius;
            
            const particle = {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                angle: angle,
                radius: radius,
                speed: config.speed * (0.5 + Math.random() * 0.5),
                size: config.particleSize,
                color: config.colorStart,
                trail: []
            };

            this.particles.push(particle);

            // Add vortex behavior
            const vortexBehavior = (p) => {
                // Store current position for trail
                p.trail.push({ x: p.x, y: p.y });
                if (p.trail.length > 10) {
                    p.trail.shift();
                }

                // Update angle and radius
                p.angle += p.speed * (1 + (config.maxRadius - p.radius) / config.maxRadius);
                p.radius -= config.inwardSpeed;

                // Calculate new position
                p.x = centerX + Math.cos(p.angle) * p.radius;
                p.y = centerY + Math.sin(p.angle) * p.radius;

                // Interpolate color based on radius
                const colorProgress = 1 - (p.radius - config.minRadius) / (config.maxRadius - config.minRadius);
                p.color = interpolateColor(config.colorStart, config.colorEnd, Math.max(0, Math.min(1, colorProgress)));

                // Draw trail
                if (p.trail.length > 1) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.trail[0].x, p.trail[0].y);
                    
                    for(let i = 1; i < p.trail.length; i++) {
                        this.ctx.lineTo(p.trail[i].x, p.trail[i].y);
                    }
                    
                    this.ctx.strokeStyle = p.color;
                    this.ctx.lineWidth = p.size * (1 - colorProgress * 0.5);
                    this.ctx.lineCap = 'round';
                    this.ctx.stroke();
                }

                // Reset particle if it reaches the center
                if (p.radius < config.minRadius) {
                    p.radius = config.respawnRadius;
                    p.angle = Math.random() * Math.PI * 2;
                    p.trail = [];
                    p.speed = config.speed * (0.5 + Math.random() * 0.5);
                }
            };

            this.addBehavior(particle, vortexBehavior);
        }
    }

    // Add this method to the MotionCanvas class
    addFireflies(options = {}) {
        const config = {
            fireflies: options.fireflies || 50,
            maxSpeed: options.maxSpeed || 1,
            size: options.size || 4,
            glowSize: options.glowSize || 20,
            color: options.color || 'purple',
            wanderStrength: options.wanderStrength || 0.1,
            fadeSpeed: options.fadeSpeed || 0.02,
            magnetic: options.magnetic !== undefined ? options.magnetic : true,
            magneticRadius: options.magneticRadius || 200,
            magneticStrength: options.magneticStrength || 0.2
        };

        // Create fireflies
        for(let i = 0; i < config.fireflies; i++) {
            const firefly = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * config.maxSpeed,
                vy: (Math.random() - 0.5) * config.maxSpeed,
                phase: Math.random() * Math.PI * 2,
                brightness: Math.random(),
                isAttracted: false,
                behaviors: []
            };

            this.particles.push(firefly);

            // Add firefly behavior
            const fireflyBehavior = (p) => {
                // Update phase for pulsing effect
                p.phase += 0.05;
                p.brightness = Math.sin(p.phase) * 0.5 + 0.5;

                if (config.magnetic && this.mouseX && this.mouseY) {
                    // Calculate distance to mouse
                    const dx = this.mouseX - p.x;
                    const dy = this.mouseY - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.magneticRadius) {
                        // Apply magnetic attraction
                        const force = (1 - distance / config.magneticRadius) * config.magneticStrength;
                        p.vx += dx * force;
                        p.vy += dy * force;
                        p.isAttracted = true;
                    } else {
                        p.isAttracted = false;
                    }
                }

                // Add random movement if not attracted
                if (!p.isAttracted) {
                    p.vx += (Math.random() - 0.5) * config.wanderStrength;
                    p.vy += (Math.random() - 0.5) * config.wanderStrength;
                }

                // Limit speed
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > config.maxSpeed) {
                    p.vx = (p.vx / speed) * config.maxSpeed;
                    p.vy = (p.vy / speed) * config.maxSpeed;
                }

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around screen
                if (p.x < 0) p.x = this.canvas.width;
                if (p.x > this.canvas.width) p.x = 0;
                if (p.y < 0) p.y = this.canvas.height;
                if (p.y > this.canvas.height) p.y = 0;

                // Draw glow
                const gradient = this.ctx.createRadialGradient(
                    p.x, p.y, 0,
                    p.x, p.y, config.glowSize
                );
                gradient.addColorStop(0, `rgba(128, 0, 128, ${0.3 * p.brightness})`);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, config.glowSize, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw firefly
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, config.size * p.brightness, 0, Math.PI * 2);
                this.ctx.fillStyle = config.color;
                this.ctx.fill();
            };

            this.addBehavior(firefly, fireflyBehavior);
        }
    }
}

// Helper function to convert hex to rgb
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : 
        '255,255,255';
}

// Then add the static behaviors AFTER the class definition
MotionCanvas.behaviors = {
    wave: (amplitude = 30, speed = 0.001, frequency = 0.3, cols, rows) => (particle, canvas) => {
        const time = Date.now() * speed;
        
        // Calculate distance from center of grid
        const distanceFromCenter = Math.sqrt(
            Math.pow(particle.col - cols/2, 2) + 
            Math.pow(particle.row - rows/2, 2)
        );
        
        // Update y position with wave
        particle.y = particle.baseY + Math.sin(distanceFromCenter * frequency + time) * amplitude;
    }
}; 

// Update the interpolateColor function to handle named colors
function interpolateColor(color1, color2, factor) {
    if (arguments.length < 3) { return color1; }
    
    function hex2rgb(color) {
        // Handle named colors by creating a temporary div
        const div = document.createElement('div');
        div.style.color = color;
        document.body.appendChild(div);
        const computedColor = window.getComputedStyle(div).color;
        document.body.removeChild(div);
        
        // Parse rgb/rgba string
        const match = computedColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
    }

    const rgb1 = hex2rgb(color1);
    const rgb2 = hex2rgb(color2);
    
    if (!rgb1 || !rgb2) return color1;

    const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * factor);
    const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * factor);
    const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * factor);
    
    return `rgb(${r},${g},${b})`;
} 