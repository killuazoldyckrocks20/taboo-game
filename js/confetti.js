/**
 * TABOO GAME - CONFETTI ANIMATION ENGINE
 * Ultra-smooth, canvas-based, multi-color particle burst.
 */

const ConfettiEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,
  isActive: false,

  init: function() {
    this.canvas = document.getElementById("confetti-canvas");
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.canvas.id = "confetti-canvas";
      this.canvas.style.position = "fixed";
      this.canvas.style.top = "0";
      this.canvas.style.left = "0";
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.canvas.style.pointerEvents = "none";
      this.canvas.style.zIndex = "9999";
      document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
  },

  resize: function() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  },

  fire: function(duration = 4000) {
    if (!this.canvas) this.init();
    this.resize();
    this.particles = [];
    this.isActive = true;

    const colors = [
      "#f97316", "#3b82f6", "#10b981", "#ec4899", 
      "#8b5cf6", "#eab308", "#06b6d4", "#f43f5e"
    ];

    const particleCount = 160;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 300,
        y: window.innerHeight * 0.4 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.35,
        drag: 0.96,
        opacity: 1
      });
    }

    if (this.animationId) cancelAnimationFrame(this.animationId);
    const startTime = performance.now();

    const loop = (time) => {
      const elapsed = time - startTime;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let aliveCount = 0;
      for (let p of this.particles) {
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rSpeed;

        if (elapsed > duration - 1000) {
          p.opacity = Math.max(0, 1 - (elapsed - (duration - 1000)) / 1000);
        }

        if (p.opacity > 0 && p.y < window.innerHeight + 50) {
          aliveCount++;
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate((p.rotation * Math.PI) / 180);
          this.ctx.globalAlpha = p.opacity;
          this.ctx.fillStyle = p.color;
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          this.ctx.restore();
        }
      }

      if (aliveCount > 0 && elapsed < duration) {
        this.animationId = requestAnimationFrame(loop);
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.isActive = false;
      }
    };

    this.animationId = requestAnimationFrame(loop);
  },

  stop: function() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.isActive = false;
  }
};
