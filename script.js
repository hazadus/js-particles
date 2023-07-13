const PARTICLES_QTY = 150;
const PARTICLE_MIN_RADIUS = 10;
const PARTICLES_MAX_CONNECT_DISTANCE = 200;
const PARTICLES_BOUNCE = false; // Set to `true` to bounce particles off each other
const MOUSE_RADIUS = 200;

class Particle {
  constructor(effect) {
    this.effect = effect;
    this.radius = PARTICLE_MIN_RADIUS + Math.random() * 10;
    this.resetPosition();
    this.vx = 4 * Math.random() - 2;
    this.vx += this.vx > 0 ? 0.5 : -0.5;
    this.vy = 4 * Math.random() - 2;
    this.vy += this.vy > 0 ? 0.5 : -0.5;
  }

  resetPosition() {
    this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
  }

  draw(context) {
    // Hue - Saturation - Lightness
    // context.fillStyle = `hsl(${this.x * 0.5}, 100%, 50%)`;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
  }

  update() {
    if (this.effect.mouse.pressed) {
      // Interact with the mouse
      const dx = this.x - this.effect.mouse.x;
      const dy = this.y - this.effect.mouse.y;
      const distance = Math.hypot(dx, dy);
      const force = this.effect.mouse.radius / distance;

      if (distance < this.effect.mouse.radius) {
        // `atan2()` gives us the counterclockwise angle in radians, between the positive
        // x-axis and a line projected from point (0,0) towards specific x and y coordinates
        // (target point). It returns a value in the range [-pi...pi] radians.
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * 2 * force;
        this.y += Math.sin(angle) * 2 * force;
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    // Bounce particle off canvas borders, preventing pushing out of boundaries:
    if (this.x < this.radius) {
      this.x = this.radius;
      this.vx *= -1;
    } else if (this.x > this.effect.width - this.radius) {
      this.x = this.effect.width - this.radius;
      this.vx *= -1;
    }

    if (this.y < this.radius) {
      this.y = this.radius;
      this.vy *= -1;
    } else if (this.y > this.effect.height - this.radius) {
      this.y = this.effect.height - this.radius;
      this.vy *= -1;
    }
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

    this.mouse = {
      x: 0,
      y: 0,
      pressed: false,
      radius: MOUSE_RADIUS,
    };

    window.addEventListener("resize", (event) => {
      this.resize(event.target.window.innerWidth, event.target.window.innerHeight);
    });
    window.addEventListener("mousemove", (event) => {
      if (this.mouse.pressed) {
        this.mouse.x = event.x;
        this.mouse.y = event.y;
      }
    });
    window.addEventListener("mousedown", (event) => {
      this.mouse.pressed = true;
      this.mouse.x = event.x;
      this.mouse.y = event.y;
    });
    window.addEventListener("mouseup", (event) => {
      this.mouse.pressed = false;
    });
  }

  configureContext() {
    const ctx = this.canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.5, "magenta");
    gradient.addColorStop(1, "blue");
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "white";
  }

  resize(newWidth, newHeight) {
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;
    this.width = newWidth;
    this.height = newHeight;
    // Context is reset to defaults when resized, so we need to re-configure
    // it each time we change the size:
    this.configureContext();
    // Redistribute particles to fit new area:
    this.particles.forEach((particle) => particle.resetPosition());
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
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const effect = new Effect(canvas);
effect.configureContext();

// Entry point
function animate() {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.handleParticles(ctx);
  requestAnimationFrame(animate);
}

animate();
