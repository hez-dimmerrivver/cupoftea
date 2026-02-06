const { Engine, World, Bodies, Composite } = Matter;
const socket = io();

//full shared world state sent by the server, so this will be null until server responds
let space = null;

let gui;

// this is a refnerece to the log text/UI stuff in the index.html file (also in public folder)
let logEl;

let genreColors = {
  Horror: "#FF1800",
  Romance: "#F699FF",
  "Sci-Fi": "#547CFF",
  Documentary: "#A66B20",
  Action: "#FB6C00",
  Musical: "#8A3BEE",
  Thriller: "#9EE0A9",
};

let engine, world;
let genres = [
  "Horror",
  "Romance",
  "Sci-Fi",
  "Documentary",
  "Action",
  "Musical",
  "Thriller",
];
let checkboxes = [];
let genreInstances = [];
// 當 server 廣播所有人的選擇時
socket.on("allSelections", (selections) => {
  // 清掉舊的 Box
  genreInstances = [];
  // 每個 genre 生成 Box
  for (let genre of selections) {
    addTextBody(genre);
  }
});

const centerX = 400;
const centerY = 400;
const radius = 150;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
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
    cb.position(20, 80 + i * 30);
    cb.addClass("genre-checkbox");
    cb.changed(handleCheckboxChange);
    cb.attribute("data-genre", genreName);
    checkboxes.push(cb);
  }
}

function handleCheckboxChange() {
  let genre = this.attribute("data-genre");

  if (this.checked()) {
    addTextBody(genre);
    sendDataToNode(genre, true);
  } else {
    removeTextBody(genre);
    sendDataToNode(genre, false);
  }
}

function draw() {
  background(255);
  Engine.update(engine);

  //draw cup
  noFill();
  stroke(0);
  strokeWeight(3);
  arc(centerX, centerY, radius * 2, radius * 2, 0, PI);

  //UI
  noStroke();
  fill(0);
  textSize(22);
  textAlign(LEFT);
  text("My Cup of Tea", 20, 40);
  textSize(16);
  textAlign(LEFT);
  text("The movie genre I like", 20, 70);

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
