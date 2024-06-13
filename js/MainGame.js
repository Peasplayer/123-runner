var gameArea;
var player;
var ground;
var objects = [];

var gameIsRunning = false;
var gameIsFrozen = false;
var gameProcess;
var objectSpawnCooldown = 0;
var objectPowerUpSpawnCooldown = 0;
var gameSpeed = 1.0;
var score = 0;
var lastUpdated = 0;

var floorIsLava = false;

const groundY = 450;

function resetGame() {
    gameArea = new GameArea();

    objects = [];
    objectSpawnCooldown = 0;
    objectPowerUpSpawnCooldown = 0;
    gameSpeed = 1.0;
    score = 0;
    lastUpdated = Date.now();
    floorIsLava = document.getElementById("FloorIsLava").value === "true";

    Settings.loadSettings();
    if (Settings.currentOptions === undefined)
        Settings.currentOptions = Settings.defaultOptions;
}

function startGame() {
    if (gameIsRunning)
        return false;

    resetGame();

    gameArea.start();

    let playerSize = Settings.currentOptions.playerSize;
    player = new PlayerComponent(playerSize, playerSize, "blue", 235,  (floorIsLava ? (groundY - playerSize) *  0.5 : groundY - playerSize), 1);
    ground = new GameComponent(960, 30, "green", 0, groundY, -1)

    gameProcess = setInterval(() => updateGame(), 1);
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
    var now = Date.now();
    var deltaTime = (now - lastUpdated) / 10.0; // delta time in centi seconds
    // after dt

    if (!gameIsRunning)
        return;

    gameArea.clear();
    ground.draw();

    if (!gameIsFrozen) {
        if (Settings.currentOptions.speedAmplifyingEvent === "frame")
            gameSpeed += Settings.currentOptions.speedAmplifier * deltaTime;

        if (objectSpawnCooldown <= 0) {
            var chance = Math.random() * 100 + 1;
            if (chance <= Settings.currentOptions.difficulty) {
                var size = Math.random() * Settings.currentOptions.maxObstacleMultiplier * Settings.currentOptions.minObstacleSize + Settings.currentOptions.minObstacleSize;
                var xOrY = Math.random() * 2 <= 1;
                var height = xOrY ? Settings.currentOptions.minObstacleSize : size;
                var y = Math.random() * (groundY + 1) - height / 2;
                if (y + height  > groundY)
                    y = groundY - height;

                if (y < 0)
                    y = 0;

                var newEnemy = new EnemyComponent(xOrY ? size : Settings.currentOptions.minObstacleSize, height, "red", 960, y);
                if (Math.random() < 0.25) { // add a slider?
                    newEnemy.movingSpeed = 5;
                    newEnemy.color = "purple";
                }
                else if (Math.random() < 0.25){ // do something else?
                    newEnemy.height = 50;
                    newEnemy.width = 50;
                    newEnemy.color = "lime";
                    newEnemy.canJump = true;
                    newEnemy.y = groundY / 2;
		        }
                newEnemy.collidesWithPlayer = (player) => {
                    player.gotDamaged(1);
                    objects = [];
                };
                objects.push(newEnemy);
            }
            objectSpawnCooldown = 50 / gameSpeed;
        }
        else
            objectSpawnCooldown -= deltaTime;

        if (objectPowerUpSpawnCooldown <= 0) {
            var chance = Math.random() * 100 + 1;
            if (chance <= 50) {
                var height = Settings.currentOptions.minObstacleSize;
                var y = Math.random() * (groundY + 1) - height / 2;
                if (y + height  > groundY)
                    y = groundY - height;

                if (y < 0)
                    y = 0;

                var powerUpType = Math.floor(Math.random() * 2);
                //console.log(powerUpType);
                var newPowerUp = new PowerUpComponent(Settings.currentOptions.minObstacleSize, height, "black", 960, y, powerUpType);
                newPowerUp.collidesWithPlayer = (Player) => {
                    player.collectPowerUp(powerUpType);
                    objects.splice(objects.indexOf(newPowerUp), 1);
                }
                console.log;
                objects.push(newPowerUp);
            }
            objectPowerUpSpawnCooldown = 100 / gameSpeed;
        }
        else
            objectPowerUpSpawnCooldown -= deltaTime;

        for (let obj of objects) {
            obj.move(-obj.movingSpeed, 0, gameSpeed * deltaTime);
            if (obj.x < (0 - obj.width)) {
                objects.splice(objects.indexOf(obj), 1);
                continue;
            }

            if (obj.x < (player.x - obj.width) && !obj.gavePoint) {
                score++;
                obj.gavePoint = true;
                if (Settings.currentOptions.speedAmplifyingEvent === "score")
                    gameSpeed += Settings.currentOptions.speedAmplifier;
            }

            obj.draw();

            for (const otherObj of objects) {
                if (obj.isTouching(otherObj))
                    obj.collidesWithObject(otherObj);
            }

            if (player.isTouching(obj)) {
                obj.collidesWithPlayer(player);
                if (!player.isAlive()) {
                    player.color = "yellow";
                    clearInterval(gameProcess);
                    gameIsRunning = false;
                }
            }
        }

        if (isKeyPressed) {
            player.accelerate(-Settings.currentOptions.boost * gameSpeed * deltaTime);
        }
        else if (player.y < player.getGroundContactY()) {
            player.accelerate(Settings.currentOptions.gravity * gameSpeed * deltaTime)
        }

        if (player.y >= player.getGroundContactY() && floorIsLava) {
            player.gotDamaged(1);

            if (!player.isAlive()) {
                player.color = "yellow";
                clearInterval(gameProcess);
                gameIsRunning = false;
            }
            else
                player.y = (groundY) / 4 *3;
        }
        if (player.y <= 0 && floorIsLava) {
            player.gotDamaged(1);

            if (!player.isAlive()) {
                player.color = "yellow";
                clearInterval(gameProcess);
                gameIsRunning = false;
            }
            else
                player.y = (groundY) / 4;
        }

        player.calcMove(deltaTime);
    }

    player.draw();

    document.getElementById("score").textContent = "Score: " + score;
    document.getElementById("speed").textContent = "Speed: " + (Math.round(gameSpeed * 100) / 100).toFixed(2);

    // reset for dt
    lastUpdated = now;
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
