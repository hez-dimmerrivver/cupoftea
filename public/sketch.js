const { Engine, World, Bodies, Composite } = Matter;
const socket = io();

socket.on("participantCount", (count) => {
  participantCount = count;
});

//full shared world state sent by the server, so this will be null until server responds
let space = null;

let gui;

// this is a refnerece to the log text/UI stuff in the index.html file (also in public folder)
let logEl;

let genreColors = {
  HORROR: "#FF1800",
  ROMANCE: "#FF73C4",
  "SCI-FI": "#7BA4FF",
  DOCUMENTARY: "#a29312",
  ACTION: "#FC7D2D",
  MUSICAL: "#9186e4",
  THRILLER: "#3CA87B",
};

let engine, world;
let genres = [
  "HORROR",
  "ROMANCE",
  "SCI-FI",
  "DOCUMENTARY",
  "ACTION",
  "MUSICAL",
  "THRILLER",
];
let checkboxes = [];
let genreInstances = [];
let participantCount = 0;

//broadcast
socket.on("allSelections", (selections) => {
  //clean old boxes
  genreInstances = [];
  //generate boxes
  for (let genre of selections) {
    addTextBody(genre);
  }
});

let centerX;
let centerY;
let radius;

function preload() {
  font = loadFont("EBGaramond-VariableFont_wght.ttf");
}

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  radius = width / 8 + height / 10;
  centerX = width / 2;
  centerY = height / 2;

  canvas.parent("sketch-container");

  //grab the log element from the DOM
  logEl = document.getElementById("log");

  setLog("Connected.");

  gui = select("#gui-container");
  gui.addClass("open");

  engine = Engine.create();
  world = engine.world;

  //transparent physics cup
  let thickness = 50;
  let bottom = Bodies.rectangle(
    centerX,
    centerY + radius,
    radius * 2,
    thickness,
    {
      isStatic: true,
    },
  );
  let leftWall = Bodies.rectangle(
    centerX - radius,
    centerY + radius / 2,
    thickness,
    radius * 1.5,
    {
      isStatic: true,
      angle: -QUARTER_PI,
    },
  );
  let rightWall = Bodies.rectangle(
    centerX + radius,
    centerY + radius / 2,
    thickness,
    radius * 1.5,
    {
      isStatic: true,
      angle: QUARTER_PI,
    },
  );

  Composite.add(world, [bottom, leftWall, rightWall]);

  //tick box
  for (let i = 0; i < genres.length; i++) {
    let genreName = genres[i];
    let col = genreColors[genres[i]];
    let cb = createCheckbox(" " + genres[i], false);
    cb.parent("gui-container");
    cb.style("color", col);
    cb.position(20, 90 + i * 30);
    cb.addClass("genre-checkbox");
    cb.changed(handleCheckboxChange);
    cb.attribute("data-genre", genreName);
    checkboxes.push(cb);
  }
}

function handleCheckboxChange() {
  let genre = this.attribute("data-genre");
  sendDataToNode(genre, this.checked());
}

function draw() {
  background(220, 225, 230);
  textFont(font);
  Engine.update(engine);

  ///draw cup
  fill(255);
  noStroke();
  ellipse(centerX, centerY + radius, radius * 2, radius * 0.3);
  push();
  noFill();
  stroke(255);
  strokeWeight(25);
  bezier(
    centerX + radius * 0.7,
    centerY + radius * 0.3,
    centerX + radius * 1.4,
    centerY - radius * 0.3,
    centerX + radius * 1.6,
    centerY + radius * 0.9,
    centerX + radius * 0.3,
    centerY + radius * 0.7,
  );
  pop();

  fill(255);
  noStroke();
  arc(centerX, centerY, radius * 2, radius * 2, 0, PI);

  for (let i = 0; i < radius; i++) {
    let alpha = map(i, 0, radius, 10, 0);
    fill(220, 225, 230, alpha);
    arc(centerX, centerY, radius * 2 - i * 4, radius * 2 - i * 4, 0, PI);
  }

  //UI
  noStroke();
  fill(50);
  textSize(28);
  textAlign(LEFT);
  text("What's Your Cup of Tea", 20, 45);
  textSize(16);
  textAlign(LEFT);
  text("Select the movie genre you like", 20, 75);

  // Show participant count on the canvas
  fill(0);
  textSize(16);
  textAlign(RIGHT);
  text(`Participants: ${participantCount}`, width - 20, 40);

  //show my choice
  for (let inst of genreInstances) {
    inst.show();
  }
}

//add text
function addTextBody(label) {
  let col = genreColors[label];
  let newBox = new Box(
    centerX + random(-20, 20),
    centerY - 150,
    label,
    world,
    col,
  );

  genreInstances.push(newBox);
}

//remove
function removeTextBody(label) {
  for (let i = genreInstances.length - 1; i >= 0; i--) {
    if (genreInstances[i].label === label) {
      genreInstances[i].removeFromWorld(); //reove from Matter.js
      genreInstances.splice(i, 1); //remove from p5.js
    }
  }
}

function setLog(msg) {
  if (logEl) logEl.innerText = msg;
  console.log(msg);
}

//sent history data
function sendDataToNode(genre, checked) {
  socket.emit("updateSelection", { genre, checked });
}
