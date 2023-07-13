const PARTICLE_MIN_RADIUS = 15;
const PARTICLES_QTY = 80;

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

class Particle {
  constructor(effect) {
    this.effect = effect;
    this.radius = PARTICLE_MIN_RADIUS + Math.random() * 10;
    this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
    this.vx = 1 + Math.random();
    this.vy = 1 + Math.random();
  }

  draw(context) {
    // Hue - Saturation - Lightness
    context.fillStyle = `hsl(${this.x * 0.5}, 100%, 50%)`;
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
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle(this));
    }
  }

  handleParticles(context) {
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }
}

// Configure
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.fillStyle = "blue";

const effect = new Effect(canvas);

// Entry point
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.handleParticles(ctx);
  requestAnimationFrame(animate);
}

animate();
