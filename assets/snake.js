/* ============================================================
   Trajectory Snake — jedyna w pełni działająca funkcja strony
   ============================================================ */
(function () {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const GRID = 20;                 // 20 x 20 komórek
  const CELL = canvas.width / GRID; // 24px
  const STEP_MS = 110;             // szybkość

  const scoreEl  = document.getElementById('snake-score');
  const bestEl   = document.getElementById('snake-best');
  const statusEl = document.getElementById('snake-status');
  const overlay  = document.getElementById('snake-overlay');
  const ovTitle  = document.getElementById('overlay-title');
  const ovText   = document.getElementById('overlay-text');
  const startBtn = document.getElementById('snake-start');

  const COL = {
    teal: '#16c4a8', tealGlow: 'rgba(22,196,168,.35)',
    orange: '#f9803f', head: '#3fd1b0', ink: '#06121a'
  };

  let snake, dir, nextDir, food, score, best, loop, running, paused, dead;

  best = parseInt(localStorage.getItem('so_snake_best') || '0', 10);
  bestEl.textContent = best;

  function reset() {
    snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    dead = false;
    paused = false;
    placeFood();
    scoreEl.textContent = '0';
    draw();
  }

  function placeFood() {
    do {
      food = { x: (Math.random() * GRID) | 0, y: (Math.random() * GRID) | 0 };
    } while (snake.some(s => s.x === food.x && s.y === food.y));
  }

  function start() {
    reset();
    overlay.classList.add('hidden');
    running = true;
    statusEl.textContent = 'jedzie';
    clearInterval(loop);
    loop = setInterval(tick, STEP_MS);
  }

  function gameOver() {
    dead = true;
    running = false;
    clearInterval(loop);
    statusEl.textContent = 'kolizja!';
    if (score > best) {
      best = score;
      localStorage.setItem('so_snake_best', String(best));
      bestEl.textContent = best;
    }
    ovTitle.textContent = `Kolizja! Wynik: ${score}`;
    ovText.innerHTML = score > 0
      ? `Trajektoria nieoptymalna (wjechałeś w przeszkodę).<br>Nasz model zrobiłby to lepiej. Spróbuj ponownie.`
      : `Zero punktów pośrednich. Nawet model przed treningiem był lepszy.`;
    startBtn.textContent = '↺ Jeszcze raz';
    overlay.classList.remove('hidden');
  }

  function tick() {
    if (paused) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // zawijanie przez ściany (trajektoria wychodzi z drugiej strony)
    head.x = (head.x + GRID) % GRID;
    head.y = (head.y + GRID) % GRID;

    // koniec gry tylko przy kolizji z samym sobą
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      draw();
      gameOver();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // food = waypoint (cel trajektorii)
    const fx = food.x * CELL, fy = food.y * CELL;
    ctx.fillStyle = COL.orange;
    ctx.shadowColor = COL.orange;
    ctx.shadowBlur = 16;
    roundRect(fx + CELL * 0.22, fy + CELL * 0.22, CELL * 0.56, CELL * 0.56, 4);
    ctx.shadowBlur = 0;
    // krzyżyk waypointu
    ctx.strokeStyle = 'rgba(255,255,255,.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fx + CELL / 2, fy + CELL * 0.12);
    ctx.lineTo(fx + CELL / 2, fy + CELL * 0.88);
    ctx.moveTo(fx + CELL * 0.12, fy + CELL / 2);
    ctx.lineTo(fx + CELL * 0.88, fy + CELL / 2);
    ctx.stroke();

    // trajektoria (linia łącząca segmenty)
    if (snake.length > 1) {
      ctx.strokeStyle = COL.tealGlow;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      snake.forEach((s, i) => {
        const cx = s.x * CELL + CELL / 2, cy = s.y * CELL + CELL / 2;
        i ? ctx.lineTo(cx, cy) : ctx.moveTo(cx, cy);
      });
      ctx.stroke();
    }

    // segmenty
    snake.forEach((s, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? COL.head : COL.teal;
      ctx.globalAlpha = isHead ? 1 : Math.max(0.45, 1 - i / (snake.length + 4));
      if (isHead) { ctx.shadowColor = COL.teal; ctx.shadowBlur = 14; }
      const pad = isHead ? 1.5 : 2.5;
      roundRect(s.x * CELL + pad, s.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, isHead ? 6 : 4);
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
  }

  // ---- sterowanie ----
  function setDir(x, y) {
    if (!running) return;
    if (x === -dir.x && y === -dir.y) return; // brak zawracania
    nextDir = { x, y };
  }

  const KEYMAP = {
    ArrowUp: [0, -1], KeyW: [0, -1],
    ArrowDown: [0, 1], KeyS: [0, 1],
    ArrowLeft: [-1, 0], KeyA: [-1, 0],
    ArrowRight: [1, 0], KeyD: [1, 0],
  };

  window.addEventListener('keydown', e => {
    // tylko gdy widoczna zakładka snake
    if (!document.getElementById('view-snake').classList.contains('view--active')) return;
    if (KEYMAP[e.code]) {
      e.preventDefault();
      setDir(KEYMAP[e.code][0], KEYMAP[e.code][1]);
    } else if (e.code === 'Space') {
      e.preventDefault();
      if (running) { paused = !paused; statusEl.textContent = paused ? 'pauza' : 'jedzie'; }
    } else if (e.code === 'KeyR') {
      start();
    }
  });

  document.querySelectorAll('.dpad button').forEach(b => {
    b.addEventListener('click', () => {
      const map = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      const d = map[b.dataset.dir];
      if (!running && !dead) start();
      setDir(d[0], d[1]);
    });
  });

  // swipe na mobile
  let tsx = 0, tsy = 0;
  canvas.addEventListener('touchstart', e => {
    tsx = e.touches[0].clientX; tsy = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tsx;
    const dy = e.changedTouches[0].clientY - tsy;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
    else setDir(0, dy > 0 ? 1 : -1);
  }, { passive: true });

  startBtn.addEventListener('click', start);

  // init render (przed startem)
  reset();
  running = false;
  overlay.classList.remove('hidden');

  // expose dla main.js (pauza przy wyjściu z zakładki)
  window.__snakePause = () => { if (running) { paused = true; statusEl.textContent = 'pauza'; } };
})();
