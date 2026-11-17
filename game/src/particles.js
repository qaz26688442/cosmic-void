// Particle & Floating Text System
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
  }

  reset() {
    this.particles.length = 0;
    this.floatingTexts.length = 0;
  }

  addExplosion(x, y, color = '#00f0ff', count = 24, speedMult = 1.0) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 160 + 40) * speedMult;
      const life = Math.random() * 0.4 + 0.3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1.5,
        color,
        life,
        maxLife: life,
        spark: Math.random() > 0.5,
      });
    }
  }

  addThruster(x, y, angle) {
    const spread = (Math.random() - 0.5) * 0.4;
    const speed = Math.random() * 80 + 60;
    const pAngle = angle + Math.PI + spread;
    this.particles.push({
      x,
      y,
      vx: Math.cos(pAngle) * speed,
      vy: Math.sin(pAngle) * speed,
      radius: Math.random() * 2.5 + 1,
      color: Math.random() > 0.3 ? '#00f0ff' : '#ff0077',
      life: 0.2,
      maxLife: 0.2,
      spark: false,
    });
  }

  addText(text, x, y, color = '#ffe600') {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -45,
      color,
      life: 0.8,
      maxLife: 0.8,
    });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const ft of this.floatingTexts) {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 15px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }
}
