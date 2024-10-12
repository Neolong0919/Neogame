const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 按钮引用
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

// 设置画布大小，并保持16:9比例
function resizeCanvas() {
  const aspectRatio = 16 / 9;
  canvas.width = window.innerWidth;
  canvas.height = window.innerWidth / aspectRatio;

  if (canvas.height > window.innerHeight) {
    canvas.height = window.innerHeight;
    canvas.width = canvas.height * aspectRatio;
  }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 加载图片资源
const background = new Image();
const midLayer = new Image();
const farLayer = new Image();
const player = new Image();
const poopImg = new Image();

background.src = './assets/background.png';
midLayer.src = './assets/mid.png';
farLayer.src = './assets/far.png';
player.src = './assets/player.png';
poopImg.src = './assets/poop.png';

// 初始化人物位置和状态
let playerX = 100;
let playerY = canvas.height - 350;
const playerWidth = 64;
const playerHeight = 128;
const playerSpeed = 5;

let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.8;
const jumpStrength = 15;
const groundLevel = canvas.height - 350;

let midX = 0, farX = 0;
const midSpeed = 0.5;
const farSpeed = 1;

let facingRight = true;
let poops = [];
let poopBaseSpeed = 2;
const poopSpeedVariation = 2;
let poopInterval = 2000;
const maxPoops = 10;
let startTime;
let isGameOver = false;
let finalScore = 0; // 用于保存最终得分

let keys = {};
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

// 初始化按钮逻辑
function init() {
  startButton.style.display = 'block';
  restartButton.style.display = 'none';
  isGameOver = false;
  poops = [];
  finalScore = 0; // 重置分数
}

// 开始游戏按钮逻辑
startButton.addEventListener('click', () => {
  startButton.style.display = 'none';
  startGame();
});

// 重新开始按钮逻辑
restartButton.addEventListener('click', () => {
  restartButton.style.display = 'none';
  startGame();
});

// 启动游戏
function startGame() {
  playerX = 100;
  playerY = groundLevel;
  startTime = performance.now(); // 记录游戏开始时间
  isGameOver = false;
  poops = [];
  finalScore = 0;
  setInterval(spawnPoop, poopInterval);
  gameLoop();
}

// 更新背景，实现无缝循环滚动
function updateBackground() {
  midX -= midSpeed;
  farX -= farSpeed;

  if (midX <= -canvas.width) midX = 0;
  if (farX <= -canvas.width) farX = 0;
}

// 更新玩家
function updatePlayer() {
  if (keys['ArrowRight'] && playerX + playerWidth < canvas.width) {
    playerX += playerSpeed;
    facingRight = true;
  }
  if (keys['ArrowLeft'] && playerX > 0) {
    playerX -= playerSpeed;
    facingRight = false;
  }
  if (keys[' '] && !isJumping) {
    isJumping = true;
    jumpVelocity = -jumpStrength;
  }
  if (isJumping) {
    playerY += jumpVelocity;
    jumpVelocity += gravity;
    if (playerY >= groundLevel) {
      playerY = groundLevel;
      isJumping = false;
      jumpVelocity = 0;
    }
  }
}

// 生成大便
function spawnPoop() {
  if (poops.length >= maxPoops) return;
  const x = Math.random() * canvas.width;
  const y = Math.random() < 0.5 ? -50 : canvas.height + 50;
  const angle = Math.atan2(playerY - y, playerX - x);
  const speed = poopBaseSpeed + Math.random() * poopSpeedVariation;
  poops.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
}

// 更新大便
function updatePoops() {
  poops.forEach((poop, index) => {
    poop.x += poop.vx;
    poop.y += poop.vy;
    if (
      poop.x < -50 || poop.x > canvas.width + 50 ||
      poop.y < -50 || poop.y > canvas.height + 50
    ) {
      poops.splice(index, 1);
    }
    if (
      poop.x < playerX + playerWidth &&
      poop.x + 32 > playerX &&
      poop.y < playerY + playerHeight &&
      poop.y + 32 > playerY
    ) {
      endGame(); // 游戏结束时调用 endGame()
    }
  });
}

// 绘制计时器和分数
function drawTimer() {
  const elapsed = (performance.now() - startTime) / 1000;
  ctx.font = '24px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText(`Time: ${elapsed.toFixed(3)}s`, 10, 30);
  finalScore = elapsed.toFixed(3); // 保存最终得分
}

// 绘制场景
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(farLayer, Math.floor(farX), 0, canvas.width + 1, canvas.height);
  ctx.drawImage(farLayer, Math.floor(farX + canvas.width), 0, canvas.width + 1, canvas.height);

  ctx.drawImage(midLayer, Math.floor(midX), 0, canvas.width + 1, canvas.height);
  ctx.drawImage(midLayer, Math.floor(midX + canvas.width), 0, canvas.width + 1, canvas.height);

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.save();
  if (!facingRight) {
    ctx.translate(playerX + playerWidth / 2, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(player, -playerWidth / 2, playerY, playerWidth, playerHeight);
  } else {
    ctx.drawImage(player, playerX, playerY, playerWidth, playerHeight);
  }
  ctx.restore();

  poops.forEach(poop => ctx.drawImage(poopImg, poop.x, poop.y, 32, 32));
  drawTimer();
}

// 结束游戏
function endGame() {
  isGameOver = true;
}

// 显示最终分数
function showFinalScore() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '48px Arial';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  ctx.fillText(`Game Over! Score: ${finalScore}s`, canvas.width / 2, canvas.height / 2);
}

// 游戏循环
function gameLoop() {
  if (isGameOver) {
    showFinalScore();
    restartButton.style.display = 'block';
    return;
  }
  updateBackground();
  updatePlayer();
  updatePoops();
  draw();
  requestAnimationFrame(gameLoop);
}

// 初始化游戏
init();
