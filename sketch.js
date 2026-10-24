let imgs = [];
let animals = [];
let blobs = [];
let sticks = [];

let song;
let fft;

let locked = false;

function preload() {
  imgs.push(loadImage("deer.png"));
  imgs.push(loadImage("bird.png"));
  imgs.push(loadImage("bear.png"));
  imgs.push(loadImage("unicorn.png"));

  song = loadSound("1-2.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  imageMode(CORNER);
  noStroke();

  song.setVolume(1);

  fft = new p5.FFT();
  fft.setInput(song);

  generateArtwork();
}

function draw() {
  background(10, 10, 18);

  drawBackground();
  drawMagicDust();
  drawAnimals();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateArtwork();
}

function generateArtwork() {
  generateBackground();
  generateLayout();
  generateMagicDust();
}

// 배경 원을 화면 전체에 분산
function generateBackground() {
  blobs = [];

  let palette = [
    [40, 255, 120],
    [120, 255, 80],
    [180, 80, 255],
    [120, 40, 180],
    [30, 20, 40]
  ];

  for (let i = 0; i < 45; i++) {
    blobs.push({
      x: random(width),
      y: random(height),
      size: random(150, 400),
      color: random(palette),
      phase: random(TWO_PI)
    });
  }
}

function drawBackground() {
  let bass = 0;
  let mid = 0;

  if (song && song.isPlaying()) {
    fft.analyze();
    bass = fft.getEnergy("bass");
    mid = fft.getEnergy("mid");
  }

  noStroke();

  for (let b of blobs) {
    let s = b.size + map(bass, 0, 255, 0, 100);

    let offsetX =
      sin(frameCount * 0.01 + b.phase) *
      map(mid, 0, 255, 0, 25);

    let offsetY =
      cos(frameCount * 0.01 + b.phase) *
      map(mid, 0, 255, 0, 15);

    fill(
      b.color[0],
      b.color[1],
      b.color[2],
      map(bass, 0, 255, 20, 65)
    );

    circle(
      b.x + offsetX,
      b.y + offsetY,
      s
    );
  }

  let moonSize = 220 + map(bass, 0, 255, 0, 35);

  fill(140, 80, 255, 120);

  circle(
    width * 0.82,
    height * 0.18,
    moonSize
  );
}

// 매직 더스트를 화면 전체에 분산
function generateMagicDust() {
  sticks = [];

  let colors = [
    [40, 255, 120],
    [180, 80, 255],
    [120, 255, 80]
  ];

  for (let i = 0; i < 250; i++) {
    sticks.push({
      x: random(width),
      y: random(height),
      size: random(2, 8),
      color: random(colors)
    });
  }
}

function drawMagicDust() {
  noStroke();

  for (let s of sticks) {
    fill(
      s.color[0],
      s.color[1],
      s.color[2],
      160
    );

    circle(s.x, s.y, s.size);
  }
}

// 동물 30개를 화면 전체에 고르게 배치
function generateLayout() {
  animals = [];

  let columns = max(3, round(sqrt(30 * width / height)));
  let rows = ceil(30 / columns);

  let cellW = width / columns;
  let cellH = height / rows;

  for (let i = 0; i < 30; i++) {
    let img = random(imgs);

    let col = i % columns;
    let row = floor(i / columns);

    let scaleValue = random(0.12, 0.22);

    let w = img.width * scaleValue;
    let h = img.height * scaleValue;

    // 각 영역 안에서 위치를 조금씩 무작위로 변경
    let x = (col + 0.5) * cellW +
      random(-cellW * 0.25, cellW * 0.25);

    let y = (row + 0.5) * cellH +
      random(-cellH * 0.25, cellH * 0.25);

    // 화면 경계 안으로 제한
    x = constrain(x, w / 2 + 5, width - w / 2 - 5);
    y = constrain(y, h / 2 + 5, height - h / 2 - 5);

    animals.push({
      img: img,
      x: x,
      y: y,
      w: w,
      h: h,
      angle: random(-PI / 4, PI / 4)
    });
  }
}

function drawAnimals() {
  imageMode(CENTER);

  let bass = 0;
  let mid = 0;
  let treble = 0;

  if (song && song.isPlaying()) {
    fft.analyze();

    bass = fft.getEnergy("bass");
    mid = fft.getEnergy("mid");
    treble = fft.getEnergy("treble");
  }

  for (let a of animals) {
    push();

    translate(a.x, a.y);

    rotate(
      a.angle +
      sin(frameCount * 0.04 + a.x) *
      map(mid, 0, 255, 0, 0.15)
    );

    let s = map(bass, 0, 255, 1, 1.15);

    scale(s);

    tint(
      255,
      map(treble, 0, 255, 180, 255)
    );

    image(
      a.img,
      0,
      0,
      a.w,
      a.h
    );

    pop();
  }

  noTint();
  imageMode(CORNER);
}

// 클릭으로 음악 재생 / 정지
function triggerSound() {
  if (!song) return;

  if (song.isPlaying() || locked) {
    song.stop();
    locked = false;
  } else {
    userStartAudio();
    song.play();
    locked = true;
  }
}

function mousePressed() {
  triggerSound();
  return false;
}

// Cargo iframe 연동
window.addEventListener("message", function(event) {
  if (event.data === "triggerSound") {
    triggerSound();
  }
});

// 저장 단축키
function keyPressed() {
  if (key === "r" || key === "R") {
    saveGif("poison-garden", 8);
  }

  if (key === "s" || key === "S") {
    saveCanvas("poison-garden", "png");
  }
}
