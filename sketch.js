
//vv1
let imgs = [];
let animals = [];
let blobs = [];
let sticks = [];

let song;
let fft;
let played = false;
let locked = false;
let started = false;

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
  animals = [];
  blobs = [];
  sticks = [];

  generateBackground();
  generateLayout();
  generateMagicDust();
}

function generateBackground() {
  let palette = [
    [40, 255, 120],
    [120, 255, 80],
    [180, 80, 255],
    [120, 40, 180],
    [30, 20, 40]
  ];

  for (let i = 0; i < 45; i++) {
    let c = random(palette);

    blobs.push({
      x: random(width),
      y: random(height),
      size: random(150, 500),
      color: c
    });
  }
}

function drawBackground() {
  if (fft && song && song.isPlaying()) {
    fft.analyze();
  }

  let bass = fft ? fft.getEnergy("bass") : 0;
  let mid = fft ? fft.getEnergy("mid") : 0;

  noStroke();

  for (let b of blobs) {
    let s = b.size + map(bass, 0, 255, 0, 120);

    let offsetX =
      sin(frameCount * 0.01 + b.y) *
      map(mid, 0, 255, 0, 25);

    let offsetY =
      cos(frameCount * 0.01 + b.x) *
      map(mid, 0, 255, 0, 15);

    fill(
      b.color[0],
      b.color[1],
      b.color[2],
      map(bass, 0, 255, 20, 70)
    );

    ellipse(
      b.x + offsetX,
      b.y + offsetY,
      s
    );
  }

  let moonSize = 220 + map(bass, 0, 255, 0, 35);

  fill(140, 80, 255, 140);

  circle(
    width * 0.82,
    height * 0.18,
    moonSize
  );
}

function generateMagicDust() {
  for (let i = 0; i < 250; i++) {
    sticks.push({
      x: random(width),
      y: random(height),
      size: random(2, 8),
      color: random([
        [40, 255, 120],
        [180, 80, 255],
        [120, 255, 80]
      ])
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
      140
    );

    circle(s.x, s.y, s.size);
  }
}

function generateLayout() {
  let tries = 0;

  let targetCount = 30;

  while (
    animals.length < targetCount &&
    tries < 10000
  ) {
    let img = random(imgs);

    let scaleValue = random(0.12, 0.22);

    let w = img.width * scaleValue;
    let h = img.height * scaleValue;

    // 회전과 확대를 고려해 가장자리 여백 확보
    let margin = max(w, h) * 0.8 + 8;

    let x = random(
      min(margin, width / 2),
      max(width - margin, width / 2)
    );

    let y = random(
      min(margin, height / 2),
      max(height - margin, height / 2)
    );

    let angle = random(-PI / 6, PI / 6);

    let ok = true;

    for (let other of animals) {
      let d = dist(x, y, other.x, other.y);

      let minDist =
        (max(w, h) + max(other.w, other.h)) * 0.35 + 15;

      if (d < minDist) {
        ok = false;
        break;
      }
    }

    if (ok) {
      animals.push({
        img: img,
        x: x,
        y: y,
        w: w,
        h: h,
        angle: angle
      });
    }

    tries++;
  }
}

function drawAnimals() {
  imageMode(CENTER);

  if (fft && song && song.isPlaying()) {
    fft.analyze();
  }

  let bass = fft ? fft.getEnergy("bass") : 0;
  let mid = fft ? fft.getEnergy("mid") : 0;
  let treble = fft ? fft.getEnergy("treble") : 0;

  for (let a of animals) {
    push();

    translate(a.x, a.y);

    rotate(
      a.angle +
      sin(frameCount * 0.04 + a.x) *
      map(mid, 0, 255, 0, 0.2)
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

  generateArtwork();
}

function mousePressed() {
  triggerSound();
  return false;
}

window.addEventListener("message", function(event) {
  if (event.data === "triggerSound") {
    triggerSound();
  }
});

function keyPressed() {
  if (key === "r" || key === "R") {
    saveGif("poison-garden", 8);
  }

  if (key === "s" || key === "S") {
    saveCanvas("poison-garden", "png");
  }
}
