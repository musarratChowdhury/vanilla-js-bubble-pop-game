export default class Particles {
  static friction = 0.98;
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw(c) {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
    c.restore();
  }

  update(c) {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.x *= Particles.friction;
    this.velocity.y *= Particles.friction;
    this.alpha -= 0.01;
    this.draw(c);
  }
}
