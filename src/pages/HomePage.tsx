import React, { useEffect, useRef, useState } from 'react';
import { useGameStore, LASER_COOLDOWN } from '@/hooks/use-game-store';
import { Button } from '@/components/ui/button';
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PlayerShip = ({ player }: { player: ReturnType<typeof useGameStore.getState>['player'] }) => {
  const isInvincible = player.invincible;
  const opacity = isInvincible ? (Math.floor(Date.now() / 100) % 2 === 0 ? 0.5 : 1) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: player.x,
        top: player.y,
        width: player.width,
        height: player.height,
        opacity,
        transition: 'opacity 100ms linear',
      }}
    >
      <svg viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0L30 20H0L15 0Z" fill="rgb(0, 255, 255)" stroke="rgb(0, 255, 255)" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
const AllyShip = ({ ally }: { ally: ReturnType<typeof useGameStore.getState>['enemyAlly'] }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: ally.x,
        top: ally.y,
        width: ally.width,
        height: ally.height,
      }}
    >
      <svg viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0L28 22L14 16L0 22L14 0Z" fill="rgb(0, 255, 0)" stroke="rgb(0, 255, 0)" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
const AsteroidAllyShip = ({ ally }: { ally: ReturnType<typeof useGameStore.getState>['asteroidAlly'] }) => {
    return (
      <div
        style={{
          position: 'absolute',
          left: ally.x,
          top: ally.y,
          width: ally.width,
          height: ally.height,
        }}
      >
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 0L28 14L14 28L0 14L14 0Z" fill="#FFD700" stroke="#FFD700" strokeWidth="1.5" />
        </svg>
      </div>
    );
};
const Projectile = ({ projectile }: { projectile: ReturnType<typeof useGameStore.getState>['projectiles'][0] }) => (
  <div
    style={{
      position: 'absolute',
      left: projectile.x,
      top: projectile.y,
      width: projectile.width,
      height: projectile.height,
      backgroundColor: 'rgb(0, 255, 0)',
      boxShadow: "0 0 5px rgb(0, 255, 0), 0 0 10px rgb(0, 255, 0)",
    }}
  />
);
const EnemyShip = ({ enemy }: { enemy: ReturnType<typeof useGameStore.getState>['enemies'][0] }) => (
  <div
    style={{
      position: 'absolute',
      left: enemy.x,
      top: enemy.y,
      width: enemy.width,
      height: enemy.height,
    }}
  >
    <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 10L15 30L30 10L25 0H5L0 10Z" fill="rgb(255, 0, 255)" stroke="rgb(255, 0, 255)" strokeWidth="1.5" />
    </svg>
  </div>
);
const Asteroid = ({ asteroid }: { asteroid: ReturnType<typeof useGameStore.getState>['asteroids'][0] }) => (
  <div
    style={{
      position: 'absolute',
      left: asteroid.x,
      top: asteroid.y,
      width: asteroid.width,
      height: asteroid.height,
      border: '1.5px solid #ccc',
      transform: `rotate(${asteroid.id.charCodeAt(0)}deg)`,
    }}
  />
);
const Explosion = ({ explosion }: { explosion: ReturnType<typeof useGameStore.getState>['explosions'][0] }) => {
  const particles = useRef(Array.from({ length: 15 }, () => ({
    x: (Math.random() - 0.5) * explosion.size,
    y: (Math.random() - 0.5) * explosion.size,
    size: Math.random() * 4 + 1,
    opacity: 1,
  }))).current;
  return (
    <div style={{ position: 'absolute', left: explosion.x, top: explosion.y, width: explosion.size, height: explosion.size }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `calc(50% + ${p.x}px)`,
            top: `calc(50% + ${p.y}px)`,
            width: p.size,
            height: p.size,
            backgroundColor: ['#ff0', '#f80', '#f00'][i % 3],
            opacity: explosion.life / 20,
            transition: 'opacity 100ms linear',
          }}
        />
      ))}
    </div>
  );
};
const LaserLine = ({ laser }: { laser: ReturnType<typeof useGameStore.getState>['laser'] }) => {
  if (!laser.active && laser.opacity === 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: laser.y - 1,
        left: 0,
        width: '100%',
        height: '2px',
        backgroundColor: 'rgb(255, 0, 255)',
        boxShadow: '0 0 10px rgb(255, 0, 255), 0 0 20px rgb(255, 0, 255)',
        opacity: laser.opacity,
        transition: 'opacity 200ms ease-out',
      }}
    />
  );
};
const LaserCooldownIndicator = () => {
  const lastLaserTime = useGameStore((s) => s.lastLaserTime);
  const [cooldownPercent, setCooldownPercent] = useState(100);
  const animationFrameRef = useRef<number>();
  useEffect(() => {
    const updateCooldown = () => {
      if (lastLaserTime === 0) {
        setCooldownPercent(100);
      } else {
        const elapsed = performance.now() - lastLaserTime;
        const percent = Math.min(100, (elapsed / LASER_COOLDOWN) * 100);
        setCooldownPercent(percent);
      }
      animationFrameRef.current = requestAnimationFrame(updateCooldown);
    };
    animationFrameRef.current = requestAnimationFrame(updateCooldown);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [lastLaserTime]);
  const isReady = cooldownPercent >= 100;
  return (
    <div className="absolute bottom-4 left-4 font-mono text-lg">
      <p className={`text-glow-magenta ${isReady ? 'text-neon-magenta' : 'text-gray-500'}`}>
        LASER (L): {isReady ? 'READY' : 'RECHARGING'}
      </p>
      <div className="w-48 h-2 bg-gray-800 border border-neon-magenta/50 mt-1">
        <div
          className="h-full bg-neon-magenta"
          style={{ width: `${cooldownPercent}%`, transition: 'width 100ms linear', boxShadow: '0 0 5px rgb(255,0,255)' }}
        />
      </div>
    </div>
  );
};
const GameUI = () => {
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  return (
    <>
      <div className="absolute top-4 left-4 font-mono text-2xl text-neon-cyan text-glow-cyan">
        SCORE: {score.toString().padStart(6, '0')}
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {Array.from({ length: lives }).map((_, i) => (
          <svg key={i} width="30" height="20" viewBox="0 0 30 20" fill="rgb(0, 255, 255)" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0L30 20H0L15 0Z" />
          </svg>
        ))}
      </div>
      <LaserCooldownIndicator />
    </>
  );
};
const MenuOverlay = () => {
  const startGame = useGameStore((s) => s.startGame);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-10">
      <h1 className="text-8xl font-mono text-neon-cyan text-glow-cyan mb-4">VOID DASHER</h1>
      <Button
        onClick={startGame}
        className="font-mono text-2xl bg-transparent border-2 border-neon-lime text-neon-lime hover:bg-neon-lime hover:text-black px-8 py-4 animate-flicker"
      >
        START GAME
      </Button>
    </div>
  );
};
const GameOverOverlay = () => {
  const startGame = useGameStore((s) => s.startGame);
  const score = useGameStore((s) => s.score);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md z-10">
      <h1 className="text-8xl font-mono text-neon-magenta text-glow-magenta mb-4">GAME OVER</h1>
      <p className="text-4xl font-mono text-neon-cyan text-glow-cyan mb-8">FINAL SCORE: {score}</p>
      <Button
        onClick={startGame}
        className="font-mono text-2xl bg-transparent border-2 border-neon-lime text-neon-lime hover:bg-neon-lime hover:text-black px-8 py-4 animate-flicker"
      >
        PLAY AGAIN
      </Button>
    </div>
  );
};
export function HomePage() {
  const status = useGameStore((s) => s.status);
  const player = useGameStore((s) => s.player);
  const enemyAlly = useGameStore((s) => s.enemyAlly);
  const asteroidAlly = useGameStore((s) => s.asteroidAlly);
  const projectiles = useGameStore((s) => s.projectiles);
  const enemies = useGameStore((s) => s.enemies);
  const asteroids = useGameStore((s) => s.asteroids);
  const explosions = useGameStore((s) => s.explosions);
  const laser = useGameStore((s) => s.laser);
  const update = useGameStore((s) => s.update);
  const handleKeyDown = useGameStore((s) => s.handleKeyDown);
  const handleKeyUp = useGameStore((s) => s.handleKeyUp);
  const gameLoopRef = useRef<number>();
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => handleKeyDown(e.key);
    const onKeyUp = (e: KeyboardEvent) => handleKeyUp(e.key);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
  useEffect(() => {
    const loop = (timestamp: number) => {
      update(timestamp);
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    if (status === 'playing') {
      gameLoopRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [status, update]);
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-black font-mono overflow-hidden">
      <div
        className="relative bg-black overflow-hidden crt-overlay"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT, border: '2px solid rgb(0, 255, 255)', boxShadow: '0 0 20px rgb(0, 255, 255)' }}
      >
        {status === 'menu' && <MenuOverlay />}
        {status === 'gameOver' && <GameOverOverlay />}
        {status === 'playing' && (
          <>
            <GameUI />
            <PlayerShip player={player} />
            <AllyShip ally={enemyAlly} />
            <AsteroidAllyShip ally={asteroidAlly} />
            {projectiles.map((p) => <Projectile key={p.id} projectile={p} />)}
            {enemies.map((e) => <EnemyShip key={e.id} enemy={e} />)}
            {asteroids.map((a) => <Asteroid key={a.id} asteroid={a} />)}
            {explosions.map((ex) => <Explosion key={ex.id} explosion={ex} />)}
            <LaserLine laser={laser} />
          </>
        )}
      </div>
    </main>
  );
}