// Main Entrypoint and Game Loop
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { World } from './world.js';
import { Renderer } from './render.js';
import { InputController } from './input.js';
import { stageShot } from './shots.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const ctx = canvas.getContext('2d');
  const world = new World();
  const renderer = new Renderer(ctx);
  const input = new InputController(canvas);

  const urlParams = new URLSearchParams(window.location.search);
  const shotName = urlParams.get('shot');

  if (shotName) {
    stageShot(shotName, world);
    renderer.updateStarfield(0.1);
    renderer.draw(world);
    return;
  }

  let lastTime = performance.now();

  function gameLoop(now) {
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;

    world.update(dt, input);
    renderer.updateStarfield(dt);
    renderer.draw(world);

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});
