const PARTICLES_QTY = 100;
const PARTICLE_MIN_RADIUS = 15;
const PARTICLES_MAX_CONNECT_DISTANCE = 200;
const PARTICLES_BOUNCE = false; // Set to `true` to bounce particles off each other

class Particle {
  constructor(effect) {
    this.effect = effect;
    this.radius = PARTICLE_MIN_RADIUS + Math.random() * 10;
    this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
    this.vx = 4 * Math.random() - 2;
    this.vx += this.vx > 0 ? 0.5 : -0.5;
    this.vy = 4 * Math.random() - 2;
    this.vy += this.vy > 0 ? 0.5 : -0.5;
  }

  draw(context) {
    // Hue - Saturation - Lightness
    // context.fillStyle = `hsl(${this.x * 0.5}, 100%, 50%)`;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    // Bounce particle off canvas borders:
    if (this.x >= this.effect.width - this.radius || this.x <= this.radius) this.vx *= -1;
    if (this.y >= this.effect.height - this.radius || this.y <= this.radius) this.vy *= -1;
  }

  intersectsWith(otherParticle) {
    const dx = this.x - otherParticle.x;
    const dy = this.y - otherParticle.y;
    const distance = Math.hypot(dx, dy);
    const maxDistance = this.radius + otherParticle.radius;
    return distance <= maxDistance + 1;
  }
}

class Effect {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.particles = [];
    this.numberOfParticles = PARTICLES_QTY;
    this.createParticles();
  }

  createParticles() {
    if (PARTICLES_BOUNCE) {
      // Create non-intersecting particles
      while (this.particles.length <= PARTICLES_QTY) {
        let particle = new Particle(this);

        // Check intersections
        let intersectionsCount = 0;
        for (let i = 0; i < this.particles.length; i++) {
          if (particle.intersectsWith(this.particles[i])) {
            intersectionsCount++;
            break;
          }
        }

        if (!intersectionsCount) {
          this.particles.push(particle);
          console.log(this.particles);
        }
      }
    } else {
      // Do not care about particle intersections:
      for (let i = 0; i < this.numberOfParticles; i++) {
        this.particles.push(new Particle(this));
      }
    }
  }

  handleParticles(context) {
    this.connectAndBounceParticles(context);
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }

  connectAndBounceParticles(context) {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.hypot(dx, dy);

        if (distance < PARTICLES_MAX_CONNECT_DISTANCE) {
          context.save();
          const opacity = 1 - distance / PARTICLES_MAX_CONNECT_DISTANCE;
          context.globalAlpha = opacity;
          context.beginPath();
          context.moveTo(this.particles[i].x, this.particles[i].y);
          context.lineTo(this.particles[j].x, this.particles[j].y);
          context.stroke();
          context.restore();
        }

        if (PARTICLES_BOUNCE) {
          if (this.particles[i].intersectsWith(this.particles[j])) {
            this.particles[i].vx *= -1;
            this.particles[i].vy *= -1;
            this.particles[j].vx *= -1;
            this.particles[j].vy *= -1;
          }
        }
      }
    }
  }
}

// Configure
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, "white");
gradient.addColorStop(0.5, "magenta");
gradient.addColorStop(1, "blue");
ctx.fillStyle = gradient;
ctx.strokeStyle = "white";

const effect = new Effect(canvas);

// Entry point
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.handleParticles(ctx);
  requestAnimationFrame(animate);
}

animate();
