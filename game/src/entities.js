// Game Entities: Player, Enemies, Projectiles, and Powerups
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_CONFIG, ENEMY_TYPES, POWERUP_TYPES } from './config.js';

export class PlayerShip {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = -Math.PI / 2;
    this.radius = PLAYER_CONFIG.radius;
    this.health = PLAYER_CONFIG.maxHealth;
    this.maxHealth = PLAYER_CONFIG.maxHealth;
    this.shield = PLAYER_CONFIG.maxShield;
    this.maxShield = PLAYER_CONFIG.maxShield;
    this.shieldCooldown = 0;
    this.fireTimer = 0;
    this.activePowerup = null;
    this.powerupTimer = 0;
    this.empCount = 2;
  }

  takeDamage(amount) {
    this.shieldCooldown = PLAYER_CONFIG.shieldRegenDelay;
    if (this.shield > 0) {
      if (this.shield >= amount) {
        this.shield -= amount;
        return true;
      } else {
        const remaining = amount - this.shield;
        this.shield = 0;
        this.health = Math.max(0, this.health - remaining);
        return false;
      }
    } else {
      this.health = Math.max(0, this.health - amount);
      return false;
    }
  }

  update(dt, input) {
    const { dx, dy } = input.getMovement();
    const targetVx = dx * PLAYER_CONFIG.speed;
    const targetVy = dy * PLAYER_CONFIG.speed;

    this.vx += (targetVx - this.vx) * 0.15;
    this.vy += (targetVy - this.vy) * 0.15;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Keep within bounds
    const margin = this.radius + 6;
    this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));
    this.y = Math.max(margin, Math.min(CANVAS_HEIGHT - margin, this.y));

    // Turn toward mouse
    const aimDx = input.mouse.x - this.x;
    const aimDy = input.mouse.y - this.y;
    if (Math.hypot(aimDx, aimDy) > 8) {
      this.angle = Math.atan2(aimDy, aimDx);
    }

    // Shield regen
    if (this.shieldCooldown > 0) {
      this.shieldCooldown -= dt;
    } else if (this.shield < this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + PLAYER_CONFIG.shieldRegenRate * dt);
    }

    // Powerup countdown
    if (this.powerupTimer > 0) {
      this.powerupTimer -= dt;
      if (this.powerupTimer <= 0) {
        this.activePowerup = null;
      }
    }

    if (this.fireTimer > 0) {
      this.fireTimer -= dt;
    }
  }
}

export class Projectile {
  constructor(x, y, vx, vy, isPlayer = true, color = '#00f0ff', radius = 3.5, damage = 25) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.isPlayer = isPlayer;
    this.color = color;
    this.radius = radius;
    this.damage = damage;
    this.active = true;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.x < -20 || this.x > CANVAS_WIDTH + 20 || this.y < -20 || this.y > CANVAS_HEIGHT + 20) {
      this.active = false;
    }
  }
}

export class Enemy {
  constructor(x, y, config) {
    this.x = x;
    this.y = y;
    this.type = config.type;
    this.radius = config.radius;
    this.speed = config.speed;
    this.health = config.health;
    this.maxHealth = config.health;
    this.score = config.score;
    this.color = config.color;
    this.fireTimer = Math.random() * (config.fireRate || 2);
    this.fireRate = config.fireRate || 2;
    this.angle = 0;
    this.active = true;
    this.pulse = 0;
  }

  update(dt, playerX, playerY) {
    this.pulse += dt * 3;
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);

    this.angle = Math.atan2(dy, dx);

    if (dist > 10) {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    }

    if (this.fireRate) {
      this.fireTimer += dt;
    }
  }
}

export class Powerup {
  constructor(x, y, config) {
    this.x = x;
    this.y = y;
    this.type = config.type;
    this.label = config.label;
    this.color = config.color;
    this.radius = 12;
    this.active = true;
    this.life = 12.0;
    this.pulse = 0;
  }

  update(dt) {
    this.life -= dt;
    this.pulse += dt * 4;
    if (this.life <= 0) {
      this.active = false;
    }
  }
}
