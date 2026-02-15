import React, { useEffect, useRef, useState } from 'react';
import Tank from './Tank';
import Bullet from './Bullet';

const TANK_SPEED = 3;
const ROTATION_SPEED = 3;
const TURRET_SPEED = 3;
const BULLET_SPEED = 10;
const RELOAD_TIME = 500; // ms
const ENEMY_RELOAD_TIME = 2000;
const PLAYER_COLOR = '#4a90e2';
const ENEMY_COLOR = '#e67e22'; // Orange

const toRad = deg => deg * Math.PI / 180;

const Game = () => {
    // We use a ref for the game logic state to avoid closure staleness in the loop
    const gameStateRef = useRef({
        player: {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            bodyRotation: 0,
            turretRotation: 0,
            hp: 100,
            maxHp: 100,
            score: 0
        },
        enemies: [], // { id, x, y, bodyRotation, turretRotation, hp, maxHp, lastShotTime }
        bullets: [], // { id, x, y, rotation, owner: 'player' | 'enemy', color }
        lastShotTime: 0,
        gameOver: false
    });

    // We use state only for rendering
    const [renderState, setRenderState] = useState(gameStateRef.current);

    const keys = useRef({});

    // Input Handling
    useEffect(() => {
        const handleKeyDown = (e) => {
            keys.current[e.code] = true;
        };
        const handleKeyUp = (e) => {
            keys.current[e.code] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Game Loop
    useEffect(() => {
        let animationFrameId;

        const update = () => {
            const state = gameStateRef.current;
            if (state.gameOver) return;

            const input = keys.current;

            // --- Player Movement ---
            if (input['KeyW']) {
                state.player.x += Math.cos(toRad(state.player.bodyRotation - 90)) * TANK_SPEED;
                state.player.y += Math.sin(toRad(state.player.bodyRotation - 90)) * TANK_SPEED;
            }
            if (input['KeyS']) {
                state.player.x -= Math.cos(toRad(state.player.bodyRotation - 90)) * TANK_SPEED;
                state.player.y -= Math.sin(toRad(state.player.bodyRotation - 90)) * TANK_SPEED;
            }
            if (input['KeyA']) {
                state.player.bodyRotation -= ROTATION_SPEED;
            }
            if (input['KeyD']) {
                state.player.bodyRotation += ROTATION_SPEED;
            }

            // Player Turret
            if (input['KeyJ']) {
                state.player.turretRotation -= TURRET_SPEED;
            }
            if (input['KeyK']) {
                state.player.turretRotation += TURRET_SPEED;
            }

            // Player Shooting
            const now = Date.now();
            if (input['Space']) {
                if (now - state.lastShotTime > RELOAD_TIME) {
                    const bulletX = state.player.x + Math.cos(toRad(state.player.turretRotation - 90)) * 30;
                    const bulletY = state.player.y + Math.sin(toRad(state.player.turretRotation - 90)) * 30;

                    state.bullets.push({
                        id: now + Math.random(),
                        x: bulletX,
                        y: bulletY,
                        rotation: state.player.turretRotation,
                        owner: 'player',
                        color: '#ffee00' // Yellow for player
                    });
                    state.lastShotTime = now;
                }
            }

            // --- Enemy Spawning ---
            const maxEnemies = 1 + Math.floor(state.player.score / 2); // Increase max enemies every 2 kills
            if (state.enemies.length < maxEnemies) {
                // Spawn away from player
                let spawnX, spawnY;
                do {
                    spawnX = Math.random() * window.innerWidth;
                    spawnY = Math.random() * window.innerHeight;
                } while (Math.hypot(spawnX - state.player.x, spawnY - state.player.y) < 300);

                const difficultyMultiplier = 1 + (state.player.score * 0.1); // +10% stats per kill

                state.enemies.push({
                    id: now + Math.random(),
                    x: spawnX,
                    y: spawnY,
                    bodyRotation: Math.random() * 360,
                    turretRotation: Math.random() * 360,
                    hp: 100 * difficultyMultiplier,
                    maxHp: 100 * difficultyMultiplier,
                    damage: 10 * difficultyMultiplier,
                    lastShotTime: 0
                });
            }

            // --- Enemy AI ---
            state.enemies.forEach(enemy => {
                const dx = state.player.x - enemy.x;
                const dy = state.player.y - enemy.y;
                const dist = Math.hypot(dx, dy);
                const angleToPlayer = Math.atan2(dy, dx) * 180 / Math.PI + 90; // +90 because 0 is up

                // Rotate Body towards player
                // Simple easing rotation
                const angleDiff = (angleToPlayer - enemy.bodyRotation + 540) % 360 - 180;
                if (angleDiff > 2) enemy.bodyRotation += 1;
                else if (angleDiff < -2) enemy.bodyRotation -= 1;

                // Move if far
                if (dist > 200) {
                    enemy.x += Math.cos(toRad(enemy.bodyRotation - 90)) * (TANK_SPEED * 0.5);
                    enemy.y += Math.sin(toRad(enemy.bodyRotation - 90)) * (TANK_SPEED * 0.5);
                }

                // Turret aims at player
                enemy.turretRotation = angleToPlayer;

                // Shoot if close enough and cooldown ready
                if (dist < 400 && now - enemy.lastShotTime > ENEMY_RELOAD_TIME) {
                    const bulletX = enemy.x + Math.cos(toRad(enemy.turretRotation - 90)) * 30;
                    const bulletY = enemy.y + Math.sin(toRad(enemy.turretRotation - 90)) * 30;

                    state.bullets.push({
                        id: now + Math.random(),
                        x: bulletX,
                        y: bulletY,
                        rotation: enemy.turretRotation,
                        owner: 'enemy',
                        color: '#ff0000', // Red for enemy
                        damage: enemy.damage || 10
                    });
                    enemy.lastShotTime = now;
                }
            });

            // --- Update Bullets ---
            state.bullets = state.bullets.filter(b =>
                b.x >= 0 && b.x <= window.innerWidth &&
                b.y >= 0 && b.y <= window.innerHeight
            ).map(b => ({
                ...b,
                x: b.x + Math.cos(toRad(b.rotation - 90)) * BULLET_SPEED,
                y: b.y + Math.sin(toRad(b.rotation - 90)) * BULLET_SPEED
            }));

            // --- Collision Detection ---
            // Bullet vs Tanks
            const tankRadius = 25; // Approx hit radius

            // Iterate backwards to remove bullets safely
            for (let i = state.bullets.length - 1; i >= 0; i--) {
                const b = state.bullets[i];
                let hit = false;

                // Player Hit?
                if (b.owner === 'enemy') {
                    if (Math.hypot(b.x - state.player.x, b.y - state.player.y) < tankRadius) {
                        state.player.hp -= b.damage || 10;
                        hit = true;
                        if (state.player.hp <= 0) {
                            state.gameOver = true;
                        }
                    }
                }
                // Enemy Hit?
                else if (b.owner === 'player') {
                    for (let j = state.enemies.length - 1; j >= 0; j--) {
                        const enemy = state.enemies[j];
                        if (Math.hypot(b.x - enemy.x, b.y - enemy.y) < tankRadius) {
                            enemy.hp -= 20; // Player damage
                            hit = true;
                            if (enemy.hp <= 0) {
                                state.enemies.splice(j, 1);
                                state.player.score += 1;
                            }
                            break; // Bullet hits only one enemy
                        }
                    }
                }

                if (hit) {
                    state.bullets.splice(i, 1);
                }
            }

            // Trigger Render
            setRenderState({ ...state });

            animationFrameId = requestAnimationFrame(update);
        };

        animationFrameId = requestAnimationFrame(update);

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    if (renderState.gameOver) {
        return (
            <div className="game-container" style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <h1 style={{ color: 'red', fontSize: '4rem' }}>GAME OVER</h1>
                <h2>Score: {renderState.player.score}</h2>
                <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', fontSize: '1.5rem', marginTop: '20px', cursor: 'pointer' }}>Restart</button>
            </div>
        );
    }

    return (
        <div className="game-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
            {/* Player */}
            <Tank {...renderState.player} color={PLAYER_COLOR} />

            {/* Enemies */}
            {renderState.enemies.map(enemy => (
                <Tank key={enemy.id} {...enemy} color={ENEMY_COLOR} />
            ))}

            {/* Bullets */}
            {renderState.bullets.map(bullet => (
                <Bullet key={bullet.id} {...bullet} color={bullet.color} />
            ))}

            <div style={{ position: 'absolute', top: 10, left: 10, color: '#fff', fontFamily: 'monospace', fontSize: '1.2rem', textShadow: '1px 1px 2px black' }}>
                <div>HP: {Math.ceil(renderState.player.hp)} / {Math.ceil(renderState.player.maxHp)}</div>
                <div>Score: {renderState.player.score}</div>
                <div style={{ fontSize: '0.8rem', marginTop: '5px', opacity: 0.8 }}>
                    WASD: Move/Rotate | JK: Turret | SPACE: Shoot
                </div>
            </div>
        </div>
    );
};

export default Game;
