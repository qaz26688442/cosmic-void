// Deterministic Screenshot Stager for make.fun Judge
import { CANVAS_WIDTH, CANVAS_HEIGHT, ENEMY_TYPES, POWERUP_TYPES } from './config.js';
import { STATE_TITLE, STATE_PLAY, STATE_GAMEOVER } from './world.js';
import { Enemy, Projectile, Powerup } from './entities.js';

export function stageShot(name, world) {
  world.reset();

  if (name === 'start') {
    world.gameState = STATE_TITLE;
    world.highScore = 24800;
    return;
  }

  if (name === 'combat') {
    world.gameState = STATE_PLAY;
    world.score = 4250;
    world.wave = 3;
    world.player.x = 380;
    world.player.y = 420;
    world.player.angle = -Math.PI / 2.2;
    world.player.health = 85;
    world.player.shield = 65;
    world.player.activePowerup = 'TRIPLE_LASER';
    world.player.powerupTimer = 8.5;

    // Add several enemies
    world.enemies.push(new Enemy(280, 160, ENEMY_TYPES.STALKER));
    world.enemies.push(new Enemy(460, 130, ENEMY_TYPES.SCOUT));
    world.enemies.push(new Enemy(180, 220, ENEMY_TYPES.ASTEROID));
    world.enemies.push(new Enemy(560, 200, ENEMY_TYPES.SCOUT));

    // Add player projectiles
    world.projectiles.push(new Projectile(360, 360, -40, -500, true, '#00f0ff', 4, 30));
    world.projectiles.push(new Projectile(380, 350, 0, -520, true, '#00f0ff', 4, 30));
    world.projectiles.push(new Projectile(400, 360, 40, -500, true, '#00f0ff', 4, 30));

    // Add explosion and floating score
    world.particles.addExplosion(460, 180, '#00ff88', 20, 1.2);
    world.particles.addText('+250', 460, 160, '#00ff88');

    // Add powerup
    world.powerups.push(new Powerup(320, 260, POWERUP_TYPES.SHIELD_BOOST));
    return;
  }

  if (name === 'boss') {
    world.gameState = STATE_PLAY;
    world.score = 14600;
    world.wave = 5;
    world.player.x = 400;
    world.player.y = 490;
    world.player.angle = -Math.PI / 2;
    world.player.health = 70;
    world.player.shield = 40;
    world.player.empCount = 1;

    // Void Boss & Cruiser escort
    const boss = new Enemy(400, 180, ENEMY_TYPES.VOID_BOSS);
    boss.health = 540;
    world.enemies.push(boss);

    world.enemies.push(new Enemy(180, 260, ENEMY_TYPES.CRUISER));
    world.enemies.push(new Enemy(620, 260, ENEMY_TYPES.CRUISER));

    // Boss plasma bullets
    world.projectiles.push(new Projectile(370, 240, -50, 240, false, '#9d00ff', 6, 20));
    world.projectiles.push(new Projectile(430, 240, 50, 240, false, '#9d00ff', 6, 20));

    // Player lasers
    world.projectiles.push(new Projectile(400, 430, 0, -600, true, '#ff0077', 5, 45));

    world.particles.addExplosion(400, 200, '#ffe600', 24, 1.5);
    world.particles.addText('BOSS BATTLE: VOID CORE', CANVAS_WIDTH / 2, 75, '#ff0077');
    return;
  }

  if (name === 'end') {
    world.gameState = STATE_GAMEOVER;
    world.score = 18750;
    world.stats.wavesCleared = 4;
    world.stats.enemiesKilled = 68;
    world.stats.shotsFired = 310;
    world.stats.shotsHit = 254;
    return;
  }
}
