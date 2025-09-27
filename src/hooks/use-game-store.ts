import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 20;
const PROJECTILE_WIDTH = 4;
const PROJECTILE_HEIGHT = 12;
const ENEMY_SIZE = 30;
const ASTEROID_SIZES = [20, 40, 60];
const ALLY_WIDTH = 28;
const ALLY_HEIGHT = 22;
export const LASER_COOLDOWN = 15000; // 15 seconds
const LASER_DURATION = 5000; // 5 seconds
type GameStatus = 'menu' | 'playing' | 'gameOver';
interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
}
interface Player extends GameObject {
  invincible: boolean;
}
type Ally = Omit<GameObject, 'vx' | 'vy'>;
interface Explosion {
    id: string;
    x: number;
    y: number;
    size: number;
    life: number;
}
interface Laser {
    active: boolean;
    y: number;
    startY: number;
    expiresAt: number;
    opacity: number;
}
interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  player: Player;
  enemyAlly: Ally;
  asteroidAlly: Ally;
  projectiles: GameObject[];
  enemies: GameObject[];
  asteroids: GameObject[];
  explosions: Explosion[];
  laser: Laser;
  keys: { [key: string]: boolean };
  lastEnemySpawn: number;
  lastAsteroidSpawn: number;
  lastShotTime: number;
  lastEnemyAllyShotTime: number;
  lastAsteroidAllyShotTime: number;
  lastLaserTime: number;
  invincibilityTimer: number;
  difficulty: number;
  lastUpdateTime: number;
}
interface GameActions {
  startGame: () => void;
  update: (timestamp: number) => void;
  handleKeyDown: (key: string) => void;
  handleKeyUp: (key: string) => void;
}
const initialState: GameState = {
  status: 'menu',
  score: 0,
  lives: 3,
  player: {
    id: 'player',
    x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: GAME_HEIGHT - PLAYER_HEIGHT - 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    invincible: false,
  },
  enemyAlly: {
    id: 'enemyAlly',
    x: GAME_WIDTH / 2 - ALLY_WIDTH / 2 - 40,
    y: GAME_HEIGHT - PLAYER_HEIGHT - 20 - ALLY_HEIGHT - 10,
    width: ALLY_WIDTH,
    height: ALLY_HEIGHT,
  },
  asteroidAlly: {
    id: 'asteroidAlly',
    x: GAME_WIDTH / 2 - ALLY_WIDTH / 2 + 40,
    y: GAME_HEIGHT - PLAYER_HEIGHT - 20 - ALLY_HEIGHT - 10,
    width: ALLY_WIDTH,
    height: ALLY_HEIGHT,
  },
  projectiles: [],
  enemies: [],
  asteroids: [],
  explosions: [],
  laser: {
    active: false,
    y: 0,
    startY: 0,
    expiresAt: 0,
    opacity: 0,
  },
  keys: {},
  lastEnemySpawn: 0,
  lastAsteroidSpawn: 0,
  lastShotTime: 0,
  lastEnemyAllyShotTime: 0,
  lastAsteroidAllyShotTime: 0,
  lastLaserTime: 0,
  invincibilityTimer: 0,
  difficulty: 1,
  lastUpdateTime: 0,
};
export const useGameStore = create<GameState & GameActions>((set) => ({
  ...initialState,
  startGame: () => {
    set({
      ...initialState,
      status: 'playing',
      player: { ...initialState.player, invincible: true },
      invincibilityTimer: 2000,
    });
  },
  handleKeyDown: (key) => set((state) => ({ keys: { ...state.keys, [key.toLowerCase()]: true } })),
  handleKeyUp: (key) => set((state) => ({ keys: { ...state.keys, [key.toLowerCase()]: false } })),
  update: (timestamp) => {
    set((state) => {
      if (state.status !== 'playing') return state;
      if (state.lastUpdateTime === 0) {
        return { ...state, lastUpdateTime: timestamp };
      }
      const deltaTime = (timestamp - state.lastUpdateTime);
      let {
        keys, player, enemyAlly, asteroidAlly, projectiles, enemies, asteroids, lives, invincibilityTimer, difficulty, score, explosions, lastShotTime, lastEnemyAllyShotTime, lastAsteroidAllyShotTime, lastEnemySpawn, lastAsteroidSpawn, laser, lastLaserTime
      } = state;
      // Create mutable copies for this frame's updates
      let newPlayer = { ...player };
      let newEnemyAlly = { ...enemyAlly };
      let newAsteroidAlly = { ...asteroidAlly };
      let newProjectiles = [...projectiles];
      let newEnemies = [...enemies];
      let newAsteroids = [...asteroids];
      let newExplosions = [...explosions];
      let newLaser = { ...laser };
      let newScore = score;
      let newLives = lives;
      let newLastLaserTime = lastLaserTime;
      let newLastEnemyAllyShotTime = lastEnemyAllyShotTime;
      let newLastAsteroidAllyShotTime = lastAsteroidAllyShotTime;
      // Player movement
      const playerSpeed = 300 / 1000; // pixels per millisecond
      if (keys['w'] || keys['arrowup']) newPlayer.y -= playerSpeed * deltaTime;
      if (keys['s'] || keys['arrowdown']) newPlayer.y += playerSpeed * deltaTime;
      if (keys['a'] || keys['arrowleft']) newPlayer.x -= playerSpeed * deltaTime;
      if (keys['d'] || keys['arrowright']) newPlayer.x += playerSpeed * deltaTime;
      newPlayer.x = Math.max(0, Math.min(GAME_WIDTH - newPlayer.width, newPlayer.x));
      newPlayer.y = Math.max(0, Math.min(GAME_HEIGHT - newPlayer.height, newPlayer.y));
      // Enemy Ally movement (sinusoidal pattern around the player)
      const enemyAllyVerticalOffset = -ALLY_HEIGHT - 20;
      const enemyAllyHorizontalRange = 60;
      newEnemyAlly.y = newPlayer.y + enemyAllyVerticalOffset;
      newEnemyAlly.x = newPlayer.x + (newPlayer.width / 2) - (newEnemyAlly.width / 2) + Math.sin(timestamp / 800) * enemyAllyHorizontalRange;
      newEnemyAlly.x = Math.max(0, Math.min(GAME_WIDTH - newEnemyAlly.width, newEnemyAlly.x));
      newEnemyAlly.y = Math.max(0, Math.min(GAME_HEIGHT - newEnemyAlly.height, newEnemyAlly.y));
      // Asteroid Ally movement (patrolling)
      const patrolSpeed = 150;
      const patrolRange = GAME_WIDTH / 2 - ALLY_WIDTH / 2;
      newAsteroidAlly.x = GAME_WIDTH / 2 - ALLY_WIDTH / 2 + Math.sin(timestamp / (patrolSpeed * 10)) * patrolRange;
      newAsteroidAlly.y = GAME_HEIGHT * 0.6 + Math.cos(timestamp / (patrolSpeed * 5)) * 30;
      // Enemy Ally targeting and shooting (spread shot)
      const enemyAllyShootCooldown = 1000;
      if (timestamp - newLastEnemyAllyShotTime > enemyAllyShootCooldown && newEnemies.length > 0) {
        let closestEnemy: GameObject | null = null;
        let minDistance = Infinity;
        const allyCenterX = newEnemyAlly.x + newEnemyAlly.width / 2;
        const allyCenterY = newEnemyAlly.y + newEnemyAlly.height / 2;
        for (const enemy of newEnemies) {
          const enemyCenterX = enemy.x + enemy.width / 2;
          const enemyCenterY = enemy.y + enemy.height / 2;
          const distance = Math.sqrt(Math.pow(enemyCenterX - allyCenterX, 2) + Math.pow(enemyCenterY - allyCenterY, 2));
          if (distance < minDistance) {
            minDistance = distance;
            closestEnemy = enemy;
          }
        }
        if (closestEnemy) {
          const targetX = closestEnemy.x + closestEnemy.width / 2;
          const targetY = closestEnemy.y + closestEnemy.height / 2;
          const dx = targetX - allyCenterX;
          const dy = targetY - allyCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const projectileSpeed = 400 / 1000;
          const vx = (dx / distance) * projectileSpeed;
          const vy = (dy / distance) * projectileSpeed;
          const spreadAngles = [-0.3, -0.15, 0, 0.15, 0.3]; // Radians
          spreadAngles.forEach(angle => {
            const rotatedVx = vx * Math.cos(angle) - vy * Math.sin(angle);
            const rotatedVy = vx * Math.sin(angle) + vy * Math.cos(angle);
            newProjectiles.push({
              id: uuidv4(),
              x: allyCenterX - PROJECTILE_WIDTH / 2,
              y: newEnemyAlly.y,
              width: PROJECTILE_WIDTH,
              height: PROJECTILE_HEIGHT,
              vx: rotatedVx,
              vy: rotatedVy,
            });
          });
          newLastEnemyAllyShotTime = timestamp;
        }
      }
      // Asteroid Ally targeting and shooting
      const asteroidAllyShootCooldown = 500;
      if (timestamp - newLastAsteroidAllyShotTime > asteroidAllyShootCooldown && newAsteroids.length > 0) {
        let closestAsteroid: GameObject | null = null;
        let minDistance = Infinity;
        const allyCenterX = newAsteroidAlly.x + newAsteroidAlly.width / 2;
        const allyCenterY = newAsteroidAlly.y + newAsteroidAlly.height / 2;
        for (const asteroid of newAsteroids) {
          const asteroidCenterX = asteroid.x + asteroid.width / 2;
          const asteroidCenterY = asteroid.y + asteroid.height / 2;
          const distance = Math.sqrt(Math.pow(asteroidCenterX - allyCenterX, 2) + Math.pow(asteroidCenterY - allyCenterY, 2));
          if (distance < minDistance) {
            minDistance = distance;
            closestAsteroid = asteroid;
          }
        }
        if (closestAsteroid) {
          const targetX = closestAsteroid.x + closestAsteroid.width / 2;
          const targetY = closestAsteroid.y + closestAsteroid.height / 2;
          const dx = targetX - allyCenterX;
          const dy = targetY - allyCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const projectileSpeed = 500 / 1000;
          newProjectiles.push({
            id: uuidv4(),
            x: allyCenterX - PROJECTILE_WIDTH / 2,
            y: newAsteroidAlly.y,
            width: PROJECTILE_WIDTH,
            height: PROJECTILE_HEIGHT,
            vx: (dx / distance) * projectileSpeed,
            vy: (dy / distance) * projectileSpeed,
          });
          newLastAsteroidAllyShotTime = timestamp;
        }
      }
      // Player shooting (Spread Shot)
      const shootCooldown = 250;
      if (keys[' '] && timestamp - lastShotTime > shootCooldown) {
        const spreadAngles = [-2, -1, 0, 1, 2];
        const horizontalSpeed = 100 / 1000;
        const verticalSpeed = -600 / 1000;
        spreadAngles.forEach(angle => {
            newProjectiles.push({
                id: uuidv4(),
                x: newPlayer.x + newPlayer.width / 2 - PROJECTILE_WIDTH / 2,
                y: newPlayer.y,
                width: PROJECTILE_WIDTH,
                height: PROJECTILE_HEIGHT,
                vx: angle * horizontalSpeed,
                vy: verticalSpeed,
            });
        });
        lastShotTime = timestamp;
      }
      // Laser activation
      if (keys['l'] && !newLaser.active && (newLastLaserTime === 0 || timestamp - newLastLaserTime > LASER_COOLDOWN)) {
        newLaser.active = true;
        const startY = newPlayer.y + newPlayer.height / 2;
        newLaser.y = startY;
        newLaser.startY = startY;
        newLaser.expiresAt = timestamp + LASER_DURATION;
        newLaser.opacity = 1;
        newLastLaserTime = timestamp;
      }
      // Update projectiles
      newProjectiles = newProjectiles
        .map((p) => ({ ...p, x: p.x + p.vx * deltaTime, y: p.y + p.vy * deltaTime }))
        .filter((p) => p.y + p.height > 0 && p.y < GAME_HEIGHT && p.x + p.width > 0 && p.x < GAME_WIDTH);
      // Spawning
      const enemySpawnRate = Math.max(500, 2000 - difficulty * 100);
      if (timestamp - lastEnemySpawn > enemySpawnRate) {
        const speedMultiplier = 60 / 1000;
        newEnemies.push({
          id: uuidv4(),
          x: Math.random() * (GAME_WIDTH - ENEMY_SIZE),
          y: -ENEMY_SIZE,
          width: ENEMY_SIZE,
          height: ENEMY_SIZE,
          vx: 0,
          vy: (1 + Math.random() * difficulty) * speedMultiplier,
        });
        lastEnemySpawn = timestamp;
      }
      const asteroidSpawnRate = Math.max(1000, 3000 - difficulty * 150);
      if (timestamp - lastAsteroidSpawn > asteroidSpawnRate) {
        const size = ASTEROID_SIZES[Math.floor(Math.random() * ASTEROID_SIZES.length)];
        const speedMultiplier = 60 / 1000;
        newAsteroids.push({
          id: uuidv4(),
          x: Math.random() * (GAME_WIDTH - size),
          y: -size,
          width: size,
          height: size,
          vx: (Math.random() - 0.5) * 2 * speedMultiplier,
          vy: (1 + Math.random() * (difficulty / 2)) * speedMultiplier,
        });
        lastAsteroidSpawn = timestamp;
      }
      // Update enemies and asteroids
      newEnemies = newEnemies.map((e) => ({ ...e, y: e.y + e.vy * deltaTime })).filter((e) => e.y < GAME_HEIGHT);
      newAsteroids = newAsteroids.map((a) => ({ ...a, x: a.x + a.vx * deltaTime, y: a.y + a.vy * deltaTime })).filter((a) => a.y < GAME_HEIGHT);
      // Laser logic
      if (newLaser.active) {
        if (timestamp > newLaser.expiresAt) {
          newLaser.active = false;
          newLaser.opacity = 0;
        } else {
          const lifeRemaining = newLaser.expiresAt - timestamp;
          const lifePercentage = lifeRemaining / LASER_DURATION;
          newLaser.opacity = Math.max(0, Math.min(1, lifePercentage * 4));
          const progress = 1 - lifePercentage; // progress goes from 0 to 1
          newLaser.y = newLaser.startY * (1 - progress);
          const destroyedByLaserEnemies = new Set<string>();
          for (const e of newEnemies) {
            if (e.y < newLaser.y && e.y + e.height > newLaser.y) {
              destroyedByLaserEnemies.add(e.id);
              newScore += 50;
              newExplosions.push({ id: uuidv4(), x: e.x, y: e.y, size: e.width, life: 20 });
            }
          }
          newEnemies = newEnemies.filter(e => !destroyedByLaserEnemies.has(e.id));
          const destroyedByLaserAsteroids = new Set<string>();
           for (const a of newAsteroids) {
            if (a.y < newLaser.y && a.y + a.height > newLaser.y) {
              destroyedByLaserAsteroids.add(a.id);
              newScore += 25;
              newExplosions.push({ id: uuidv4(), x: a.x, y: a.y, size: a.width, life: 20 });
            }
          }
          newAsteroids = newAsteroids.filter(a => !destroyedByLaserAsteroids.has(a.id));
        }
      }
      // Collision detection
      const checkCollision = (a: GameObject, b: GameObject) =>
        a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
      const destroyedEnemyIds = new Set<string>();
      const destroyedAsteroidIds = new Set<string>();
      const usedProjectileIds = new Set<string>();
      for (const p of newProjectiles) {
        for (const e of newEnemies) {
          if (checkCollision(p, e)) {
            newScore += 100;
            newExplosions.push({ id: uuidv4(), x: e.x, y: e.y, size: e.width, life: 20 });
            destroyedEnemyIds.add(e.id);
            usedProjectileIds.add(p.id);
          }
        }
        for (const a of newAsteroids) {
            if (checkCollision(p, a)) {
              newScore += 20;
              newExplosions.push({ id: uuidv4(), x: a.x, y: a.y, size: a.width, life: 20 });
              destroyedAsteroidIds.add(a.id);
              usedProjectileIds.add(p.id);
            }
        }
      }
      newProjectiles = newProjectiles.filter(p => !usedProjectileIds.has(p.id));
      newEnemies = newEnemies.filter(e => !destroyedEnemyIds.has(e.id));
      newAsteroids = newAsteroids.filter(a => !destroyedAsteroidIds.has(a.id));
      // Player collision
      let playerHit = false;
      if (!newPlayer.invincible) {
        for (const e of newEnemies) {
          if (checkCollision(newPlayer, e)) {
            playerHit = true;
            newExplosions.push({ id: uuidv4(), x: e.x, y: e.y, size: e.width, life: 20 });
            newEnemies = newEnemies.filter((enemy) => enemy.id !== e.id);
            break;
          }
        }
        if (!playerHit) {
          for (const a of newAsteroids) {
            if (checkCollision(newPlayer, a)) {
              playerHit = true;
              break;
            }
          }
        }
      }
      if (playerHit) {
        newLives--;
        newExplosions.push({ id: uuidv4(), x: newPlayer.x, y: newPlayer.y, size: newPlayer.width * 2, life: 30 });
        if (newLives <= 0) {
          return { ...state, status: 'gameOver', lives: 0, score: newScore, lastUpdateTime: timestamp };
        } else {
          newPlayer = { ...initialState.player, invincible: true };
          invincibilityTimer = 2000;
        }
      }
      // Invincibility
      if (newPlayer.invincible) {
        invincibilityTimer -= deltaTime;
        if (invincibilityTimer <= 0) {
          newPlayer.invincible = false;
          invincibilityTimer = 0;
        }
      }
      // Update explosions
      const explosionLifeDecay = 60 / 1000;
      newExplosions = newExplosions.map((ex) => ({ ...ex, life: ex.life - explosionLifeDecay * deltaTime })).filter((ex) => ex.life > 0);
      // Update difficulty
      difficulty = 1 + Math.floor(newScore / 5000);
      return {
        ...state,
        player: newPlayer,
        enemyAlly: newEnemyAlly,
        asteroidAlly: newAsteroidAlly,
        projectiles: newProjectiles,
        enemies: newEnemies,
        asteroids: newAsteroids,
        explosions: newExplosions,
        laser: newLaser,
        score: newScore,
        lives: newLives,
        difficulty,
        invincibilityTimer,
        lastShotTime,
        lastEnemyAllyShotTime: newLastEnemyAllyShotTime,
        lastAsteroidAllyShotTime: newLastAsteroidAllyShotTime,
        lastLaserTime: newLastLaserTime,
        lastEnemySpawn,
        lastAsteroidSpawn,
        lastUpdateTime: timestamp,
      };
    });
  },
}));