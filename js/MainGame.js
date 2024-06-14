var gameArea;
var player;
var ground;
var objects = [];

var gameIsRunning = false;
var gameIsFrozen = false;
var gameProcess;
var objectSpawnCooldown = 0;
var gameSpeed = 1.0;
var score = 0;
var lastUpdated = 0;

var ebene = 1;
var canSpawnObstacles = true;
var portal;
var portalActive = false;
var blackscreenActive = false;

var floorIsLava = false;

const groundY = 450;

function resetGame() {
    gameArea = new GameArea();

    objects = [];
    objectSpawnCooldown = 0;
    gameSpeed = 1.0;
    score = 0;
    ebene = 1;
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
    portal = new GameComponent(100, 200, "yellow", 465, 190);

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

    if (portalActive){
        portal.draw();
    }
    if (blackscreenActive) {
        var blackoutOverlay = new GameComponent(gameArea.canvas.width, gameArea.canvas.height, "black", 0, 0);
        blackoutOverlay.overlayColor = "rgba(0, 0, 0, 0.8)";
        blackoutOverlay.draw();
    }

    if (!gameIsFrozen) {
        if (Settings.currentOptions.speedAmplifyingEvent === "frame")
            gameSpeed += Settings.currentOptions.speedAmplifier * deltaTime;

        if (objectSpawnCooldown <= 0 && canSpawnObstacles) {
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

        for (let obj of objects) {
            obj.move(-obj.movingSpeed, 0, gameSpeed * deltaTime);
            if (obj.x < (0 - obj.width)) {
                objects.splice(objects.indexOf(obj), 1);
                continue;
            }

            if (obj.x < (player.x - obj.width) && !obj.gavePoint) {
                score++;
                ebenenWechsel();
                obj.gavePoint = true;
                if (Settings.currentOptions.speedAmplifyingEvent === "score")
                    gameSpeed += Settings.currentOptions.speedAmplifier;
            }

            obj.draw();

            for (const otherObj of objects) {
                if (obj.isTouching(otherObj))
                    obj.collidesWithObject(otherObj);
            }

            if (player.isTouching(obj) && canSpawnObstacles) {
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
    document.getElementById("ebene").textContent = "Ebene: " + ebene;

    // reset for dt
    lastUpdated = now;
}

function ebenenWechsel(){
    if (score % 30 == 0){
        canSpawnObstacles = false;
        portalActive = true;
        for (let obj of objects){
            obj.gavePoint = true;
            if (obj.x < (0 - obj.width)){
                objects.splice(objects.indexOf(obj), 1);
            }
        }
        if (objects.length > 0){
            goToPortal();
        } 
        if (Settings.currentOptions.speedAmplifyingEvent === "ebene"){
            gameSpeed += Settings.currentOptions.speedAmplifier * 10; 
        }
    }
}
function goToPortal() {
    player.isAnimating = true;

    const centerX = 480;
    const centerY = 270;

    const velocityX = (centerX - player.x) / 250;
    const velocityY = (centerY - player.y) / 250; 

    const moveAnimation = setInterval(() => {
        player.move(velocityX, velocityY, 1);
    
        if (Math.abs(player.x - centerX) <= 1 && Math.abs(player.y - centerY) <= 1) {
            clearInterval(moveAnimation);
            setTimeout(() => {
                player.setPos(235, groundY - player.height);
                player.isAnimating = false;
                canSpawnObstacles = true;
                ebene++;
                portalActive = false;
                showBlackscreen();
            }, 2000);
        }
    }, 10);
}
function showBlackscreen(){
        blackscreenActive = true;
        setTimeout(() => {
            blackscreenActive = false;
        }, 50)
}
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
