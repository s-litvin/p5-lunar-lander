let width = 840;
let height = 480;
let radius = 40;
let dronBoatHeight = 20;
let dronBoatVelocity = 0.01;

let v1;
let mass = 100;
let cfr = 0.01;
let gravity;
let throast;
let velocity;
let acceleration;
let orientation;
let tmpVector;

let touchDown = false;



function setup() {
  createCanvas(840, 480);
  initializeGameState();
  initializeUI();
}

function initializeGameState() {
  v1 = createVector(40, 50);
  throast = createVector(0, 0);
  gravity = createVector(0, 0.04);
  acceleration = createVector(0, 0);
  velocity = createVector(2, 0);
  orientation = createVector(0, -1);
  tmpVector = createVector(0, 0);
  dronBoat = createVector(width / 2, height - dronBoatHeight);
  dVel = createVector(0, 0);
  dAcc = createVector(0.01, 0);
}

function initializeUI() {
  slider = createSlider(1, 60, 55, 1);
  slider.position(10, 10);
  slider.style('width', '80px');
}




function resetAcceleration() {
  acceleration.mult(0);
}

function draw() {
  frameRate(slider.value());

  resetAcceleration();

  handleInput();
  handleCollisions();

  applyTouchDown();
  applyEnvironmentalForces();

  updateDronBoat();

  updateRocketVector();

  ///////////// VISUALISATIONS //////////////

  background(120);
  drawOrientationVisualization();

  drawRocket();
  drawDronBoat();

  drawTelemetry();

}

function updateRocketVector() {
  velocity.add(acceleration);
  velocity.limit(12);
  v1.add(velocity);
}

function handleInput() {
  const ROTATION_ANGLE = 1; // угол вращения в градусах
  const THRUST_FORCE = 6.5; // сила тяги

  if (keyIsPressed) {
    if (keyCode === LEFT_ARROW) {
      orientation = rotateNew(orientation.x, orientation.y, -ROTATION_ANGLE);
    } else if (keyCode === RIGHT_ARROW) {
      orientation = rotateNew(orientation.x, orientation.y, ROTATION_ANGLE);
    }
    if (keyCode === 32 || key === "x" || key === "X") { // пробел или X
      throast = createVector(orientation.x, orientation.y);
      throast.normalize();
      throast.mult(THRUST_FORCE);
      applyForce(throast);
    }
  }
}

function handleCollisions() {
  // Handle collisions on the X axis
  if ((v1.x + velocity.x) > (width - radius)) {
    v1.x = 0;
  } else if ((v1.x + velocity.x) < 0) {
    v1.x = width - radius;
  }

  // Handle collisions with the top boundary
  if ((v1.y + velocity.y) <= 0) {
    v1.y = 0; // Set position at the top boundary
    if (velocity.y < 0) { // If moving upwards
      velocity.y *= -0.5; // Lose energy upon collision
    }
  }

  // Handle collisions with the ground
  if ((v1.y + velocity.y) >= (height - radius)) {
    v1.y = height - radius; // Set position at ground level

    if (velocity.y > 0) { // If falling
      velocity.y *= -0.5; // Lose energy upon collision
    }

    // Stop completely if speed is very low and no thrust is applied
    if (Math.abs(velocity.y) < 0.1 && throast.mag() === 0) {
      velocity.y = 0;
    }

    // Apply friction on the ground
    velocity.x *= 0.96;
  }

  // Eliminate jitter at low horizontal speeds
  if (Math.abs(velocity.x) < 0.01) {
    velocity.x = 0;
  }
}



function rotateNew(x, y, degree) {
  tmpX = x;
  // convert degrees to radians needed
  x = x * cos(degree * 3.14 / 180) - y * sin(degree * 3.14 / 180);
  y = tmpX * sin(degree * 3.14 / 180) + y * cos(degree * 3.14 / 180);

  return createVector(x, y);
}

function applyForce(force) {
  let f = p5.Vector.div(force, mass);
  acceleration.add(f);
}


function drawOrientationVisualization() {
  let tmp = createVector(orientation.x, orientation.y);
  tmp.rotate(90 * 3.14 / 180);
  tmp.normalize();

  fill(244, 200, 200);

  // Small circle
  circle(width / 2 + tmp.x, height / 2 + tmp.y, 4);
  text(`x-> ${nf(tmp.x, 0, 4)} y-> ${nf(tmp.y, 0, 4)}`, width / 2, 180);

  // Scaled up vector
  tmp.mult(5);
  circle(width / 2 + tmp.x, height / 2 + tmp.y, 4);
  text(`x-> ${nf(tmp.x, 0, 4)} y-> ${nf(tmp.y, 0, 4)}`, width / 2, 200);

  // Half vector in the opposite direction
  tmp.mult(-0.5);
  circle(width / 2 + tmp.x, height / 2 + tmp.y, 4);
  text(`x-> ${nf(tmp.x, 0, 4)} y-> ${nf(tmp.y, 0, 4)}`, width / 2, 220);
}

function applyEnvironmentalForces() {
  // Apply gravity
  let gravityForce = createVector(gravity.x, gravity.y);
  gravityForce.mult(mass);
  applyForce(gravityForce);

  // Apply drag (air resistance)
  let dragForce = createVector(velocity.x, velocity.y);
  dragForce.normalize();
  dragForce.mult(-1);
  let speed = velocity.mag();
  dragForce.mult(cfr * speed * speed); // Quadratic drag
  applyForce(dragForce);
}

function updateDronBoat() {
  const MAX_SPEED = 0.1;
  const MOVEMENT_RANGE = 3 * dronBoatHeight;

  // Update acceleration and velocity
  dAcc.x += dronBoatVelocity;
  dVel.add(dAcc);
  dVel.limit(MAX_SPEED);

  // Reverse direction at edges
  if (dronBoat.x > width / 2 + MOVEMENT_RANGE || dronBoat.x < width / 2 - MOVEMENT_RANGE) {
    dVel.mult(-1);
    dronBoatVelocity *= -1;
  }

  // Update position
  dronBoat.add(dVel);

  // Reset acceleration
  dAcc.mult(0);
}

function applyTouchDown() {
  touchDown =
      (v1.y + velocity.y) >= (height - radius - dronBoatHeight - 2) &&
      (v1.y + velocity.y) <= (height - radius - dronBoatHeight) &&
      (v1.x + velocity.x >= dronBoat.x - radius / 2) &&
      ((v1.x + velocity.x + radius) <= (dronBoat.x + dronBoatHeight * 3 * 1.5));

  if (touchDown && throast.x === 0) {
    velocity.x = dronBoatVelocity;
  }
}

function drawDronBoat() {
  fill(200, 80, 180);

  if (touchDown) {
    fill(0, 222, 0);
  }

  rect(dronBoat.x, dronBoat.y, dronBoatHeight * 3, dronBoatHeight); // dron boat
  circle(dronBoat.x + dronBoatHeight * 3, height - dronBoatHeight, 4);
}


function drawRocket() {
  fill(100, 180, 180);

  circle(v1.x, v1.y, 4);
  circle(v1.x + radius, v1.y, 4);
  rect(v1.x, v1.y, radius, radius); // rocket

  tmpVector = createVector(velocity.x, velocity.y);
  tmpVector.setMag(20 * tmpVector.mag());
  tmpVector.sub(v1);
  tmpVector.x = sqrt(tmpVector.x * tmpVector.x);
  tmpVector.y = sqrt(tmpVector.y * tmpVector.y);
  line(v1.x, v1.y, tmpVector.x, tmpVector.y);
  line(v1.x, v1.y, v1.x + 20 * orientation.x, v1.y + 20 * orientation.y);
}

function drawTelemetry() {
  fill(240);
  textSize(14);

  text("grv > " + nf(gravity.x, 0, 3) + " : " + nf(gravity.y, 0, 3), 10, 50);
  text("acc > " + nf(acceleration.x, 0, 3) + " : " + nf(acceleration.y, 0, 3), 10, 65);
  text("vel > " + nf(velocity.x, 0, 3) + " : " + nf(velocity.y, 0, 3), 10, 80);
  text("pos > " + nf(v1.x, 0, 2) + " : " + nf(v1.y, 0, 2), 10, 95);
  text("mag > " + nf(velocity.mag(), 0, 5), 10, 110);
  text("mass > " + nf(mass, 0, 3), 10, 125);
  text("cfr > " + nf(cfr, 0, 4), 10, 140);
  text("ori > " + nf(orientation.x, 0, 2) + " : " + nf(orientation.y, 0, 2), 10, 155);
  if (touchDown || (keyIsPressed && keyCode === 32)) {
    text("thr > " + nf(throast.x, 0, 4) + " : " + nf(throast.y, 0, 2), 10, 170);
  }
}
