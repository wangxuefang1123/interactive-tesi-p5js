let bgImg;
let waterSound;

let fishImgs = [];
let fishes = [];

function preload() {
  bgImg = loadImage("assets/bg_lake.jpg");

  soundFormats("wav");
  waterSound = loadSound("assets/water.wav");

  fishImgs[0] = loadImage("assets/fish_1.png");
  fishImgs[1] = loadImage("assets/fish_2.png");
  fishImgs[2] = loadImage("assets/fish_3.png");
}

function setup() {
  createCanvas(895, 540);

  // 创建三条鱼
  for (let i = 0; i < 3; i++) {
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

// 浏览器限制：声音必须由用户触发
function mousePressed() {
  userStartAudio();
  if (!waterSound.isPlaying()) {
    waterSound.loop();
    waterSound.setVolume(0.5);
  }

  //for (let fish of fishes) {
  //  fish.clicked(mouseX, mouseY);
  //}
}

class Fish {
  constructor(x, y, img) {
    this.pos = createVector(x, y);
    this.img = img;

    this.normalSpeed = 0.4;
    this.fastSpeed = 2.2;
    this.speed = this.normalSpeed;

    this.angle = random(TWO_PI);
    this.noiseOffset = random(1000); // Perlin noise 偏移

    this.isFast = false;
    this.timer = 0;
    this.fastDuration = 120; // 约 2 秒（60fps）

    this.scaleFactor = 0.12; // 按原比例放大
  }

  update() {
    // 使用噪声调整角度，使鱼转向自然
    this.angle += map(noise(this.noiseOffset), 0, 1, -0.02, 0.02);
    this.noiseOffset += 0.01; // 控制变化速度

    // 速度微调，让鱼游动有起伏感
    let speedVariation = map(noise(this.noiseOffset + 100), 0, 1, -0.05, 0.05);
    let currentSpeed = this.speed + speedVariation;

    // 计算运动向量
    let v = p5.Vector.fromAngle(this.angle);
    v.mult(currentSpeed);
    this.pos.add(v);

    // 边界循环
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;

    // 鼠标悬停加速
    let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    if (d < (this.img.width * this.scaleFactor) / 2) {
      this.speed = this.fastSpeed;
      this.isFast = true;
      this.timer = 0;
    }

    // 加速状态计时
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

    // 尾巴轻微摆动效果
    let tailSwing = sin(frameCount * 0.05 + this.noiseOffset * 5) * 0.05;
    rotate(this.angle + tailSwing);

    imageMode(CENTER);
    let w = this.img.width * this.scaleFactor;
    let h = this.img.height * this.scaleFactor;
    image(this.img, 0, 0, w, h);

    pop();
  }
  //触碰鱼加速游的范围
  clicked(mx, my) {
    let d = dist(mx, my, this.pos.x, this.pos.y);
    if (d < (this.img.width * this.scaleFactor) / 5) {
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
