#!/usr/bin/env node
// Minimal Terminal Tetris in Node.js (no deps)

const WIDTH = 10, HEIGHT = 20;

// ANSI helpers
const hideCursor = "\x1b[?25l", showCursor = "\x1b[?25h";
const clear = "\x1b[2J\x1b[H";
const color = c => `\x1b[38;5;${c}m`;
const reset = "\x1b[0m";

// Tetromino definitions (matrix per rotation)
const PIECES = {
  I: { c: 45, r: [[[1,1,1,1]],
                  [[1],[1],[1],[1]]] },
  O: { c: 226, r: [[[1,1],
                    [1,1]]] },
  T: { c: 129, r: [[[0,1,0],[1,1,1]],
                   [[1,0],[1,1],[1,0]],
                   [[1,1,1],[0,1,0]],
                   [[0,1],[1,1],[0,1]]] },
  J: { c: 27,  r: [[[1,0,0],[1,1,1]],
                   [[1,1],[1,0],[1,0]],
                   [[1,1,1],[0,0,1]],
                   [[0,1],[0,1],[1,1]]] },
  L: { c: 208, r: [[[0,0,1],[1,1,1]],
                   [[1,0],[1,0],[1,1]],
                   [[1,1,1],[1,0,0]],
                   [[1,1],[0,1],[0,1]]] },
  S: { c: 34,  r: [[[0,1,1],[1,1,0]],
                   [[1,0],[1,1],[0,1]]] },
  Z: { c: 196, r: [[[1,1,0],[0,1,1]],
                   [[0,1],[1,1],[1,0]]] }
};
const KEYS = { LEFT: "\x1b[D", RIGHT: "\x1b[C", UP: "\x1b[A", DOWN: "\x1b[B", SPACE: " " };

const rand = a => a[Math.floor(Math.random()*a.length)];
const clone = m => m.map(r=>r.slice());

function emptyBoard() { return Array.from({length: HEIGHT}, () => Array(WIDTH).fill(0)); }
function rotate(mat) { // 90° CW
  const h = mat.length, w = mat[0].length;
  const out = Array.from({length:w}, () => Array(h).fill(0));
  for (let r=0;r<h;r++) for (let c=0;c<w;c++) out[c][h-1-r] = mat[r][c];
  return out;
}
function rotations(base) { // ensure 4 rotations max (or unique)
  const out = [clone(base)];
  for (let i=0;i<3;i++) {
    const nxt = rotate(out[out.length-1]);
    if (out.some(m => eqMatrix(m,nxt))) break;
    out.push(nxt);
  }
  return out;
}
function eqMatrix(a,b) {
  if (a.length!==b.length || a[0].length!==b[0].length) return false;
  for (let r=0;r<a.length;r++) for (let c=0;c<a[0].length;c++) if (a[r][c]!==b[r][c]) return false;
  return true;
}
for (const k in PIECES) PIECES[k].r = rotations(PIECES[k].r[0]); // normalize

function collides(board, mat, x, y) {
  for (let r=0;r<mat.length;r++) for (let c=0;c<mat[0].length;c++) {
    if (!mat[r][c]) continue;
    const nx = x+c, ny = y+r;
    if (nx<0 || nx>=WIDTH || ny>=HEIGHT) return true;
    if (ny>=0 && board[ny][nx]) return true;
  }
  return false;
}
function merge(board, mat, x, y, val) {
  for (let r=0;r<mat.length;r++) for (let c=0;c<mat[0].length;c++) {
    if (mat[r][c] && y+r>=0) board[y+r][x+c] = val;
  }
}
function clearLines(board) {
  let cleared = 0;
  for (let r=HEIGHT-1;r>=0;r--) {
    if (board[r].every(v=>v)) {
      board.splice(r,1);
      board.unshift(Array(WIDTH).fill(0));
      cleared++; r++;
    }
  }
  return cleared;
}

function draw(board, ghostMat, gx, gy, pieceMat, px, py, score, level, lines, paused=false) {
  let out = [];
  out.push(clear);
  out.push("Terminal Tetris — arrows to move/rotate, Space to drop, P pause, Q quit\n");
  out.push(`Score: ${score}   Level: ${level}   Lines: ${lines}\n`);
  out.push("┌" + "──".repeat(WIDTH) + "┐\n");
  // temp copy to overlay ghost + current
  const temp = board.map(r=>r.slice());
  if (ghostMat) merge(temp, ghostMat, gx, gy, 244); // dim gray ghost color id
  if (pieceMat)  merge(temp, pieceMat, px, py, 226); // placeholder; we color cells individually below
  for (let r=0;r<HEIGHT;r++) {
    out.push("│");
    for (let c=0;c<WIDTH;c++) {
      const v = temp[r][c];
      if (!v) { out.push("  "); continue; }
      // v can be color id or 244 ghost
      if (v === 244) out.push(color(244) + "░░" + reset);
      else if (typeof v === 'object') out.push(color(v.c) + "██" + reset);
      else out.push(color(33) + "██" + reset);
    }
    out.push("│\n");
  }
  out.push("└" + "──".repeat(WIDTH) + "┘\n");
  if (paused) out.push("\n[Paused]\n");
  process.stdout.write(out.join(""));
}

function spawn() {
  const key = rand(Object.keys(PIECES));
  const p = PIECES[key];
  const r = 0;
  const mat = p.r[r];
  const x = Math.floor((WIDTH - mat[0].length)/2);
  const y = -2; // start above board
  return { key, r, x, y, color: p.c };
}
function hardDropY(board, mat, x, y) {
  while (!collides(board, mat, x, y+1)) y++;
  return y;
}

let board = emptyBoard();
let cur = spawn();
let nextTick = Date.now();
let tickMs = 700;
let score = 0, level = 0, lines = 0;
let paused = false;
let over = false;

function pieceMatrix(cur) {
  const mats = PIECES[cur.key].r;
  const m = mats[cur.r];
  // decorate with color objects for draw()
  return m.map(row => row.map(v => v ? {c: cur.color} : 0));
}
function rawMatrix(cur) { return PIECES[cur.key].r[cur.r]; }

function levelForLines(lines) {
  return Math.min(10, Math.floor(lines/10));
}
function tickSpeed(level) {
  // simple speed curve (ms)
  return Math.max(80, 700 - level*60);
}

function step() {
  if (paused || over) return drawState();
  const now = Date.now();
  if (now < nextTick) return;
  nextTick = now + tickMs;

  // try move down
  if (!collides(board, rawMatrix(cur), cur.x, cur.y+1)) {
    cur.y++;
  } else {
    // lock piece
    const m = rawMatrix(cur);
    // merge with colored cells
    for (let r=0;r<m.length;r++) for (let c=0;c<m[0].length;c++) {
      if (m[r][c]) {
        const ny = cur.y+r, nx = cur.x+c;
        if (ny < 0) { over = true; return drawState(); }
        board[ny][nx] = {c: cur.color};
      }
    }
    const cleared = clearLines(board);
    if (cleared) {
      lines += cleared;
      const points = [0, 40, 100, 300, 1200][cleared] * (level+1);
      score += points;
      const newLevel = levelForLines(lines);
      if (newLevel !== level) {
        level = newLevel;
        tickMs = tickSpeed(level);
      }
    }
    cur = spawn();
    if (collides(board, rawMatrix(cur), cur.x, cur.y)) { over = true; }
  }
  drawState();
}

function drawState() {
  const pm = pieceMatrix(cur);
  // ghost
  const m = rawMatrix(cur);
  const gy = hardDropY(board, m, cur.x, cur.y);
  const ghost = m.map(row => row.map(v=>v?1:0));
  draw(board, ghost, cur.x, gy, pm, cur.x, cur.y, score, level, lines, paused);
  if (over) {
    process.stdout.write("\nGame Over — press Q to quit.\n");
  }
}

// input handling
process.stdout.write(hideCursor);
process.stdout.write(clear);
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

let keyBuf = "";
process.stdin.on('data', (ch) => {
  keyBuf += ch;
  // Parse escape sequences for arrows
  if (keyBuf.endsWith(KEYS.LEFT)) { move(-1,0); keyBuf=""; return; }
  if (keyBuf.endsWith(KEYS.RIGHT)) { move(1,0); keyBuf=""; return; }
  if (keyBuf.endsWith(KEYS.DOWN)) { softDrop(); keyBuf=""; return; }
  if (keyBuf.endsWith(KEYS.UP)) { rotateCW(); keyBuf=""; return; }

  if (ch.toLowerCase() === 'q') return exitGame();
  if (ch.toLowerCase() === 'p') { paused = !paused; drawState(); return; }
  if (ch === KEYS.SPACE) { hardDrop(); return; }

  // also support WASD
  if (ch.toLowerCase() === 'a') move(-1,0);
  if (ch.toLowerCase() === 'd') move(1,0);
  if (ch.toLowerCase() === 's') softDrop();
  if (ch.toLowerCase() === 'w') rotateCW();
});

function move(dx, dy) {
  if (paused || over) return;
  const nx = cur.x + dx, ny = cur.y + dy;
  if (!collides(board, rawMatrix(cur), nx, ny)) { cur.x = nx; cur.y = ny; drawState(); }
}
function rotateCW() {
  if (paused || over) return;
  const prev = cur.r;
  cur.r = (cur.r + 1) % PIECES[cur.key].r.length;
  // naive wall kicks: try shift +/- 1
  if (collides(board, rawMatrix(cur), cur.x, cur.y)) {
    if (!collides(board, rawMatrix(cur), cur.x-1, cur.y)) cur.x -= 1;
    else if (!collides(board, rawMatrix(cur), cur.x+1, cur.y)) cur.x += 1;
    else cur.r = prev;
  }
  drawState();
}
function softDrop() {
  if (paused || over) return;
  if (!collides(board, rawMatrix(cur), cur.x, cur.y+1)) { cur.y++; score += 1; }
  drawState();
}
function hardDrop() {
  if (paused || over) return;
  const m = rawMatrix(cur);
  cur.y = hardDropY(board, m, cur.x, cur.y);
  score += 2; // small bonus
  step(); // lock immediately next tick
}
function exitGame() {
  clearInterval(loop);
  process.stdout.write(showCursor + reset + "\n");
  process.exit(0);
}

function gameLoop() { step(); }

let loop = setInterval(gameLoop, 10);
drawState();

