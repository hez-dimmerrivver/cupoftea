const { Engine, World, Bodies, Composite } = Matter;
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

const centerX = 400;
const centerY = 400;
const radius = 150;

function setup() {
  createCanvas(windowWidth, windowHeight);

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

  //tick box(GEMINI)
  for (let i = 0; i < genres.length; i++) {
    let col = genreColors[genres[i]];
    let cb = createCheckbox(" " + genres[i], false);
    cb.elt.style.color = col;
    cb.position(20, 80 + i * 30);
    cb.changed(() => {
      if (cb.checked()) {
        addTextBody(genres[i]);
      } else {
        removeTextBody(genres[i]);
      }
    });
    checkboxes.push(cb);
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
