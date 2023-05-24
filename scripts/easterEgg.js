
// Get the canvas element
const canvas = document.getElementById("pong");
const context = canvas.getContext("2d");

// Create the pong paddle
const paddleWidth = 10,
    paddleHeight = 100;
const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#2ecc71",
    dy: 10,
};
const ai = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#e74c3c",
    dy: 4,
};

// Create the pong ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 2,
    dx: 2,
    dy: Math.random() < 0.5 ? -2 : 2, // Randomize the initial y-direction of the ball
    color: "#f39c12",
};

// Game state
let gameStarted = false;

// Move paddles
function movePaddle(event) {
    if (gameStarted) {
        switch (event.keyCode) {
            case 38: // up arrow key
                player.y -= player.dy;
                break;
            case 40: // down arrow key
                player.y += player.dy;
                break;
        }
    }
}

// Move the AI paddle randomly
let nextRandomMoveTime = 0;
let aiMoveDirection = 0;

function moveAI() {
    const currentTime = Date.now();

    // Check if it's time to make a random move
    if (currentTime >= nextRandomMoveTime) {
        aiMoveDirection = Math.random() < 0.5 ? -1 : 1;

        // Calculate a new random delay for the next move
        const randomDelay = Math.random() * (250 - 100) + 100; // Random time between 0.5 and 2 seconds
        nextRandomMoveTime = currentTime + randomDelay;
    }

    // Move the AI paddle continuously
    ai.y += ai.dy * aiMoveDirection;

    // Ensure the AI paddle stays within the canvas boundaries
    if (ai.y <= 0) {
        ai.y = 0;
    } else if (ai.y + ai.height >= canvas.height) {
        ai.y = canvas.height - ai.height;
    }
}

// Reset the game
function resetGame() {
    gameStarted = false;
    player.y = canvas.height / 2 - paddleHeight / 2;
    ai.y = canvas.height / 2 - paddleHeight / 2;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = Math.random() < 0.5 ? -2 : 2; // Randomize the initial x-direction of the ball
    ball.dy = Math.random() < 0.5 ? -2 : 2; // Randomize the initial y-direction of the ball
}

// Update function
function update() {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    moveAI();
    // Move the paddles
    document.addEventListener("keydown", movePaddle);


    if (gameStarted) {
        // Move the ball
        ball.x += ball.dx * ball.speed;
        ball.y += ball.dy * ball.speed;

        // Collision detection with paddles
        if (
            ball.y + ball.radius > player.y &&
            ball.y - ball.radius < player.y + player.height &&
            ball.dx < 0
        ) {
            if (ball.x - ball.radius < player.x + player.width) {
                ball.dx = -ball.dx;
                ball.dy = Math.random() * (10 - 5) + 1; // Randomize the angle between 10 and 70 degrees
            }
        }

        if (
            ball.y + ball.radius > ai.y &&
            ball.y - ball.radius < ai.y + ai.height &&
            ball.dx > 0
        ) {
            if (ball.x + ball.radius > ai.x) {
                ball.dx = -ball.dx;
                ball.dy = Math.random() * (10 - 5) + 1; // Randomize the angle between 10 and 70 degrees
            }
        }

        // Collision detection with walls
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
        }

        // Draw the paddles
        context.fillStyle = player.color;
        context.fillRect(player.x, player.y, player.width, player.height);

        context.fillStyle = ai.color;
        context.fillRect(ai.x, ai.y, ai.width, ai.height);

        // Draw the ball
        context.fillStyle = ball.color;
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        context.closePath();
        context.fill();

        // Check for win condition
        if (ball.x - ball.radius > canvas.width) {
            alert("You win!");
            resetGame();
        } else if (ball.x + ball.radius < 0) {
            alert("You lose!");
            resetGame();
        }

        // Request animation frame
        requestAnimationFrame(update);
    }
}

// Start the game
document.getElementById("start-btn").addEventListener("click", function () {
    gameStarted = true;
    update();
});

// Reset the game
document.getElementById("reset-btn").addEventListener("click", function () {
    resetGame();
});
