var gameArea;
var player;
var ground;
var objects = [];

var gameIsRunning = false;
var gameProcess;
var objectSpawnCooldown = 0;
var gameSpeed = 1.0;
var score = 0;
var playerSize = 70;
var minObstacleSize = 40;
var maxObstacleMultiplier = 3;
var boost = 0.2;
var gravity = 0.3;
var frameDelay = 1;

function getSpeedAmplifier() {
    return parseFloat(document.getElementById("speedAmplifier").value);
}
function getSpeedAmplifyingEvent() {
    return document.getElementById("speedAmplifyingEvent").value === "frame";
}

const groundY = 450;

function resetGame() {
    gameArea = new GameArea();

    objects = [];
    objectSpawnCooldown = 0;
    gameSpeed = 1.0;
    score = 0;
    playerSize = parseInt(document.getElementById("playerSize").value);
    minObstacleSize = parseInt(document.getElementById("minObstacleSize").value);
    maxObstacleMultiplier = parseInt(document.getElementById("maxObstacleMultiplier").value);
    boost = parseFloat(document.getElementById("boost").value);
    gravity = parseFloat(document.getElementById("gravity").value);
    frameDelay = parseInt(document.getElementById("frameDelay").value);
}

function startGame() {
    if (gameIsRunning)
        return false;

    resetGame();

    gameArea.start();
    player = new PlayerComponent(playerSize, playerSize, "blue", 235, groundY - playerSize)
    ground = new GameComponent(960, 30, "green", 0, groundY)

    gameProcess = setInterval(() => updateGame(), frameDelay);
    gameIsRunning = true;
}

var isKeyPressed = false;
window.addEventListener('keydown', function (e) {
    if (e.key == " ")
        isKeyPressed = true;
    if (e.key == "s")
        startGame();
})
window.addEventListener('keyup', function (e) {
    if (e.key == " ")
        isKeyPressed = false;
})

function updateGame() {
    if (!gameIsRunning)
        return;

    if (getSpeedAmplifyingEvent())
        gameSpeed += getSpeedAmplifier();
    console.log("document.getElementById(difficulty).value: " + document.getElementById("difficulty").value)

    gameArea.clear();
    ground.draw();

    if (objectSpawnCooldown <= 0) {

        var chance = Math.random() * 100 + 1;
        if (chance <= document.getElementById("difficulty").value) {
            var size = Math.random() * maxObstacleMultiplier * minObstacleSize + minObstacleSize;
            var xOrY = Math.random() * 2 <= 1;
            var height = xOrY ? minObstacleSize : size;
            var y = Math.random() * (groundY + 1) - height / 2;
            if (y + height  > groundY)
                y = groundY - height;
                
            if (y < 0)
                y = 0;

            objects.push(new ObstacleComponent(xOrY ? size : minObstacleSize, height, "red", 960, y));
        }
        objectSpawnCooldown = 50 / gameSpeed;
    }
    else
        objectSpawnCooldown--;

    for (let obj of objects) {
        obj.move(-3 * gameSpeed, 0);
        if (obj.x < (0 - obj.width)) {
            objects.splice(objects.indexOf(obj), 1);
            continue;
        }

        if (obj.x < (player.x - obj.width) && !obj.gavePoint) {
            score++;
            obj.gavePoint = true;
            if (!getSpeedAmplifyingEvent())
                gameSpeed += getSpeedAmplifier();
        }

        obj.draw();

        if (player.isTouching(obj)) {
            player.color = "yellow";
            clearInterval(gameProcess);
            gameIsRunning = false;
        }
    }
    if (isKeyPressed) {
        player.accelerate(-boost * gameSpeed);
    }
    else if (player.y < player.getGroundContactY()) {
        player.accelerate(gravity * gameSpeed)
    }
    player.calcMove();
    /*else if (player.y > groundY - player.height) {
        player.setPos(235, groundY - player.height)
    }*/
    //console.log(player.y + " - " + player.velocity);
    player.draw();

    document.getElementById("score").textContent = "Score: " + score;
    document.getElementById("speed").textContent = "Speed: " + (Math.round(gameSpeed * 100) / 100).toFixed(2);
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}