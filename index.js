/** Describes object (circle) drawn on canvas and its attributes. */

const BOOST = 30;
const SIDEBOOST = 5;
const G = -10;

const START_X = 500;
const START_Y = 200;

// Rocket dimensions
const WIDTH = 20;
const HEIGHT = 60;

const PAD_WIDTH = 100;
const PAD_HEIGHT = 10;
const PAD_MAMSL = 140;   // Meter above mean sea level

let LANDED = false;

class Rocket {
  constructor(x, y, ax, ay, m, vx = 0, vy = 0) {
    this.x = x;
    this.y = y;
    this.ax = ax;
    this.ay = ay;
    this.m = m;
    this.vx = vx;
    this.vy = vy;
    this.w = 0;
    this.isBoosting = false;
    this.boostLeft = false;
    this.boostRight = false;
    this.angle = getRandomInt(-0.1, 0.1);
  }

  move(dt) {
    let fx = 0;
    let fy = 0;

    if (this.boostRight) {
      this.w += Math.PI / 10000;
      fx += Math.cos(this.angle) * SIDEBOOST;
      fy += Math.sin(this.angle) * SIDEBOOST;
    } else if (this.boostLeft) {
      this.w -= Math.PI / 10000;
      fx += -Math.cos(this.angle) * SIDEBOOST;
      fy += -Math.sin(this.angle) * SIDEBOOST;
    } else {
      // not sure about this. Which side does it tip? does it depend on boost? Physics man...
      if (this.isBoosting) {
        this.w += Math.sin(this.angle) * (Math.PI / 50000);
      } else {
        this.w += -Math.sin(this.angle) * (Math.PI / 50000);
      }

    }
    this.angle += this.w;

    const b = this.isBoosting ? BOOST : 0;
    fx += Math.sin(this.angle) * b;
    fy += -Math.cos(this.angle) * b - G;
    this.ax = fx / this.m;
    this.ay = fy / this.m;

    this.vx += this.ax * dt;
    this.vy += this.ay * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw() {
    //draw a circle
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x + WIDTH / 2, this.y + HEIGHT / 2);
    ctx.rotate(this.angle);
    ctx.rect(-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
    // ctx.translate(-(this.x + 10), -(this.y + 30));
    ctx.fillStyle = this.isBoosting ? "red" : "black";
    ctx.fill();
    ctx.restore();
  }

  landingDetection() {
    if (this.y + HEIGHT >= c.height - PAD_MAMSL) {
      let contact = false;
      for (let p of pads) {
        if (p.checkAbove(this.x)) {
          contact = true;
          // contact with pad
          console.log(`angle: ${this.angle}`);
          console.log(`horizontal velocity: ${this.vx}`);
          console.log(`vertical velocity: ${this.vy}`);
          if (Math.abs(this.angle) < 0.07 && Math.abs(this.vx) < 2 && Math.abs(this.vy) < 3) {
            document.getElementById("status").innerHTML = "Smooth Landing!";
            if (p.redirect) {
              setTimeout(function () {
                window.location.href = p.redirect;
              }, 1500);
            }
          } else {
            document.getElementById("status").innerHTML = "You crashed!";
            document.getElementById('start').value = 'Retry...';
            document.getElementById('start').style.display = 'block';
            console.log('You crashed! Land smoother next time ffs.');
          }
          break;
        }
      }
      if (!contact) {
        document.getElementById("status").innerHTML = "Land on a pad ffs.";
        document.getElementById('start').value = 'Retry...';
        document.getElementById('start').style.display = 'block';
        console.log('Land on a pad ffs.');
      }
      LANDED = true;
    }
  }

  resolveEdgeCollision() {
    if (this.x > c.width || this.x < 0 || this.y < 0) {
      this.reset();
    }
  }

  reset() {
    this.x = getRandomInt(c.width / 2 - 100, c.width / 2 + 100);
    ;
    this.y = 100;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.w = 0;
    this.angle = getRandomInt(-0.1, 0.1);
  }

  start(x) {
    this.x = x - WIDTH/2;
    this.y = c.height - PAD_MAMSL - HEIGHT - 5;
    this.vx = 0;
    this.vy = -20;
    this.ax = 0;
    this.ay = -10;
    this.w = 0;
    this.angle = 0;
  }
}

class Pad {
  constructor(x, width, title = '', redirect = '') {
    this.x = x;
    this.width = width;
    this.title = title;
    this.redirect = redirect;
  }

  drawPad() {
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x, c.height - PAD_MAMSL);
    ctx.rect(-this.width / 2, 0, this.width, PAD_HEIGHT);
    ctx.fill();
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(this.title, 0, PAD_MAMSL / 2);
    ctx.restore();
  }

  checkAbove(x) {
    if (x > this.x - this.width / 2 && x < this.x + this.width / 2) {
      return true;
    }
    return false;
  }
}


function getRandomInt(min, max) {
  return Math.random() * (max - min) + min;
}

const c = document.getElementById("canvas");
const ctx = c.getContext("2d");


document.addEventListener('keydown', event => {
  if (event.code === 'ArrowUp') {
    rocket.isBoosting = true;
  }
})
document.addEventListener('keyup', event => {
  if (event.code === 'ArrowUp') {
    rocket.isBoosting = false;
  }
})

document.addEventListener('keydown', event => {
  if (event.code === 'ArrowLeft') {
    rocket.boostLeft = true;
  }
})
document.addEventListener('keyup', event => {
  if (event.code === 'ArrowLeft') {
    rocket.boostLeft = false;
  }
})

document.addEventListener('keydown', event => {
  if (event.code === 'ArrowRight') {
    rocket.boostRight = true;
  }
})
document.addEventListener('keyup', event => {
  if (event.code === 'ArrowRight') {
    rocket.boostRight = false;
  }
})

const startX = getRandomInt(c.width / 2 - 100, c.width / 2 + 100);
rocket = new Rocket(startX, 100, 0, 0, 10);

/** This function is ran with every animation frame and each time clears canvas, updates coordinates of all objects,
 * resolves collisions of objects and edges of canvas , resolves collisions between objects and finally draws all of them. */
function animate() {
  ctx.clearRect(0, 0, c.width, c.height - PAD_MAMSL);

  rocket.move(0.1);
  rocket.resolveEdgeCollision();
  rocket.landingDetection();
  rocket.draw();

  // drawLandingPads();
  if (!LANDED) {
    window.requestAnimationFrame(animate);
  }
}

function drawWater() {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, c.height - PAD_MAMSL, c.width, PAD_MAMSL);
  ctx.fillStyle = "aqua";
  ctx.fill();
  ctx.restore();
}

drawWater();

let pads = [];
pads.push(new Pad(c.width / 2, 140, 'Projects', './projects.html'));
pads.push(new Pad(c.width / 4, 80, 'About', './about.html'));
pads.push(new Pad(c.width / 4 * 3, 100, 'Contact', './contact.html'));

for (let p of pads) {
  p.drawPad();
}

document.getElementById("start").onclick = start;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.has('start')) {
  let startpad = null;
  for (let p of pads) {
    if (urlParams.get('start') === p.title) {
      startpad = p;
      break;
    }
  }
  startFromPad(startpad);
}

function startFromPad(startpad) {
  LANDED = false;
  rocket.start(startpad.x);

  document.getElementById("status").innerHTML = "Adi's Landing Page";
  document.getElementById('start').style.display = 'none';
  document.getElementById('intro').style.display = 'none';
  window.requestAnimationFrame(animate);
}

function start(startpad = null) {
  LANDED = false;
  rocket.reset();

  document.getElementById("status").innerHTML = "Adi's Landing Page";
  document.getElementById('start').style.display = 'none';
  document.getElementById('intro').style.display = 'none';
  window.requestAnimationFrame(animate);
}