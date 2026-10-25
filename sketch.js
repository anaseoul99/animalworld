//v1

let imgs = [];
let animals = [];
let blobs = [];
let sticks = [];

let song;
let fft;
let lastTrigger = 0;

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
  fft = new p5.FFT(0.75, 128);
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

function energy() {
  if (!song || !song.isPlaying()) return { bass: 0, mid: 0, treble: 0 };
  fft.analyze();
  return {
    bass: fft.getEnergy("bass"),
    mid: fft.getEnergy("mid"),
    treble: fft.getEnergy("treble")
  };
}

function generateBackground() {
  blobs = [];
  const palette = [
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
  const { bass } = energy();
  noStroke();
  for (let b of blobs) {
    fill(b.color[0], b.color[1], b.color[2], 24 + bass * 0.12);
    circle(b.x, b.y, b.size + bass * 0.35);
  }
  fill(140, 80, 255, 120);
  circle(width * 0.82, height * 0.18, 220 + bass * 0.2);
}

function generateMagicDust() {
  sticks = [];
  const colors = [
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
    fill(s.color[0], s.color[1], s.color[2], 160);
    circle(s.x, s.y, s.size);
  }
}

function generateLayout() {
  animals = [];
  const animalCount = width < 600 ? 24 : 30;
  const responsiveScale = constrain(width / 1242, 0.35, 1);

  for (let i = 0; i < animalCount; i++) {
    const img = random(imgs);
    const scaleValue = random(0.12, 0.22) * responsiveScale;
    const w = img.width * scaleValue;
    const h = img.height * scaleValue;
    const marginX = min(max(w, h) * 0.8 + 5, width / 2);
    const marginY = min(max(w, h) * 0.8 + 5, height / 2);
    animals.push({
      img,
      x: random(marginX, max(marginX, width - marginX)),
      y: random(marginY, max(marginY, height - marginY)),
      w,
      h,
      angle: random(-PI / 3, PI / 3),
      phase: random(TWO_PI)
    });
  }
}

function drawAnimals() {
  const { bass, mid, treble } = energy();
  imageMode(CENTER);

  for (let a of animals) {
    const kick = bass / 255;
    const sway = mid / 255;
    push();
    translate(a.x + sin(a.phase) * sway * 16, a.y - kick * 48);
    rotate(a.angle + sin(frameCount * 0.08 + a.phase) * sway * 0.5);
    scale(1 + kick * 0.5);
    tint(255, 200 + treble * 0.2);
    image(a.img, 0, 0, a.w, a.h);
    pop();
  }

  noTint();
  imageMode(CORNER);
}

function triggerSound() {
  if (millis() - lastTrigger < 400) return;
  lastTrigger = millis();
  if (!song || !song.isLoaded()) return;

  userStartAudio();
  if (song.isPlaying()) song.pause();
  else song.play();
}

function mousePressed() {
  triggerSound();
  return false;
}

function touchStarted() {
  triggerSound();
  return false;
}

window.addEventListener("message", function (event) {
  if (event.data === "triggerSound") triggerSound();
});

function keyPressed() {
  if (key === "r" || key === "R") saveGif("poison-garden", 8);
  if (key === "s" || key === "S") saveCanvas("poison-garden", "png");
}
