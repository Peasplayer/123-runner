var gameArea;
var player;
var ground;
var overlay;
var portal;
var objects = [];

var gameIsRunning = false;
var gameIsFrozen = false;
var gameProcess;
var objectSpawnCooldown = 0;
var powerUpSpawnCooldown = 0;

var gameSpeed = 1.0;
var score = 0;
var scoreSinceNewLevel = 0;
var lastUpdated = 0;

var level = 1;
var canSpawnObjects = true;
var levelIsChanging = 0;

var floorIsLava = false;

const groundY = 450;

function resetGame() {
    gameArea = new GameArea();

    objects = [];
    objectSpawnCooldown = 0;
    powerUpSpawnCooldown = 0;
    gameSpeed = 1.0;
    score = 0;
    scoreSinceNewLevel = 0;
    level = 1;
    canSpawnObjects = true;
    levelIsChanging = 0;
    lastUpdated = Date.now();
    floorIsLava = document.getElementById("floorIsLava").value === "true";

    Settings.loadSettings();
    if (Settings.currentOptions === undefined)
        Settings.currentOptions = Settings.defaultOptions;
}

function startGame() {
    if (gameIsRunning)
        return false;

    resetGame();

    document.getElementById("floorIsLava").disabled = true;

    gameArea.start();

    let playerSize = Settings.currentOptions.playerSize;
    player = new PlayerComponent(playerSize, playerSize, "blue", 235,  (floorIsLava ? (groundY - playerSize) *  0.5 : groundY - playerSize), 1);
    ground = new GameComponent(960, 30, "green", 0, groundY, -1)
    overlay = new GameComponent(gameArea.canvas.width, gameArea.canvas.height,  "rgba(0, 0, 0, 0)", 0, 0);
    portal = new GameComponent(100, 200, "yellow", 960, 190, -1);
    portal.visible = false;

    gameProcess = setInterval(() => updateGame(), 1);
    gameIsRunning = true;
}

function stopGame() {
    document.getElementById("floorIsLava").disabled = false;
    clearInterval(gameProcess);
    gameIsRunning = false;
}

var isKeyPressed = false;
window.addEventListener('keydown', function (e) {
    if (e.key == "s")
        startGame();
    if (gameIsFrozen)
        return;
    if (e.key == " ")
        isKeyPressed = true;
    if (e.key == "r" && gameIsRunning) {
        player.shootProjectile();
    }
});

window.addEventListener('keyup', function (e) {
    if (e.key == " ")
        isKeyPressed = false;
});

function updateGame() {
    var now = Date.now();
    var deltaTime = (now - lastUpdated) / 10.0;

    if (!gameIsRunning)
        return;

    gameArea.clear();
    ground.draw();
    portal.draw();

    if (!gameIsFrozen) {
        if (Settings.currentOptions.speedAmplifyingEvent === "frame")
            gameSpeed += Settings.currentOptions.speedAmplifier * deltaTime;

        if (canSpawnObjects) {
            if (objectSpawnCooldown <= 0) {
                var chance = Math.random() * 100 + 1;
                if (chance <= Settings.currentOptions.difficulty) {
                    var size = Math.random() * Settings.currentOptions.maxObstacleMultiplier * Settings.currentOptions.minObstacleSize + Settings.currentOptions.minObstacleSize;
                    var xOrY = Math.random() * 2 <= 1;
                    var height = xOrY ? Settings.currentOptions.minObstacleSize : size;
                    var y = Math.random() * (groundY + 1) - height / 2;
                    if (y + height > groundY)
                        y = groundY - height;
                    if (y < 0)
                        y = 0;

                    var newEnemy = new EnemyComponent(xOrY ? size : Settings.currentOptions.minObstacleSize, height, "red", 960, y);
                    if (Math.random() < 0.25) { // add a slider?
                        newEnemy.movingSpeed = -5;
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
                        player.gotDamaged(1, newEnemy);
                    };
                    objects.push(newEnemy);
                }
                objectSpawnCooldown = 50 / gameSpeed;
            }
            else
                objectSpawnCooldown -= deltaTime;

            if (powerUpSpawnCooldown <= 0) {
                var chance = Math.random() * 100 + 1;
                if (chance <= 50) {
                    var height = Settings.currentOptions.minObstacleSize;
                    var y = Math.random() * (groundY + 1) - height / 2;
                    if (y + height  > groundY)
                        y = groundY - height;
                    if (y < 0)
                        y = 0;

                    var powerUpType = Math.floor(Math.random() * 4);
                    var newPowerUp = new PowerUpComponent(Settings.currentOptions.minObstacleSize, height, "black", 960, y, powerUpType);
                    newPowerUp.collidesWithPlayer = (player) => {
                        player.collectPowerUp(powerUpType);
                        objects.splice(objects.indexOf(newPowerUp), 1);
                    }
                    objects.push(newPowerUp);
                }
                powerUpSpawnCooldown = Settings.currentOptions.powerUpSpawnCooldown * 1000 / gameSpeed;
            }
            else if (!player.powerUpActive)
                powerUpSpawnCooldown -= deltaTime;
        }

        objects.sort((a, b) => a.z - b.z);
        for (let obj of objects) {
            obj.move(obj.movingSpeed, 0, gameSpeed * deltaTime);
            if (obj.x < (0 - obj.width)) {
                objects.splice(objects.indexOf(obj), 1);
                continue;
            }

            if (obj.x < (player.x - obj.width) && !obj.gavePoint) {
                score++;
                scoreSinceNewLevel++;
                obj.gavePoint = true;
                if (Settings.currentOptions.speedAmplifyingEvent === "score")
                    gameSpeed += Settings.currentOptions.speedAmplifier;
            }

            obj.draw();

            for (let otherObj of objects) {
                if (obj !== otherObj && obj.isTouching(otherObj))
                    obj.collidesWithObject(otherObj);
            }

            if (player.isTouching(obj)) {
                obj.collidesWithPlayer(player);
            }
        }

        if (isKeyPressed) {
            player.accelerate(-Settings.currentOptions.boost * gameSpeed * (player.faster ? 2 : 1) * deltaTime);
        }
        else if (player.y < player.getGroundContactY()) {
            player.accelerate(Settings.currentOptions.gravity * gameSpeed * (player.faster ? 2 : 1) * deltaTime)
        }

        if (player.y >= player.getGroundContactY() && floorIsLava) {
            player.gotDamaged(1);

            if (player.isAlive())
                player.y = (groundY) / 4 *3;
        }
        if (player.y <= 0 && floorIsLava) {
            player.gotDamaged(1);

            if (player.isAlive())
                player.y = (groundY) / 4;
        }

        player.calcMove(deltaTime);
    }

    player.draw();
    player.drawStats();

    overlay.draw();

    if (scoreSinceNewLevel >= (level + 1) * 10) {
        canSpawnObjects = false;
        scoreSinceNewLevel = 0;
        levelIsChanging = 1;
        console.log("Change 111")
    }
    if (levelIsChanging === 1 && objects.length === 0) {
        console.log("Change 22")
        levelIsChanging = 2;
        portal.visible = true;
        portal.x = 960;
        portal.movingSpeed = -4;
    }
    if (levelIsChanging === 2) {
        console.log("Change 3")
        if (portal.x <= 465) {
            console.log("Change 4")
            portal.movingSpeed = 0;
            levelIsChanging = 0;

            sendPlayerToPortal();
            if (Settings.currentOptions.speedAmplifyingEvent === "level") {
                gameSpeed += Settings.currentOptions.speedAmplifier * 10;
            }
            return;
        }

        portal.move(portal.movingSpeed, 0, 1);
    }

    document.getElementById("score").textContent = "Score: " + score;
    document.getElementById("speed").textContent = "Speed: " + (Math.round(gameSpeed * 100) / 100).toFixed(2);
    var shootCooldown = Settings.currentOptions.shootCooldown * 1000 - (Date.now() - player.lastShotTime);
    document.getElementById("shootCooldown").textContent = "Shoot-Cooldown: " + (shootCooldown < 0 ? 0.0 : (shootCooldown / 1000).toFixed(1));
    document.getElementById("level").textContent = "Level: " + level;

    // reset for dt
    lastUpdated = now;
}

function sendPlayerToPortal() {
    player.isAnimating = true;

    const center = new Point(gameArea.canvas.width / 2, gameArea.canvas.height / 2);
    const velocity = new Point((center.x - player.x) / 250, (center.y - player.y) / 250);

    const moveAnimation = setInterval(() => {
        player.move(velocity.x, velocity.y, 1);

        if (Math.abs(player.x - center.x) <= 1 && Math.abs(player.y - center.y) <= 1) {
            clearInterval(moveAnimation);
            setTimeout(() => {
                var counter = 0;
                var fadingBlack = true;
                var fadingAnimation = setInterval(() => {
                    overlay.color =  "rgba(0, 0, 0, " + counter + ")"

                    if (counter >= 1.2 && fadingBlack) {
                        portal.visible = false;
                        player.setPos(235, groundY - player.height);
                        fadingBlack = false;
                    }

                    if (counter <= 0 && !fadingBlack) {
                        clearInterval(fadingAnimation);

                        player.isAnimating = false;
                        level++;
                        setTimeout(() => canSpawnObjects = true, 500);
                    }

                    counter += (fadingBlack ? 1 : -1) * 0.01;
                }, 10);
            }, 200);
        }
    }, 10);
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}