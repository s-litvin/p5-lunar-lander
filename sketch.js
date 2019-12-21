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

  slider = createSlider(1, 60, 55, 1);
  slider.position(10, 10);
  slider.style('width', '80px');

}

function draw() {

  frameRate(slider.value());

  background(120);

  touchDown =
    (v1.y + velocity.y) >= (height - radius - dronBoatHeight - 2) &&
    (v1.y + velocity.y) <= (height - radius - dronBoatHeight) &&
    (v1.x + velocity.x >= dronBoat.x - radius / 2) &&
    ((v1.x + velocity.x + radius) <= (dronBoat.x + dronBoatHeight * 3 * 1.5));


  //////////// GRAVITY /////////
  tmpVector = createVector(gravity.x, gravity.y);
  tmpVector.mult(mass);
  applyForce(tmpVector)
  ////////////////////////////////////

  // /////////////// DRAG
  tmpVector = createVector(velocity.x, velocity.y);
  tmpVector.normalize();
  tmpVector.mult(-1);
  let speed = velocity.mag();
  tmpVector.mult(cfr * 1 * speed * speed);
  applyForce(tmpVector);
  //   // //////////////////////////

  /// THROAST //////////////////
  if (keyIsPressed) {
    if (keyCode === LEFT_ARROW) {
      orientation = rotateNew(orientation.x, orientation.y, -1);
    } else if (keyCode === RIGHT_ARROW) {
      orientation = rotateNew(orientation.x, orientation.y, 1);
    }
    if (keyCode == 32 || key == "x" || key == "X") { // spacebar
      throast = createVector(orientation.x, orientation.y);
      throast.normalize();
      throast.mult(6.5);
      applyForce(throast);
    }
  }


  
  ///////////////////////////////////
  

  if (touchDown && throast.x == 0) {
    velocity.x = dronBoatVelocity;
  }

  velocity.add(acceleration);


  //////// COLLISIONS ///////////
  if ((v1.x + velocity.x) > (width - radius)) {
    v1.x = 0
  } else if ((v1.x + velocity.x) < 0) {
    v1.x = width - radius
  }

  if (
    (v1.y + velocity.y) > (height - radius - 1) ||
    (v1.y + velocity.y) <= 1 ||
    (touchDown && false)
  ) {
    if (velocity.y > 0) { // if directed down
      velocity.y *= -0.49; // collisions grab energy   
    } else {
      velocity.y *= -1;
    }
    
    if (sqrt(velocity.y * velocity.y) < 0.08 && throast.y === 0) { // treshhold
      velocity.y = 0;
    }
    velocity.x -= velocity.x * 0.04; // ground friction
  }


  if (sqrt(velocity.x * velocity.x) < 0.01) { // treshhold
    velocity.x = 0;
  }
  ////////////////////////////




  velocity.limit(12);

  v1.add(velocity);



  ///////////// DRONBOAT MOVING /////////
  dAcc.x += dronBoatVelocity;
  dVel.add(dAcc);
  dVel.limit(0.1);
  
  if (
    dronBoat.x > width / 2 + 3 * dronBoatHeight || 
    dronBoat.x < width / 2 - 3 * dronBoatHeight
  ) 
  {
    dVel.mult(-1);
    dronBoatVelocity *= -1;
  }
  
  dronBoat.add(dVel);
  dAcc.mult(0);
  //////////////////////////////////////


  ///////////// VISUALISATIONS //////////////
  
  tmp = createVector(orientation.x, orientation.y);
  tmp.rotate(90*3.14/180);
  tmp.normalize();
  fill(244,200,200);
  circle(width/2 + tmp.x, height/2 + tmp.y, 4);
  text("x-> " + nf(tmp.x, 0, 4) + " y-> " + nf(tmp.y, 0, 4), width/2, 180);
  
  tmp.mult(5);
  circle(width/2 + tmp.x, height/2 + tmp.y, 4);
  text("x-> " + nf(tmp.x, 0, 4) + " y-> " + nf(tmp.y, 0, 4), width/2, 200);
  
  tmp.mult(-0.5);
  circle(width/2 + tmp.x, height/2 + tmp.y, 4);
  text("x-> " + nf(tmp.x, 0, 4) + " y-> " + nf(tmp.y, 0, 4), width/2, 220);
  

  tmpVector = createVector(velocity.x, velocity.y);
  tmpVector.setMag(20 * tmpVector.mag());
  tmpVector.sub(v1);
  tmpVector.x = sqrt(tmpVector.x * tmpVector.x);
  tmpVector.y = sqrt(tmpVector.y * tmpVector.y);

  
  
  
  fill(200, 180, 180);

  circle(v1.x, v1.y, 4);
  circle(v1.x + radius, v1.y, 4);
  circle(dronBoat.x + dronBoatHeight * 3, height - dronBoatHeight, 4);
  
  
  
  
  rect(v1.x, v1.y, radius, radius); // rocket

  if (touchDown) {
    fill(0, 222, 0);
  }

  rect(dronBoat.x, dronBoat.y, dronBoatHeight * 3, dronBoatHeight); // dron boat

  line(v1.x, v1.y, tmpVector.x, tmpVector.y);

  line(v1.x, v1.y, v1.x + 20 * orientation.x, v1.y + 20 * orientation.y);


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
  if (touchDown || (keyIsPressed && keyCode == 32)) {
    text("thr > " + nf(throast.x, 0, 4) + " : " + nf(throast.y, 0, 2), 10, 170);
  }



  acceleration.mult(0);

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