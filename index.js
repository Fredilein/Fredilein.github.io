/** Describes object (circle) drawn on canvas and its attributes. */

let BOOST = 22;
let SIDEBOOST = 5;
let G = -8;

const START_X = 500;
const START_Y = 200;

// Rocket dimensions
const WIDTH = 20;
const HEIGHT = 60;

let PAD_WIDTH = 100;
let PAD_HEIGHT = 20;
let PAD_MAMSL = 140;   // Meter above mean sea level

let LANDED = false;

class Rocket {
  constructor(x, y, ax, ay, m, vx = 0, vy = 0, width= WIDTH, height= HEIGHT) {
    this.x = x;
    this.y = y;
    this.ax = ax;
    this.ay = ay;
    this.m = m;
    this.vx = vx;
    this.vy = vy;
    this.w = 0;
    this.width = width;
    this.height = height;
    this.isBoosting = false;
    this.boostLeft = false;
    this.boostRight = false;
    this.angle = getRandomInt(-0.1, 0.1);
  }

  move(dt) {
    let fx = 0;
    let fy = 0;

    if (this.boostRight) {
      this.w += Math.PI / 20000;
      fx += Math.cos(this.angle) * SIDEBOOST;
      fy += Math.sin(this.angle) * SIDEBOOST;
    } else if (this.boostLeft) {
      this.w -= Math.PI / 20000;
      fx += -Math.cos(this.angle) * SIDEBOOST;
      fy += -Math.sin(this.angle) * SIDEBOOST;
    } else {
      // not sure about this. Which side does it tip? does it depend on boost? Physics man...
      if (this.isBoosting) {
        this.w += Math.sin(this.angle) * (Math.PI / 120000);
      } else {
        this.w += -Math.sin(this.angle) * (Math.PI / 100000);
      }

    }
    this.angle += this.w;
    this.angle = (this.angle + this.w) % (2 * Math.PI);

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
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.angle);
    ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    // ctx.translate(-(this.x + 10), -(this.y + 30));
    ctx.fillStyle = this.isBoosting ? "orange" : "white";
    ctx.fill();
    ctx.restore();
  }

  landingDetection() {
    if (this.y + this.height >= c.height - PAD_MAMSL) {
      let contact = false;
      for (let p of pads) {
        if (p.checkAbove(this.x + this.width/2)) {
          contact = true;
          // contact with pad
          console.log(`angle: ${this.angle}`);
          console.log(`horizontal velocity: ${this.vx}`);
          console.log(`vertical velocity: ${this.vy}`);
          if (checkSmoothLanding(this.angle, this.vx, this.vy)) {
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
    if (this.y < 0) {
      this.reset();
    } else if (this.x > c.width) {
      this.x = 5;
    } else if (this.x < 0) {
      this.x = c.width - 5;
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
    this.x = x - this.width/2;
    this.y = c.height - PAD_MAMSL - this.height - 5;
    this.vx = 0;
    this.vy = is_touch_device() ? -40 : -20;
    this.ax = 0;
    this.ay = is_touch_device() ? -20 : -10;
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
    ctx.fillStyle = "black";
    ctx.translate(this.x, c.height - PAD_MAMSL);
    ctx.rect(-this.width / 2, 0, this.width, PAD_HEIGHT);
    ctx.fill();
    ctx.font = "30px Arial";
    // ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(this.title, 0, 100);
    ctx.restore();
  }

  checkAbove(x) {
    if (x > this.x - this.width / 2 && x < this.x + this.width / 2) {
      return true;
    }
    return false;
  }
}


function checkSmoothLanding(a, vx, vy) {
  if (is_touch_device()){
    if (Math.abs(a) < 0.22 && Math.abs(vx) < 6 && Math.abs(vy) < 7) {
      return true;
    } else {
      return false;
    }
  } else {
    if (Math.abs(a) < 0.09 && Math.abs(vx) < 2.5 && Math.abs(vy) < 3.5) {
      return true;
    } else {
      return false;
    }
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
  ctx.fillStyle = "lightgrey";
  ctx.fill();
  ctx.restore();
}

drawWater();



document.getElementById("start").onclick = start;



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



// Experimental for touch devices

function is_touch_device() {
  return ( 'ontouchstart' in window ) ||
      ( navigator.maxTouchPoints > 0 ) ||
      ( navigator.msMaxTouchPoints > 0 );
}

const startX = getRandomInt(c.width / 2 - 100, c.width / 2 + 100);


let pads = [];




if (is_touch_device()) {
  PAD_MAMSL = 500;
  BOOST = 44;
  SIDEBOOST = 10;
  G = -16;
  drawWater();
  document.getElementById('body').style.fontSize = '2em';
  document.getElementById('start').style.height = '160px';
  rocket = new Rocket(startX, 100, 0, 0, 10, 0, 0, 40, 120);
  pads.push(new Pad(c.width / 2, 240, 'Projects', './projects.html'));
  pads.push(new Pad(c.width / 5, 160, 'About', './about.html'));
  pads.push(new Pad(c.width / 5 * 4, 190, 'Contact', './contact.html'));
} else {
  document.getElementById('touch-buttons').style.display = 'none';
  rocket = new Rocket(startX, 100, 0, 0, 10, 0, 0, 20, 60);
  pads.push(new Pad(c.width / 2, 140, 'Projects', './projects.html'));
  pads.push(new Pad(c.width / 4, 90, 'About', './about.html'));
  pads.push(new Pad(c.width / 4 * 3, 100, 'Contact', './contact.html'));
}

for (let p of pads) {
  p.drawPad();
}

// Prevent mobile touch stuff...
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('select', event => event.preventDefault());
document.addEventListener('copy', event => event.preventDefault());
document.addEventListener('cut', event => event.preventDefault());
document.addEventListener('selectstart', event => event.preventDefault());
document.oncontextmenu = new Function("return false;");

const upBtn = document.getElementById("boost-up");
const leftBtn = document.getElementById("boost-left");
const rightBtn = document.getElementById("boost-right");
upBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  rocket.isBoosting = true;
});
upBtn.addEventListener("touchend", e => {
  e.preventDefault();
  rocket.isBoosting = false;
});
leftBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  rocket.boostLeft = true;
});
leftBtn.addEventListener("touchend", e => {
  e.preventDefault();
  rocket.boostLeft = false;
});
rightBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  rocket.boostRight = true;
});
rightBtn.addEventListener("touchend", e => {
  e.preventDefault();
  rocket.boostRight = false;
});

console.log(is_touch_device());





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