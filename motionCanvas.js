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