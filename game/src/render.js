// Renderer: Cyberpunk Neon Space Visuals, HUD, and Screens
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './config.js';
import { STATE_TITLE, STATE_PLAY, STATE_GAMEOVER, STATE_VICTORY } from './world.js';

export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.stars = [];
    this.nebulaStars = [];
    this.initStarfield();
  }

  initStarfield() {
    this.stars = [];
    for (let i = 0; i < 120; i++) {
      this.stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        radius: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 25 + 10,
      });
    }
    for (let i = 0; i < 30; i++) {
      this.nebulaStars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        radius: Math.random() * 4 + 2,
        color: Math.random() > 0.5 ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 0, 119, 0.15)',
      });
    }
  }

  updateStarfield(dt) {
    for (const star of this.stars) {
      star.y += star.speed * dt;
      if (star.y > CANVAS_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * CANVAS_WIDTH;
      }
    }
  }

  draw(world) {
    const ctx = this.ctx;
    ctx.save();

    // Screen Shake
    if (world.screenShake > 0) {
      const shakeMag = world.screenShake * 16;
      ctx.translate((Math.random() - 0.5) * shakeMag, (Math.random() - 0.5) * shakeMag);
    }

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Nebula dust
    for (const n of this.nebulaStars) {
      ctx.fillStyle = n.color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stars
    for (const s of this.stars) {
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Powerups
    for (const pw of world.powerups) {
      this.drawPowerup(pw);
    }

    // Projectiles
    for (const proj of world.projectiles) {
      this.drawProjectile(proj);
    }

    // Enemies
    for (const enemy of world.enemies) {
      this.drawEnemy(enemy);
    }

    // Player
    if (world.gameState === STATE_PLAY || world.gameState === STATE_TITLE) {
      this.drawPlayer(world.player);
    }

    // Particles & Text
    world.particles.draw(ctx);

    // Overlays / HUD
    if (world.gameState === STATE_PLAY) {
      this.drawHUD(world);
    } else if (world.gameState === STATE_TITLE) {
      this.drawTitleScreen(world);
    } else if (world.gameState === STATE_GAMEOVER) {
      this.drawGameOverScreen(world);
    }

    ctx.restore();
  }

  drawPlayer(p) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    // Shield bubble
    if (p.shield > 0) {
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.3 + (p.shield / p.maxShield) * 0.4})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Ship body
    ctx.fillStyle = '#0a1628';
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(p.radius + 4, 0);
    ctx.lineTo(-p.radius, -p.radius + 3);
    ctx.lineTo(-p.radius * 0.5, 0);
    ctx.lineTo(-p.radius, p.radius - 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath();
    ctx.arc(2, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawEnemy(e) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);

    ctx.strokeStyle = e.color;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = '#100c1e';

    if (e.type === 'SCOUT') {
      ctx.beginPath();
      ctx.moveTo(e.radius, 0);
      ctx.lineTo(-e.radius, -e.radius * 0.7);
      ctx.lineTo(-e.radius * 0.4, 0);
      ctx.lineTo(-e.radius, e.radius * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (e.type === 'STALKER') {
      ctx.beginPath();
      ctx.moveTo(e.radius * 1.2, 0);
      ctx.lineTo(-e.radius, -e.radius);
      ctx.lineTo(0, 0);
      ctx.lineTo(-e.radius, e.radius);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (e.type === 'ASTEROID') {
      ctx.beginPath();
      const points = 7;
      for (let i = 0; i < points; i++) {
        const rad = (i / points) * Math.PI * 2;
        const dist = e.radius * (0.8 + Math.sin(i * 3) * 0.2);
        const px = Math.cos(rad) * dist;
        const py = Math.sin(rad) * dist;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (e.type === 'CRUISER' || e.type === 'VOID_BOSS') {
      ctx.beginPath();
      ctx.rect(-e.radius, -e.radius * 0.7, e.radius * 2, e.radius * 1.4);
      ctx.fill();
      ctx.stroke();

      // Boss shield/core
      ctx.fillStyle = COLORS.secondary;
      ctx.beginPath();
      ctx.arc(0, 0, e.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Health bar above enemy
    if (e.health < e.maxHealth) {
      const barW = e.radius * 2;
      const barH = 4;
      ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
      ctx.fillRect(-barW / 2, -e.radius - 10, barW, barH);
      ctx.fillStyle = COLORS.emerald;
      ctx.fillRect(-barW / 2, -e.radius - 10, barW * (e.health / e.maxHealth), barH);
    }

    ctx.restore();
  }

  drawProjectile(p) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawPowerup(pw) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(pw.x, pw.y);
    const scale = 1 + Math.sin(pw.pulse) * 0.15;
    ctx.scale(scale, scale);

    ctx.strokeStyle = pw.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, pw.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = pw.color;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', 0, 0);

    ctx.restore();
  }

  drawHUD(world) {
    const ctx = this.ctx;
    const p = world.player;

    // Top Status Bar
    ctx.fillStyle = COLORS.hudBg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 48);
    ctx.strokeStyle = '#1e2d4a';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, 48);

    // Health Bar
    ctx.fillStyle = '#333';
    ctx.fillRect(16, 12, 140, 10);
    ctx.fillStyle = COLORS.secondary;
    ctx.fillRect(16, 12, 140 * (p.health / p.maxHealth), 10);
    ctx.fillStyle = COLORS.white;
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText(`HP: ${Math.round(p.health)}`, 16, 32);

    // Shield Bar
    ctx.fillStyle = '#333';
    ctx.fillRect(170, 12, 140, 10);
    ctx.fillStyle = COLORS.primary;
    ctx.fillRect(170, 12, 140 * (p.shield / p.maxShield), 10);
    ctx.fillText(`SHIELD: ${Math.round(p.shield)}`, 170, 32);

    // EMP Charges
    ctx.fillStyle = COLORS.accent;
    ctx.fillText(`EMP [B]: ${p.empCount}`, 330, 24);

    // Wave & Score
    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText(`SCORE: ${world.score}`, CANVAS_WIDTH - 20, 22);
    ctx.fillStyle = COLORS.emerald;
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(`WAVE: ${world.wave}`, CANVAS_WIDTH - 20, 38);
    ctx.textAlign = 'left';

    // Active powerup badge
    if (p.activePowerup) {
      ctx.fillStyle = COLORS.accent;
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText(`ACTIVE: ${p.activePowerup} (${Math.ceil(p.powerupTimer)}s)`, 16, 70);
    }
  }

  drawTitleScreen(world) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(6, 8, 20, 0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Game Title with Cyber Glow
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.primary;
    ctx.shadowColor = COLORS.primary;
    ctx.shadowBlur = 18;
    ctx.font = 'bold 44px "Courier New", monospace';
    ctx.fillText('COSMIC VOID', CANVAS_WIDTH / 2, 190);

    ctx.fillStyle = COLORS.secondary;
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.shadowBlur = 10;
    ctx.fillText('NEON ORBITAL DEFENDER', CANVAS_WIDTH / 2, 230);
    ctx.shadowBlur = 0;

    // Instructions
    ctx.fillStyle = COLORS.white;
    ctx.font = '14px "Courier New", monospace';
    ctx.fillText('WASD / ARROW KEYS : Move Ship', CANVAS_WIDTH / 2, 310);
    ctx.fillText('MOUSE AIM & CLICK / SPACE : Fire Lasers', CANVAS_WIDTH / 2, 335);
    ctx.fillText('[B] KEY : EMP Wave Shockwave', CANVAS_WIDTH / 2, 360);

    // Start button
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText('▶ CLICK OR PRESS SPACE / ENTER TO START', CANVAS_WIDTH / 2, 440);

    if (world.highScore > 0) {
      ctx.fillStyle = COLORS.emerald;
      ctx.font = '13px "Courier New", monospace';
      ctx.fillText(`HIGH SCORE: ${world.highScore}`, CANVAS_WIDTH / 2, 480);
    }

    ctx.restore();
  }

  drawGameOverScreen(world) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(10, 6, 20, 0.88)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.secondary;
    ctx.shadowColor = COLORS.secondary;
    ctx.shadowBlur = 20;
    ctx.font = 'bold 46px "Courier New", monospace';
    ctx.fillText('MISSION FAILED', CANVAS_WIDTH / 2, 180);
    ctx.shadowBlur = 0;

    ctx.fillStyle = COLORS.white;
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText(`FINAL SCORE: ${world.score}`, CANVAS_WIDTH / 2, 250);
    ctx.fillText(`WAVES CLEARED: ${world.stats.wavesCleared}`, CANVAS_WIDTH / 2, 280);
    ctx.fillText(`ENEMIES DESTROYED: ${world.stats.enemiesKilled}`, CANVAS_WIDTH / 2, 310);

    const accuracy = world.stats.shotsFired > 0 ? Math.round((world.stats.shotsHit / world.stats.shotsFired) * 100) : 0;
    ctx.fillText(`WEAPON ACCURACY: ${accuracy}%`, CANVAS_WIDTH / 2, 340);

    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText('▶ PRESS [R] OR [ENTER] TO RESTART', CANVAS_WIDTH / 2, 420);

    ctx.restore();
  }
}
