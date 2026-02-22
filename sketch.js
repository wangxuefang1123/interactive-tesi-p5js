/* global p5 */
let bgImg;
let waterSound;

let fishImgs = [];
let fishes = [];

function preload() {
  bgImg = loadImage("assets/lake_img.jpg");

  soundFormats("wav");
  waterSound = loadSound("assets/water.wav");

  fishImgs[0] = loadImage("assets/fish_1.png");
  fishImgs[1] = loadImage("assets/fish_2.png");
  fishImgs[2] = loadImage("assets/fish_3.png");
}

function setup() {
  createCanvas(895, 540);

  // 创建三条鱼
  for (let i = 0; i < 5; i++) {
    let img = random(fishImgs);
    fishes.push(new Fish(random(width), random(height), img));
  }
}

function draw() {
  image(bgImg, 0, 0, width, height);

  for (let fish of fishes) {
    fish.update();
    fish.display();
  }
}

// 鼠标点击（电脑）

function mousePressed() {
  startSound();

  for (let fish of fishes) {
    fish.clicked(mouseX, mouseY);
  }
}

// 手指触摸（手机 / 平板）

function touchStarted() {
  startSound();

  for (let fish of fishes) {
    fish.clicked(mouseX, mouseY);
  }

  return false; // 防止页面滚动
}

// 播放水声（浏览器需要用户触发）

function startSound() {
  userStartAudio();

  if (!waterSound.isPlaying()) {
    waterSound.loop();
    waterSound.setVolume(0.5);
  }
}

// 鱼类

class Fish {
  constructor(x, y, img) {
    this.pos = createVector(x, y);
    this.img = img;

    this.normalSpeed = 0.8;
    this.fastSpeed = 2.2;
    this.speed = this.normalSpeed;

    this.angle = random(TWO_PI);
    this.noiseOffset = random(1000);

    this.isFast = false;
    this.timer = 0;
    this.fastDuration = 120; // 约2秒（60fps）

    this.scaleFactor = 0.15;
  }

  update() {
    // 噪声控制方向变化
    this.angle += map(noise(this.noiseOffset), 0, 1, -0.02, 0.02);
    this.noiseOffset += 0.01;

    // 速度微变化
    let speedVariation = map(noise(this.noiseOffset + 100), 0, 1, -0.1, 0.1);
    let currentSpeed = this.speed + speedVariation;

    let v = createVector(cos(this.angle), sin(this.angle));
    v.mult(currentSpeed);
    this.pos.add(v);

    // 边界循环
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;

    // 加速计时
    if (this.isFast) {
      this.timer++;
      if (this.timer > this.fastDuration) {
        this.resetSpeed();
      }
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);

    // 尾巴摆动
    let tailSwing = sin(frameCount * 0.05 + this.noiseOffset * 5) * 0.05;
    rotate(this.angle + tailSwing);

    imageMode(CENTER);
    let w = this.img.width * this.scaleFactor;
    let h = this.img.height * this.scaleFactor;
    image(this.img, 0, 0, w, h);

    pop();
  }

  // 点击 / 触摸检测
  clicked(mx, my) {
    let d = dist(mx, my, this.pos.x, this.pos.y);

    // 点击范围（适合触屏）
    if (d < this.img.width * this.scaleFactor * 0.6) {
      this.speed = this.fastSpeed;
      this.isFast = true;
      this.timer = 0;
    }
  }

  resetSpeed() {
    this.speed = this.normalSpeed;
    this.isFast = false;
    this.timer = 0;
  }
}
