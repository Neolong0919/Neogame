const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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
window.addEventListener('resize', resizeCanvas); // 监听窗口大小变化

// 加载背景和人物图片
const background = new Image();
const player = new Image();

background.src = './assets/background.png';
player.src = './assets/player.png';

// 初始化人物和背景位置
let playerX = 200;
let playerY = canvas.height - 350; // 人物站在草坪上
const playerWidth = 128;
const playerHeight = 128;
let backgroundX = 0;
const playerSpeed = 5; // 每次移动5像素
let facingRight = true; // 初始朝向

// 跳跃相关变量
let isJumping = false; // 是否在跳跃中
let jumpVelocity = 0; // 跳跃初速度
const gravity = 0.8; // 重力加速度
const jumpStrength = 15; // 跳跃初速度
const groundLevel = canvas.height - 350; // 草坪的Y轴位置

// 监听键盘事件
let keys = {};
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

// 更新人物位置、跳跃和背景滚动
function update() {
  // 移动人物
  if (keys['ArrowRight']) {
    playerX += playerSpeed;
    backgroundX -= playerSpeed / 2;
    facingRight = true; // 朝向右

    if (playerX > canvas.width / 2) {
      playerX = canvas.width / 2;
    }
  }

  if (keys['ArrowLeft'] && backgroundX < 0) {
    playerX -= playerSpeed;
    backgroundX += playerSpeed / 2;
    facingRight = false; // 朝向左
  }

  playerX = Math.max(0, playerX); // 限制人物不超出左侧边界

  // 处理跳跃逻辑
  if (keys[' '] && !isJumping) {
    isJumping = true;
    jumpVelocity = -jumpStrength; // 设置初始向上的速度
  }

  if (isJumping) {
    playerY += jumpVelocity; // 根据速度更新Y轴位置
    jumpVelocity += gravity; // 应用重力

    // 检测是否落地
    if (playerY >= groundLevel) {
      playerY = groundLevel; // 确保人物在地面上
      isJumping = false; // 结束跳跃
      jumpVelocity = 0; // 重置速度
    }
  }
}

// 绘制场景和人物
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 计算背景图片缩放比例
  const bgWidth = background.width;
  const bgHeight = background.height;
  const scale = Math.max(canvas.width / bgWidth, canvas.height / bgHeight);

  const scaledWidth = bgWidth * scale;
  const scaledHeight = bgHeight * scale;

  const xOffset = (canvas.width - scaledWidth) / 2;
  const yOffset = (canvas.height - scaledHeight) / 2;

  // 绘制背景图片，并确保按比例居中
  ctx.drawImage(background, 0, 0, bgWidth, bgHeight, xOffset, yOffset, scaledWidth, scaledHeight);

  // 绘制人物，根据朝向翻转
  ctx.save(); // 保存当前画布状态

  if (!facingRight) {
    // 水平翻转画布
    ctx.scale(-1, 1);
    ctx.drawImage(player, -playerX - playerWidth, playerY, playerWidth, playerHeight);
  } else {
    ctx.drawImage(player, playerX, playerY, playerWidth, playerHeight);
  }

  ctx.restore(); // 恢复画布状态
}

// 游戏循环
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// 确保图片加载完成后启动游戏
Promise.all([
  new Promise((resolve) => (background.onload = resolve)),
  new Promise((resolve) => (player.onload = resolve)),
]).then(() => {
  console.log('所有图片加载完成，启动游戏');
  gameLoop();
});
