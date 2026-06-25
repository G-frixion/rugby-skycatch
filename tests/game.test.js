/**
 * tests/game.test.js — Tests unitaires de la logique du jeu
 * Exécuter avec : npm test
 */

const {
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
  PLAYER_SPEED,
  GAME_DURATION,
  BALL_INTERVAL_MS,
} = require('../src/game');

// ─────────────────────────────────────────────────────────────
// createGameState
// ─────────────────────────────────────────────────────────────
describe('createGameState()', () => {
  test('retourne un état initial valide', () => {
    const state = createGameState();
    expect(state.status).toBe('menu');
    expect(state.score).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.caught).toBe(0);
    expect(state.missed).toBe(0);
    expect(state.timeLeft).toBe(GAME_DURATION);
    expect(state.balls).toEqual([]);
  });

  test('le joueur démarre centré', () => {
    const state = createGameState();
    expect(state.playerX).toBe(CANVAS_W / 2 - PLAYER_W / 2);
  });
});

// ─────────────────────────────────────────────────────────────
// getPointsForBall
// ─────────────────────────────────────────────────────────────
describe('getPointsForBall()', () => {
  test('ballon normal vaut 1 point', () => {
    expect(getPointsForBall('normal')).toBe(1);
  });

  test('ballon doré vaut 5 points', () => {
    expect(getPointsForBall('gold')).toBe(5);
  });

  test('carton rouge vaut 0 point', () => {
    expect(getPointsForBall('red')).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// computeDifficulty
// ─────────────────────────────────────────────────────────────
describe('computeDifficulty()', () => {
  test('difficulté 1 au début', () => {
    expect(computeDifficulty(0)).toBe(1);
  });

  test('difficulté augmente après 15 secondes', () => {
    expect(computeDifficulty(15)).toBeCloseTo(1.3);
  });

  test('difficulté augmente après 30 secondes', () => {
    expect(computeDifficulty(30)).toBeCloseTo(1.6);
  });

  test('difficulté augmente après 45 secondes', () => {
    expect(computeDifficulty(45)).toBeCloseTo(1.9);
  });

  test('difficulté ne change pas dans la même tranche', () => {
    expect(computeDifficulty(14)).toBe(computeDifficulty(0));
    expect(computeDifficulty(29)).toBe(computeDifficulty(15));
  });
});

// ─────────────────────────────────────────────────────────────
// computeSpawnInterval
// ─────────────────────────────────────────────────────────────
describe('computeSpawnInterval()', () => {
  test('intervalle de base au début', () => {
    expect(computeSpawnInterval(0)).toBe(BALL_INTERVAL_MS);
  });

  test('intervalle diminue avec le temps', () => {
    expect(computeSpawnInterval(15)).toBeLessThan(BALL_INTERVAL_MS);
    expect(computeSpawnInterval(30)).toBeLessThan(computeSpawnInterval(15));
  });

  test('intervalle minimum de 500ms', () => {
    expect(computeSpawnInterval(999)).toBe(500);
  });
});

// ─────────────────────────────────────────────────────────────
// createBall
// ─────────────────────────────────────────────────────────────
describe('createBall()', () => {
  test('crée un ballon normal', () => {
    const ball = createBall(100, 'normal');
    expect(ball.x).toBe(100);
    expect(ball.y).toBe(-20);
    expect(ball.type).toBe('normal');
    expect(ball.r).toBe(16);
    expect(ball.rot).toBe(0);
  });

  test('ballon doré est plus grand', () => {
    const gold = createBall(100, 'gold');
    const normal = createBall(100, 'normal');
    expect(gold.r).toBeGreaterThan(normal.r);
  });

  test('type normal par défaut', () => {
    const ball = createBall(100);
    expect(ball.type).toBe('normal');
  });
});

// ─────────────────────────────────────────────────────────────
// pickBallType
// ─────────────────────────────────────────────────────────────
describe('pickBallType()', () => {
  test('valeur > 0.85 → gold', () => {
    expect(pickBallType(0.86)).toBe('gold');
    expect(pickBallType(1.0)).toBe('gold');
  });

  test('valeur < 0.12 → red', () => {
    expect(pickBallType(0.0)).toBe('red');
    expect(pickBallType(0.11)).toBe('red');
  });

  test('valeur intermédiaire → normal', () => {
    expect(pickBallType(0.5)).toBe('normal');
    expect(pickBallType(0.12)).toBe('normal');
    expect(pickBallType(0.85)).toBe('normal');
  });
});

// ─────────────────────────────────────────────────────────────
// checkCollision
// ─────────────────────────────────────────────────────────────
describe('checkCollision()', () => {
  const playerX = 270; // centre du canvas
  const playerY = CANVAS_H - 40; // 460

  test('collision détectée quand le ballon touche le joueur', () => {
    const ball = createBall(playerX + PLAYER_W / 2, 'normal');
    ball.y = playerY + 5; // dans la zone du joueur
    expect(checkCollision(ball, playerX)).toBe(true);
  });

  test('pas de collision si ballon au-dessus', () => {
    const ball = createBall(playerX + PLAYER_W / 2, 'normal');
    ball.y = 100; // loin au-dessus
    expect(checkCollision(ball, playerX)).toBe(false);
  });

  test('pas de collision si ballon à gauche du joueur', () => {
    const ball = createBall(playerX - 50, 'normal');
    ball.y = playerY + 5;
    expect(checkCollision(ball, playerX)).toBe(false);
  });

  test('pas de collision si ballon à droite du joueur', () => {
    const ball = createBall(playerX + PLAYER_W + 50, 'normal');
    ball.y = playerY + 5;
    expect(checkCollision(ball, playerX)).toBe(false);
  });

  test('collision aux bords du joueur', () => {
    const ball = createBall(playerX, 'normal'); // bord gauche
    ball.y = playerY + 5;
    expect(checkCollision(ball, playerX)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// movePlayer
// ─────────────────────────────────────────────────────────────
describe('movePlayer()', () => {
  test('déplace à gauche', () => {
    const newX = movePlayer(200, { left: true, right: false });
    expect(newX).toBe(200 - PLAYER_SPEED);
  });

  test('déplace à droite', () => {
    const newX = movePlayer(200, { left: false, right: true });
    expect(newX).toBe(200 + PLAYER_SPEED);
  });

  test('ne dépasse pas le bord gauche', () => {
    const newX = movePlayer(2, { left: true, right: false });
    expect(newX).toBe(0);
  });

  test('ne dépasse pas le bord droit', () => {
    const newX = movePlayer(CANVAS_W - PLAYER_W - 2, { left: false, right: true });
    expect(newX).toBe(CANVAS_W - PLAYER_W);
  });

  test('reste immobile si aucune touche', () => {
    const newX = movePlayer(200, { left: false, right: false });
    expect(newX).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────
// updateGame — logique de jeu complète
// ─────────────────────────────────────────────────────────────
describe('updateGame()', () => {
  test('ne met pas à jour si état != playing', () => {
    const state = createGameState(); // status = 'menu'
    const before = { ...state };
    updateGame(state, 1, { left: false, right: false });
    expect(state.score).toBe(before.score);
    expect(state.gameTimer).toBe(before.gameTimer);
  });

  test('le timer avance', () => {
    const state = createGameState();
    state.status = 'playing';
    updateGame(state, 1, { left: false, right: false });
    expect(state.gameTimer).toBeCloseTo(1);
  });

  test('timeLeft diminue', () => {
    const state = createGameState();
    state.status = 'playing';
    updateGame(state, 5, { left: false, right: false });
    expect(state.timeLeft).toBe(GAME_DURATION - 5);
  });

  test('ballon normal attrapé → +1 score, +1 caught', () => {
    const state = createGameState();
    state.status = 'playing';
    state.playerX = 270;
    // Placer un ballon directement en zone de collision
    const ball = createBall(270 + PLAYER_W / 2, 'normal');
    ball.y = CANVAS_H - 40 + 5;
    state.balls = [ball];
    updateGame(state, 0.016, { left: false, right: false });
    expect(state.score).toBe(1);
    expect(state.caught).toBe(1);
    expect(state.balls.length).toBe(0);
  });

  test('ballon doré attrapé → +5 score', () => {
    const state = createGameState();
    state.status = 'playing';
    state.playerX = 270;
    const ball = createBall(270 + PLAYER_W / 2, 'gold');
    ball.y = CANVAS_H - 40 + 5;
    state.balls = [ball];
    updateGame(state, 0.016, { left: false, right: false });
    expect(state.score).toBe(5);
  });

  test('carton rouge attrapé → -1 vie, 0 score', () => {
    const state = createGameState();
    state.status = 'playing';
    state.playerX = 270;
    const ball = createBall(270 + PLAYER_W / 2, 'red');
    ball.y = CANVAS_H - 40 + 5;
    state.balls = [ball];
    updateGame(state, 0.016, { left: false, right: false });
    expect(state.score).toBe(0);
    expect(state.lives).toBe(2);
  });

  test('ballon raté (touche le sol) → -1 vie, +1 missed', () => {
    const state = createGameState();
    state.status = 'playing';
    // Ballon hors de portée du joueur
    const ball = createBall(0, 'normal');
    ball.y = CANVAS_H + 50; // déjà sorti
    state.balls = [ball];
    updateGame(state, 0.016, { left: false, right: false });
    expect(state.lives).toBe(2);
    expect(state.missed).toBe(1);
    expect(state.balls.length).toBe(0);
  });

  test('carton rouge raté (hors écran) → ne perd pas de vie', () => {
    const state = createGameState();
    state.status = 'playing';
    const ball = createBall(0, 'red');
    ball.y = CANVAS_H + 50;
    state.balls = [ball];
    updateGame(state, 0.016, { left: false, right: false });
    expect(state.lives).toBe(3); // pas de pénalité
  });

  test('partie termine quand vies = 0', () => {
    const state = createGameState();
    state.status = 'playing';
    state.lives = 1;
    // Un ballon raté pour perdre la dernière vie
    const ball = createBall(0, 'normal');
    ball.y = CANVAS_H + 50;
    state.balls = [ball];
    updateGame(state, 0.016, { left: false, right: false });
    expect(state.status).toBe('gameover');
  });

  test('partie termine quand temps écoulé', () => {
    const state = createGameState();
    state.status = 'playing';
    state.gameTimer = GAME_DURATION - 0.1;
    updateGame(state, 0.5, { left: false, right: false });
    expect(state.status).toBe('gameover');
  });

  test('score ne peut pas être négatif (red ne retire pas de points)', () => {
    const state = createGameState();
    state.status = 'playing';
    state.score = 0;
    state.playerX = 270;
    const ball = createBall(270 + PLAYER_W / 2, 'red');
    ball.y = CANVAS_H - 40 + 5;
    state.balls = [ball];
    updateGame(state, 0.016, { left: false, right: false });
    expect(state.score).toBe(0);
  });
});
