// Get the canvas element and its 2D context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Make the canvas fill the window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Auto-enter full-screen on mobile devices on the first touch (portable mode)
function requestFullScreen() {
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  } else if (canvas.msRequestFullscreen) {
    canvas.msRequestFullscreen();
  }
}

// On the first touchstart, if not in full-screen, request it.
function handleMobileFullScreen(e) {
  if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
    requestFullScreen();
  }
  // Continue handling the jump; we remove this listener so it doesn’t trigger repeatedly.
  document.removeEventListener("touchstart", handleMobileFullScreen);
}
document.addEventListener("touchstart", handleMobileFullScreen);

// Define the player's properties and physics
const player = {
  x: 50,
  y: canvas.height - 150,
  width: 50,
  height: 50,
  velocityY: 0,
  jumpForce: 15,
  gravity: 0.7,
  grounded: false
};

// Array to hold obstacles and obstacle spawn control variables
let obstacles = [];
let obstacleTimer = 0;
const obstacleInterval = 1500; // in milliseconds

// Game control variables for timing, scoring, and speed
let lastTime = 0;
let gameRunning = true;
let score = 0;
let gameSpeed = 1; // Gradually increases to make the game more challenging

// Main game loop
function gameLoop(timestamp) {
  if (!gameRunning) return;
  
  if (!lastTime) lastTime = timestamp;
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // Increase game speed gradually (affects obstacle speed and score rate)
  gameSpeed += deltaTime * 0.00005;

  // Increase the score based on game speed and elapsed time (simulate distance traveled)
  score += gameSpeed * deltaTime * 0.01;

  // Clear the canvas for redrawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply gravity and update player's vertical position
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // Check collision with the ground (represented as the bottom 100 pixels)
  if (player.y + player.height > canvas.height - 100) {
    player.y = canvas.height - 100 - player.height;
    player.velocityY = 0;
    player.grounded = true;
  } else {
    player.grounded = false;
  }

  // Draw the ground
  ctx.fillStyle = "#654321";
  ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

  // Draw the player (a simple red rectangle)
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Obstacle generation
  obstacleTimer += deltaTime;
  if (obstacleTimer > obstacleInterval) {
    const obstacleHeight = 40 + Math.random() * 30;
    obstacles.push({
      x: canvas.width,
      y: canvas.height - 100 - obstacleHeight,
      width: 20 + Math.random() * 30,
      height: obstacleHeight
    });
    obstacleTimer = 0;
  }




  // Update and draw obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= 6 * gameSpeed; // Move obstacles based on gameSpeed

    // Collision detection between player and obstacle
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      gameOver();
      return;
    }

    // Remove obstacles that have moved off-screen
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    } else {
      ctx.fillStyle = "#000";
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }
  }

                   // Display the score and game speed in the upper-left corner
           ctx.fillStyle = "#fff";
          ctx.font = "24px sans-serif";
            ctx.fillText("Score: " + Math.floor(score), 20, 40);
            ctx.fillText("Speed: " + gameSpeed.toFixed(2), 20, 70);

  // Display the credit "Developed by Toha" in the bottom-right corner
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "16px sans-serif";
  const creditText = "Developed by Toha";
  const textWidth = ctx.measureText(creditText).width;
  ctx.fillText(creditText, canvas.width - textWidth - 20, canvas.height - 20);

  // Continue animating
  requestAnimationFrame(gameLoop);
}

// Allow the player to jump with the spacebar
window.addEventListener("keydown", function(e) {
  if (e.code === "Space" && player.grounded) {
    player.velocityY = -player.jumpForce;
    player.grounded = false;
  }
});

// Touch support for mobile: a tap makes the player jump
window.addEventListener("touchstart", function(e) {
  // Prevent default touch behavior (like scrolling)
  e.preventDefault();
  if (player.grounded) {
    player.velocityY = -player.jumpForce;
    player.grounded = false;
  }
}, {passive: false});

// Handle game over state and reset the game after a short delay
function gameOver() {
  gameRunning = false;
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "48px sans-serif";
  ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);

  // Restart the game after 2 seconds
  setTimeout(() => {
    resetGame();
    gameRunning = true;
    lastTime = 0;
    requestAnimationFrame(gameLoop);
  }, 2000);
}

// Reset player and obstacle data for a fresh start
function resetGame() {
  player.y = canvas.height - 150;
  player.velocityY = 0;
  obstacles = [];
  obstacleTimer = 0;
  score = 0;
  gameSpeed = 1;
}

// Start the game loop
requestAnimationFrame(gameLoop);
