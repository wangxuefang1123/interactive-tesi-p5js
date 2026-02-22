/* global p5 */

let bgImg;
let waterSound;

let fishImgs = [];
let fishes = [];

//世界真实尺寸
let worldW = 1920;
let worldH = 1080;

function preload() {
  bgImg = loadImage("assets/lake_img.png");

  soundFormats("wav");
  waterSound = loadSound("assets/water.wav");

  fishImgs[0] = loadImage("assets/fish_1.png");
  fishImgs[1] = loadImage("assets/fish_2.png");
  fishImgs[2] = loadImage("assets/fish_3.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 创建鱼（在世界坐标中）
  for (let i = 0; i < 5; i++) {
    let img = random(fishImgs);
    fishes.push(new Fish(random(worldW), random(worldH), img));
  }
}

function draw() {
  background(0);

  //等比缩放世界到屏幕
  let scaleFactor = min(width / worldW, height / worldH);

  push();

  // 居中显示
  translate(
    (width - worldW * scaleFactor) / 2,
    (height - worldH * scaleFactor) / 2,
  );

  scale(scaleFactor);

  //背景按世界尺寸画
  image(bgImg, 0, 0, worldW, worldH);

  for (let fish of fishes) {
    fish.update();
    fish.display();
  }

  pop();
}

//屏幕尺寸变化
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 鼠标点击

function mousePressed() {
  startSound();
  handleTouch(mouseX, mouseY);
}

// 触屏

function touchStarted() {
  startSound();
  handleTouch(mouseX, mouseY);
  return false;
}

//把屏幕坐标转换为世界坐标
function handleTouch(px, py) {
  let scaleFactor = min(width / worldW, height / worldH);

  let offsetX = (width - worldW * scaleFactor) / 2;
  let offsetY = (height - worldH * scaleFactor) / 2;

  let worldX = (px - offsetX) / scaleFactor;
  let worldY = (py - offsetY) / scaleFactor;

  for (let fish of fishes) {
    fish.clicked(worldX, worldY);
  }
}

function startSound() {
  userStartAudio();
  if (!waterSound.isPlaying()) {
    waterSound.loop();
    waterSound.setVolume(0.5);
  }
}

// 鱼
class Fish {
  constructor(x, y, img) {
    this.pos = createVector(x, y);
    this.img = img;

    this.normalSpeed = 2.0;
    this.fastSpeed = 5.0;
    this.speed = this.normalSpeed;

    this.angle = random(TWO_PI);
    this.noiseOffset = random(1000);

    this.isFast = false;
    this.timer = 0;
    this.fastDuration = 120;

    this.scaleFactor = 0.3;
  }

  update() {
    this.angle += map(noise(this.noiseOffset), 0, 1, -0.02, 0.02);
    this.noiseOffset += 0.01;

    let speedVariation = map(noise(this.noiseOffset + 100), 0, 1, -0.1, 0.1);
    let currentSpeed = this.speed + speedVariation;

    let v = createVector(cos(this.angle), sin(this.angle));
    v.mult(currentSpeed);
    this.pos.add(v);

    // 使用世界边界
    if (this.pos.x > worldW) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = worldW;
    if (this.pos.y > worldH) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = worldH;

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

    let tailSwing = sin(frameCount * 0.05 + this.noiseOffset * 5) * 0.05;
    rotate(this.angle + tailSwing);

    imageMode(CENTER);
    let w = this.img.width * this.scaleFactor;
    let h = this.img.height * this.scaleFactor;
    image(this.img, 0, 0, w, h);

    pop();
  }

  clicked(mx, my) {
    let d = dist(mx, my, this.pos.x, this.pos.y);

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
