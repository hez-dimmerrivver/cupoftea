class Box {
  constructor(x, y, label, world, col) {
    this.label = label;
    this.world = world;
    this.col = col;

    textSize(18);
    let tw = textWidth(this.label) + 15;
    let th = 25;

    this.body = Bodies.rectangle(x, y, tw, th, {
      restitution: 0.5,
      friction: 0.2,
      angle: random(TWO_PI / 15),
    });

    Composite.add(this.world, this.body);
  }

  show() {
    let pos = this.body.position;
    let angle = this.body.angle;

    push();
    translate(pos.x, pos.y);
    rotate(angle);

    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    fill(this.col);
    noStroke();
    text(this.label, 0, 0);
    pop();
  }

  removeFromWorld() {
    Composite.remove(this.world, this.body);
  }
}
