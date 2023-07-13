const PARTICLE_RADIUS = 15;
const PARTICLES_QTY = 40;

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

class Particle {
  constructor(effect) {
    this.effect = effect;
    this.x = Math.random() * this.effect.width;
    this.y = Math.random() * this.effect.height;
    this.radius = PARTICLE_RADIUS;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
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
    this.particles.forEach((particle) => particle.draw(context));
  }
}

function animate() {}

// Entry point
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.fillStyle = "blue";

const effect = new Effect(canvas);
effect.handleParticles(ctx);
