// World State, Wave Progression, and Collision Management
import { CANVAS_WIDTH, CANVAS_HEIGHT, ENEMY_TYPES, POWERUP_TYPES } from './config.js';
import { PlayerShip, Projectile, Enemy, Powerup } from './entities.js';
import { ParticleSystem } from './particles.js';
import { playLaser, playExplosion, playPowerup, playHit } from './audio.js';

export const STATE_TITLE = 0;
export const STATE_PLAY = 1;
export const STATE_GAMEOVER = 2;
export const STATE_VICTORY = 3;

export class World {
  constructor() {
    this.player = new PlayerShip(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.enemies = [];
    this.projectiles = [];
    this.powerups = [];
    this.particles = new ParticleSystem();

    this.gameState = STATE_TITLE;
    this.score = 0;
    this.highScore = 0;
    this.wave = 1;
    this.waveTimer = 0;
    this.waveActive = false;
    this.enemiesRemainingInWave = 0;
    this.spawnTimer = 0;
    this.screenShake = 0;

    this.stats = {
      shotsFired: 0,
      shotsHit: 0,
      enemiesKilled: 0,
      wavesCleared: 0,
    };
  }

  reset() {
    this.player = new PlayerShip(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.enemies = [];
    this.projectiles = [];
    this.powerups = [];
    this.particles.reset();

    this.score = 0;
    this.wave = 1;
    this.waveTimer = 0;
    this.waveActive = false;
    this.enemiesRemainingInWave = 0;
    this.spawnTimer = 0;
    this.screenShake = 0;

    this.stats = {
      shotsFired: 0,
      shotsHit: 0,
      enemiesKilled: 0,
      wavesCleared: 0,
    };
  }

  startWave(waveNum) {
    this.wave = waveNum;
    this.waveActive = true;
    this.enemiesRemainingInWave = 8 + waveNum * 4;
    this.spawnTimer = 0.5;
  }

  spawnEnemy() {
    const isBossWave = this.wave % 5 === 0;
    let config = ENEMY_TYPES.SCOUT;

    if (isBossWave && this.enemiesRemainingInWave === 1 && !this.enemies.some(e => e.type === 'VOID_BOSS')) {
      config = ENEMY_TYPES.VOID_BOSS;
    } else {
      const roll = Math.random();
      if (this.wave >= 4 && roll < 0.25) {
        config = ENEMY_TYPES.CRUISER;
      } else if (this.wave >= 2 && roll < 0.55) {
        config = ENEMY_TYPES.STALKER;
      } else if (roll < 0.8) {
        config = ENEMY_TYPES.ASTEROID;
      }
    }

    // Spawn along edge
    let x = 0;
    let y = 0;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? -30 : CANVAS_WIDTH + 30;
      y = Math.random() * CANVAS_HEIGHT;
    } else {
      x = Math.random() * CANVAS_WIDTH;
      y = Math.random() < 0.5 ? -30 : CANVAS_HEIGHT + 30;
    }

    this.enemies.push(new Enemy(x, y, config));
    this.enemiesRemainingInWave--;
  }

  triggerEmp() {
    if (this.player.empCount <= 0) return;
    this.player.empCount--;
    this.screenShake = 0.5;
    playExplosion(true);

    for (const enemy of this.enemies) {
      this.particles.addExplosion(enemy.x, enemy.y, '#ffe600', 16);
      enemy.health -= 120;
    }
    this.particles.addText('EMP PULSE!', this.player.x, this.player.y - 20, '#ffe600');
  }

  firePlayerWeapons() {
    const p = this.player;
    if (p.fireTimer > 0) return;

    const isRapid = p.activePowerup === 'OVERDRIVE';
    p.fireTimer = isRapid ? 0.08 : 0.15;
    this.stats.shotsFired++;
    playLaser(isRapid ? 1100 : 880);

    const speed = 600;
    const cos = Math.cos(p.angle);
    const sin = Math.sin(p.angle);

    if (p.activePowerup === 'TRIPLE_LASER') {
      const angles = [-0.18, 0, 0.18];
      for (const a of angles) {
        const rad = p.angle + a;
        this.projectiles.push(
          new Projectile(p.x, p.y, Math.cos(rad) * speed, Math.sin(rad) * speed, true, '#00f0ff', 4, 30)
        );
      }
    } else {
      this.projectiles.push(
        new Projectile(p.x, p.y, cos * speed, sin * speed, true, isRapid ? '#ff0077' : '#00f0ff', isRapid ? 4.5 : 3.5, 35)
      );
    }
  }

  update(dt, input) {
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 2.5);
    }

    if (this.gameState === STATE_TITLE) {
      if (input.isRestartTriggered() || input.isFiring()) {
        this.gameState = STATE_PLAY;
        this.reset();
        this.startWave(1);
      }
      return;
    }

    if (this.gameState === STATE_GAMEOVER || this.gameState === STATE_VICTORY) {
      if (input.isRestartTriggered()) {
        this.gameState = STATE_PLAY;
        this.reset();
        this.startWave(1);
      }
      return;
    }

    // Player update
    this.player.update(dt, input);
    if (input.getMovement().dx !== 0 || input.getMovement().dy !== 0) {
      this.particles.addThruster(this.player.x, this.player.y, this.player.angle);
    }

    if (input.isFiring()) {
      this.firePlayerWeapons();
    }

    if (input.isEmpTriggered()) {
      this.triggerEmp();
    }

    // Wave spawning
    if (this.waveActive) {
      if (this.enemiesRemainingInWave > 0) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          this.spawnEnemy();
          this.spawnTimer = Math.max(0.3, 1.4 - this.wave * 0.1);
        }
      } else if (this.enemies.length === 0) {
        this.waveActive = false;
        this.stats.wavesCleared++;
        this.particles.addText(`WAVE ${this.wave} CLEARED!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#00ff88');
        setTimeout(() => {
          if (this.gameState === STATE_PLAY) {
            this.startWave(this.wave + 1);
          }
        }, 1500);
      }
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt);
      if (!proj.active) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check hit against enemies
      if (proj.isPlayer) {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          if (Math.hypot(proj.x - enemy.x, proj.y - enemy.y) < proj.radius + enemy.radius) {
            proj.active = false;
            enemy.health -= proj.damage;
            this.stats.shotsHit++;
            playHit();
            this.particles.addExplosion(proj.x, proj.y, proj.color, 6, 0.6);

            if (enemy.health <= 0) {
              enemy.active = false;
              this.stats.enemiesKilled++;
              this.score += enemy.score;
              this.particles.addExplosion(enemy.x, enemy.y, enemy.color, 18, 1.2);
              this.particles.addText(`+${enemy.score}`, enemy.x, enemy.y, '#00ff88');
              playExplosion(enemy.type === 'VOID_BOSS');

              // Random powerup drop
              if (Math.random() < 0.22) {
                const keys = Object.keys(POWERUP_TYPES);
                const pType = POWERUP_TYPES[keys[Math.floor(Math.random() * keys.length)]];
                this.powerups.push(new Powerup(enemy.x, enemy.y, pType));
              }
              this.enemies.splice(j, 1);
            }
            break;
          }
        }
      } else {
        // Enemy bullet hit player
        if (Math.hypot(proj.x - this.player.x, proj.y - this.player.y) < proj.radius + this.player.radius) {
          proj.active = false;
          this.player.takeDamage(proj.damage);
          this.screenShake = 0.25;
          playHit();
          this.particles.addExplosion(this.player.x, this.player.y, '#ff0077', 10);
        }
      }
    }

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, this.player.x, this.player.y);

      // Enemy fire
      if (enemy.fireRate && enemy.fireTimer >= enemy.fireRate) {
        enemy.fireTimer = 0;
        const speed = 240;
        const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
        this.projectiles.push(
          new Projectile(enemy.x, enemy.y, Math.cos(angle) * speed, Math.sin(angle) * speed, false, enemy.color, 4, 15)
        );
      }

      // Enemy collide with player
      if (Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y) < enemy.radius + this.player.radius) {
        this.player.takeDamage(30);
        enemy.health -= 50;
        this.screenShake = 0.4;
        playExplosion(false);
        this.particles.addExplosion(this.player.x, this.player.y, '#ff0077', 14);

        if (enemy.health <= 0) {
          this.enemies.splice(i, 1);
        }
      }
    }

    // Update Powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pw = this.powerups[i];
      pw.update(dt);
      if (!pw.active) {
        this.powerups.splice(i, 1);
        continue;
      }

      if (Math.hypot(pw.x - this.player.x, pw.y - this.player.y) < pw.radius + this.player.radius) {
        playPowerup();
        this.particles.addText(pw.label, this.player.x, this.player.y - 25, pw.color);
        this.particles.addExplosion(pw.x, pw.y, pw.color, 12);

        if (pw.type === 'SHIELD_BOOST') {
          this.player.shield = this.player.maxShield;
        } else if (pw.type === 'EMP_BOMB') {
          this.player.empCount = Math.min(3, this.player.empCount + 1);
        } else {
          this.player.activePowerup = pw.type;
          this.player.powerupTimer = POWERUP_TYPES[pw.type].duration;
        }
        this.powerups.splice(i, 1);
      }
    }

    // Check player death
    if (this.player.health <= 0) {
      this.gameState = STATE_GAMEOVER;
      this.screenShake = 0.6;
      playExplosion(true);
      this.particles.addExplosion(this.player.x, this.player.y, '#ff0077', 36, 1.8);
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
    }

    // Particles update
    this.particles.update(dt);
  }
}
