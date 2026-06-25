/**
 * game.js — Logique pure du jeu Rugby SkyCatch
 * Aucune dépendance DOM : testable avec Jest.
 */

const CANVAS_W = 600;
const CANVAS_H = 500;
const PLAYER_W = 60;
const PLAYER_H = 20;
const PLAYER_SPEED = 7;
const BALL_BASE_SPEED = 2.5;
const BALL_INTERVAL_MS = 1200;
const GAME_DURATION = 60;

/**
 * Crée un état de jeu initial.
 * @returns {object} GameState
 */
function createGameState() {
  return {
    status: 'menu', // 'menu' | 'playing' | 'gameover'
    score: 0,
    lives: 3,
    caught: 0,
    missed: 0,
    timeLeft: GAME_DURATION,
    playerX: CANVAS_W / 2 - PLAYER_W / 2,
    balls: [],
    difficulty: 1,
    ballSpawnInterval: BALL_INTERVAL_MS,
    gameTimer: 0,
    ballTimer: 0,
  };
}

/**
 * Calcule le score d'un ballon attrapé selon son type.
 * @param {'normal'|'gold'|'red'} type
 * @returns {number}
 */
function getPointsForBall(type) {
  if (type === 'gold') return 5;
  if (type === 'red') return 0;
  return 1;
}

/**
 * Calcule la difficulté en fonction du temps écoulé.
 * @param {number} gameTimer - Secondes écoulées
 * @returns {number}
 */
function computeDifficulty(gameTimer) {
  return 1 + Math.floor(gameTimer / 15) * 0.3;
}

/**
 * Calcule l'intervalle de spawn des ballons.
 * @param {number} gameTimer
 * @returns {number} ms
 */
function computeSpawnInterval(gameTimer) {
  return Math.max(500, BALL_INTERVAL_MS - Math.floor(gameTimer / 15) * 150);
}

/**
 * Crée un nouveau ballon.
 * @param {number} x - Position X
 * @param {'normal'|'gold'|'red'} type
 * @returns {object} Ball
 */
function createBall(x, type = 'normal') {
  return {
    x,
    y: -20,
    r: type === 'gold' ? 20 : 16,
    type,
    rot: 0,
  };
}

/**
 * Détermine le type de ballon à spawner aléatoirement.
 * @param {number} rand - Valeur aléatoire entre 0 et 1
 * @returns {'normal'|'gold'|'red'}
 */
function pickBallType(rand) {
  if (rand > 0.85) return 'gold';
  if (rand < 0.12) return 'red';
  return 'normal';
}

/**
 * Vérifie si un ballon entre en collision avec le joueur.
 * @param {object} ball
 * @param {number} playerX
 * @returns {boolean}
 */
function checkCollision(ball, playerX) {
  const playerY = CANVAS_H - 40;
  return (
    ball.y + ball.r > playerY &&
    ball.y - ball.r < playerY + PLAYER_H &&
    ball.x > playerX - ball.r &&
    ball.x < playerX + PLAYER_W + ball.r
  );
}

/**
 * Déplace le joueur en fonction des touches enfoncées.
 * @param {number} playerX - Position actuelle
 * @param {{ left: boolean, right: boolean }} keys
 * @returns {number} Nouvelle position X
 */
function movePlayer(playerX, keys) {
  let x = playerX;
  if (keys.left) x = Math.max(0, x - PLAYER_SPEED);
  if (keys.right) x = Math.min(CANVAS_W - PLAYER_W, x + PLAYER_SPEED);
  return x;
}

/**
 * Met à jour un tick complet du jeu.
 * @param {object} state - GameState (modifié en place)
 * @param {number} dt - Delta temps en secondes
 * @param {{ left: boolean, right: boolean }} keys
 * @param {number} spawnRand - Valeur aléatoire pour spawn (0-1)
 * @param {number} spawnX - Position X du nouveau ballon
 * @returns {object} state mis à jour
 */
function updateGame(state, dt, keys, spawnRand = null, spawnX = null) {
  if (state.status !== 'playing') return state;

  // Déplacement joueur
  state.playerX = movePlayer(state.playerX, keys);

  // Timer
  state.gameTimer += dt;
  state.timeLeft = Math.max(0, GAME_DURATION - Math.floor(state.gameTimer));

  // Difficulté
  state.difficulty = computeDifficulty(state.gameTimer);
  state.ballSpawnInterval = computeSpawnInterval(state.gameTimer);

  // Spawn ballon
  state.ballTimer += dt * 1000;
  if (state.ballTimer >= state.ballSpawnInterval && spawnRand !== null) {
    state.ballTimer = 0;
    const type = pickBallType(spawnRand);
    const x = spawnX !== null ? spawnX : 30 + Math.random() * (CANVAS_W - 60);
    state.balls.push(createBall(x, type));
  }

  // Mouvement ballons + collisions
  const speed = BALL_BASE_SPEED * state.difficulty;
  state.balls = state.balls.filter((ball) => {
    ball.y += speed;
    ball.rot += 0.04;

    if (checkCollision(ball, state.playerX)) {
      if (ball.type === 'red') {
        state.lives--;
      } else {
        state.score += getPointsForBall(ball.type);
        state.caught++;
      }
      return false; // supprimer
    }

    if (ball.y > CANVAS_H + ball.r) {
      if (ball.type !== 'red') {
        state.lives--;
        state.missed++;
      }
      return false;
    }

    return true;
  });

  // Fin de partie
  if (state.lives <= 0 || state.timeLeft <= 0) {
    state.status = 'gameover';
  }

  return state;
}

// Export CommonJS (pour Jest) et global (pour le navigateur)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createGameState,
    getPointsForBall,
    computeDifficulty,
    computeSpawnInterval,
    createBall,
    pickBallType,
    checkCollision,
    movePlayer,
    updateGame,
    CANVAS_W,
    CANVAS_H,
    PLAYER_W,
    PLAYER_H,
    PLAYER_SPEED,
    BALL_BASE_SPEED,
    GAME_DURATION,
    BALL_INTERVAL_MS,
  };
}
