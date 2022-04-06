import {
  randomIntFromRange,
  randomColor,
  distance,
  calculateAngle,
  didCollide,
} from "./utils";
import Player from "./classes/Player";
import Projectile from "./classes/Projectile";
import Enemy from "./classes/Enemies";
import Particles from "./classes/Particles";

const TWEEN = require("@tweenjs/tween.js");
const sounds = require("sound-box/soundbox");
console.log(sounds.default);
//
let soundbox = new sounds.default();
// Callback mode
soundbox.load("beep", "./sounds/pop.flac", function () {
  console.log("Loaded beep!");
  // Callback mode
  soundbox.play("beep", function () {
    // Do stuff
  });
});
// console.log(soundbox);
//
const scoreEl = document.getElementById("score-el");

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
// console.log(gsap);

canvas.width = innerWidth;
canvas.height = innerHeight;

const mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2,
};

const colors = ["#2185C5", "#7ECEFD", "#FFF6E5", "#FF7F66"];

// Event Listeners
addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

// addEventListener("resize", () => {
//   canvas.width = innerWidth;
//   canvas.height = innerHeight;

//   init();
// });
addEventListener("click", () => {
  const angle = calculateAngle(
    canvas.width / 2,
    canvas.height / 2,
    mouse.x,
    mouse.y
  );
  // console.log();
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5,
    })
  );
});

// Objects
let player;
let score = 0;

// Implementation
let objects;
let projectiles = [];
let particles = [];
let enemies = [];
function init() {
  objects = [];

  // objects.push(
  player = new Player(canvas.width / 2, canvas.height / 2, 10, "white");
  // );
}
//pushing new enemies
function spawnEnemies() {
  setInterval(() => {
    const rad = 4 + Math.random() * (30 - 4);

    let x = 0;
    let y = 0;
    //randomizing spawn points from both left ,right,up ,dwon
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - rad : canvas.width + rad;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - rad : canvas.height + rad;
    }

    const color = `hsl(${Math.random() * 360},50%,50%)`;
    //destination - source
    const angle = calculateAngle(x, y, canvas.width / 2, canvas.height / 2);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, rad, color, velocity));
  }, 1000);
}

// Animation Loop
let animationId;
let projectileCount = 0;
function animate() {
  animationId = requestAnimationFrame(animate);
  //fading efffect
  c.fillStyle = "rgba(0,0,0,0.1)";
  c.fillRect(0, 0, canvas.width, canvas.height);

  player.draw(c);
  //
  //make player shooting automatic
  enemies.forEach((enemy) => {
    if (distance(player.x, player.y, enemy.x, enemy.y) <= 200) {
      const angle = calculateAngle(
        canvas.width / 2,
        canvas.height / 2,
        enemy.x,
        enemy.y
      );
      // console.log("hello");
      projectileCount++;
      if (projectileCount < Projectile.maxProjectile) {
        projectiles.push(
          new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5,
          })
        );
      }
    }
  });
  //
  //
  particles.forEach((particle, i) => {
    if (particle.alpha <= 0.01) {
      particles.splice(i, 1);
      i--;
    } else particle.update(c);
  });
  projectiles.forEach((projectile, i) => {
    projectile.update(c);
    //removing projectiles if they are off the bounds
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(i, 1);
        i--;
      }, 0);
    }
  });
  //rendering enemies
  enemies.forEach((enemy, i) => {
    enemy.update(c);
    //checking collision between enemy and player

    if (didCollide(enemy, player)) {
      //end game
      // console.log("end game");
      //stopping the animation looop
      cancelAnimationFrame(animationId);
    }
    //check collision between enemies and projectile
    projectiles.forEach((projectile, j) => {
      if (didCollide(projectile, enemy)) {
        projectileCount = 0;
        score += 5;
        // Callback mode
        soundbox.play("beep", function () {
          // Do stuff
        });
        scoreEl.innerText = score;
        //creating explosion of particles
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particles(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }
        //using set timeout to get rid of the flashing effect
        if (enemy.radius > 20) {
          //
          var tween = new TWEEN.Tween(enemy);
          tween.to({ radius: enemy.radius - 10 }, 200);
          tween.start();

          //
          // enemy.radius -= 10;
          setTimeout(() => {
            projectiles.splice(j, 1);
            j--;
          }, 0);
        } else {
          setTimeout(() => {
            enemies.splice(i, 1);
            projectiles.splice(j, 1);
            j--;
            i--;
          }, 0);
        }
      }
      TWEEN.update();
    });
  });
  c.fillStyle = "black";
}

init();
animate();
spawnEnemies();
