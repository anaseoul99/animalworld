//v1

let imgs = [];
let animals = [];
let blobs = [];
let sticks = [];

let speaker;
let locked = false;
let lastTrigger = 0;

function preload() {
  imgs.push(loadImage("deer.png"));
  imgs.push(loadImage("bird.png"));
  imgs.push(loadImage("bear.png"));
  imgs.push(loadImage("unicorn.png"));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CORNER);
  noStroke();

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

function isOn() {
  return locked || (speaker && !speaker.paused);
}

function levels() {
  if (!isOn()) return { bass: 0, mid: 0, treble: 0 };
  return { bass: 100, mid: 80, treble: 60 };
}

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
  const { bass, mid } = levels();

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

    circle(b.x + offsetX, b.y + offsetY, s);
  }

  let moonSize = 220 + map(bass, 0, 255, 0, 35);

  fill(140, 80, 255, 120);
  circle(width * 0.82, height * 0.18, moonSize);
}

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
    fill(s.color[0], s.color[1], s.color[2], 160);
    circle(s.x, s.y, s.size);
  }
}

function generateLayout() {
  animals = [];

  let animalCount = width < 600 ? 24 : 30;
  let responsiveScale = constrain(width / 1242, 0.35, 1);

  for (let i = 0; i < animalCount; i++) {
    let img = random(imgs);
    let scaleValue = random(0.12, 0.22) * responsiveScale;
    let w = img.width * scaleValue;
    let h = img.height * scaleValue;
    let marginX = min(max(w, h) * 0.8 + 5, width / 2);
    let marginY = min(max(w, h) * 0.8 + 5, height / 2);

    animals.push({
      img: img,
      x: random(marginX, max(marginX, width - marginX)),
      y: random(marginY, max(marginY, height - marginY)),
      w: w,
      h: h,
      angle: random(-PI / 3, PI / 3),
      phase: random(TWO_PI),
      speed: random(0.5, 1.5)
    });
  }
}

function drawAnimals() {
  imageMode(CENTER);

  const { bass, mid, treble } = levels();

  for (let a of animals) {
    push();
    translate(a.x, a.y);
    rotate(
      a.angle +
      sin(frameCount * 0.04 * a.speed + a.phase) *
      map(mid, 0, 255, 0, 0.15)
    );
    scale(map(bass, 0, 255, 1, 1.15));
    tint(255, map(treble, 0, 255, 180, 255));
    image(a.img, 0, 0, a.w, a.h);
    pop();
  }

  noTint();
  imageMode(CORNER);
}

function speakerAudio() {
  if (!speaker) {
    speaker = new Audio("1-2.mp3");
    speaker.setAttribute("playsinline", "");
    speaker.preload = "auto";
  }
  return speaker;
}

function triggerSound() {
  if (millis() - lastTrigger < 400) return;
  lastTrigger = millis();

  const audio = speakerAudio();

  if (!audio.paused) {
    audio.pause();
    audio.currentTime = 0;
    locked = false;
  } else {
    locked = true;
    const played = audio.play();
    if (played) {
      played.catch(() => {
        locked = false;
      });
    }
  }
}

function mousePressed() {
  triggerSound();
  return false;
}

function touchStarted() {
  triggerSound();
  return false;
}

document.addEventListener("touchstart", (event) => {
  triggerSound();
  event.preventDefault();
}, { passive: false });

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
