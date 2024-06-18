var gameArea;
var player;
var background;
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

var audioManager;

const groundY = 450;
var settings = {
    playerSize: 70,
    frameSpeedAmplifier: 0.0001,
    levelSpeedAmplifier: 0.001,
    minCloudSize: 50,
    maxCloudMultiplier: 3,
    witchSize: 150,
    slimeSize: 70,
    boost: 0.2,
    gravity: 0.3,
    shootCooldown: 3.0,
    powerUpSpawnCooldown: 0.5,
    watchTime: 4,
    bookTime: 3
}
var difficulty = 50;

function resetGame() {
    gameArea = new GameArea();

    if (audioManager)
        audioManager.stopAllSounds();

    objects = [];
    objectSpawnCooldown = 0;
    powerUpSpawnCooldown = 0;
    gameSpeed = 1.0;
    gameIsFrozen = false;
    score = 0;
    scoreSinceNewLevel = 0;
    level = 1;
    canSpawnObjects = true;
    levelIsChanging = 0;
    lastUpdated = Date.now();
    floorIsLava = document.getElementById("floorIsLava").value === "true";
}

function startGame() {
    if (gameIsRunning)
        return false;

    resetGame();

    document.getElementById("floorIsLava").disabled = true;

    gameArea.start();

    player = new PlayerComponent(settings.playerSize, settings.playerSize, ResourceManager.Ghost_Normal, 235,  (floorIsLava ? (groundY - settings.playerSize) *  0.5 : groundY - settings.playerSize), 1, "image");
    player.hitboxOffset = { left: 8, up: 10, right: 8, down: 9 };
    background = new GameComponent(gameArea.canvas.width, gameArea.canvas.height, ResourceManager.Background_Forest, 0, 0, -10, "background");
    background.movingSpeed = -1;
    ground = new GameComponent(gameArea.canvas.width, gameArea.canvas.height - groundY, "rgba(0, 0, 0, 0.25)", 0, groundY, -1)
    overlay = new GameComponent(gameArea.canvas.width, gameArea.canvas.height,  "rgba(0, 0, 0, 0)", 0, 0, 10, "color");
    portal = new GameComponent(100, 200, ResourceManager.Portal_Purple, gameArea.canvas.width, 190, -1, "image");
    portal.visible = false;

    if(!audioManager){
        audioManager = new AudioManager();
        LoadSound();
    }
    audioManager.playRandomMusic();

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
    if (!gameIsFrozen)
        background.move(background.movingSpeed, 0, gameSpeed * deltaTime);
    if (background.x <= - background.width)
        background.x = 0;
    background.draw(deltaTime);
    ground.draw(deltaTime);
    portal.draw(deltaTime);

    if (!gameIsFrozen)
        gameSpeed += settings.frameSpeedAmplifier * deltaTime;

    if (canSpawnObjects && !gameIsFrozen) {
        if (objectSpawnCooldown <= 0) {
            var chance = Math.random() * 100 + 1;
            if (chance <= difficulty) {
                var newEnemy = new EnemyComponent(settings.minCloudSize,
                    settings.minCloudSize, ResourceManager.Enemy_Cloud_1, gameArea.canvas.width, y, 1, "image");
                newEnemy.hitboxOffset = { left: 8, up: 8, right: 8, down: 8 };

                var enemyType = Math.floor(Math.random() * 4);
                if (enemyType <= 1) {
                    var cloudType = Math.floor(Math.random() * 3);
                    var size = (Math.random() * settings.maxCloudMultiplier + 1) * settings.minCloudSize;
                    if (cloudType === 1) {
                        newEnemy.width = size;
                        newEnemy.changeImage(ResourceManager.Enemy_Cloud_2);
                    }
                    else if (cloudType === 2) {
                        newEnemy.height = size;
                        newEnemy.changeImage(ResourceManager.Enemy_Cloud_3);
                    }
                }
                else if (enemyType === 2) {
                    newEnemy.height = settings.witchSize * 0.75;
                    newEnemy.width = settings.witchSize;
                    newEnemy.hitboxOffset = { left: 15, up: 15, right: 20, down: 42 };
                    newEnemy.changeImage(ResourceManager.Enemy_Witch);
                    newEnemy.movingSpeed = -5;
                }
                else if (enemyType === 3){
                    newEnemy.height = settings.slimeSize;
                    newEnemy.width = settings.slimeSize;
                    newEnemy.hitboxOffset = { left: 8, up: 15, right: 8, down: 2 };
                    newEnemy.changeImage(ResourceManager.Enemy_Slime);
                    newEnemy.animate = false;
                    newEnemy.canJump = true;
                    newEnemy.y = groundY / 2;
                }

                newEnemy.collidesWithPlayer = (player) => {
                    player.gotDamaged(1, newEnemy);
                };

                var y = Math.random() * (groundY + 1) - newEnemy.height / 2;
                if (y + newEnemy.height > groundY)
                    y = groundY - newEnemy.height;
                if (y < 0)
                    y = 0;
                newEnemy.y = y;

                objects.push(newEnemy);
            }
            objectSpawnCooldown = 50 / gameSpeed;
        }
        else
            objectSpawnCooldown -= deltaTime;

        if (powerUpSpawnCooldown <= 0) {
            var chance = Math.random() * 100 + 1;
            if (chance <= 50) {
                var size = 50;
                var y = Math.random() * (groundY + 1) - size / 2;
                if (y + size  > groundY)
                    y = groundY - size;
                if (y < 0)
                    y = 0;

                var powerUpType = Math.floor(Math.random() * 4);
                var data = powerUpType === 0 ? ResourceManager.Item_Heart : (powerUpType === 1 ? ResourceManager.Item_Watch :
                    (powerUpType === 2 ? ResourceManager.Item_Shield : ResourceManager.Item_Book));
                var newPowerUp = new PowerUpComponent(size, size, data, 960, y, 0, powerUpType, "image");
                newPowerUp.collidesWithPlayer = (player) => {
                    player.collectPowerUp(powerUpType);
                    objects.splice(objects.indexOf(newPowerUp), 1);
                }
                objects.push(newPowerUp);
            }
            powerUpSpawnCooldown = settings.powerUpSpawnCooldown * 1000 / gameSpeed;
        }
        else if (!player.powerUpActive)
            powerUpSpawnCooldown -= deltaTime;
    }

    objects.sort((a, b) => a.z - b.z);
    for (let obj of objects) {
        if (!gameIsFrozen)
            obj.move(obj.movingSpeed, 0, gameSpeed * deltaTime);
        if (obj.x < (0 - obj.width) || obj.x > gameArea.canvas.width) {
            objects.splice(objects.indexOf(obj), 1);
            continue;
        }

        if (obj.x < (player.x - obj.width) && !obj.gavePoint) {
            score++;
            scoreSinceNewLevel++;
            obj.gavePoint = true;
        }

        obj.draw(deltaTime);

        if (!gameIsFrozen) {
            for (let otherObj of objects) {
                if (obj !== otherObj && obj.isTouching(otherObj))
                    obj.collidesWithObject(otherObj);
            }

            if (player.isTouching(obj)) {
                obj.collidesWithPlayer(player);
            }
        }
    }

    if (!gameIsFrozen) {
        if (isKeyPressed) {
            player.accelerate(-settings.boost * gameSpeed * (player.faster ? 2 : 1) * deltaTime);
        } else if (player.y < player.getGroundContactY()) {
            player.accelerate(settings.gravity * gameSpeed * (player.faster ? 2 : 1) * deltaTime)
        }

        // FloorIsLava
        if ((player.y >= player.getGroundContactY() || player.y <= 0) && floorIsLava) {
            player.gotDamaged(1);

            if (player.isAlive())
                player.y = (groundY) / 4 * (player.y <= 0 ? 1 : 3);
        }

        player.calcMove(deltaTime);
    }

    player.draw(deltaTime);
    player.drawStats();

    overlay.draw(deltaTime);

    if (!gameIsFrozen) {
        // LevelSwap
        if (scoreSinceNewLevel >= (level + 1) * 10) {
            canSpawnObjects = false;
            scoreSinceNewLevel = 0;
            levelIsChanging = 1;
        }
        if (levelIsChanging === 1 && objects.length === 0) {
            levelIsChanging = 2;
            portal.visible = true;
            portal.x = 960;
            portal.movingSpeed = -4;
        }
        if (levelIsChanging === 2) {
            if (portal.x <= 465) {
                portal.movingSpeed = 0;
                background.movingSpeed = 0;
                levelIsChanging = 0;

                sendPlayerToPortal(deltaTime);
                return;
            }

            portal.move(portal.movingSpeed, 0, deltaTime);
        }
    }

    document.getElementById("score").textContent = "Score: " + score;
    document.getElementById("speed").textContent = "Speed: " + (Math.round(gameSpeed * 100) / 100).toFixed(2);
    var shootCooldown = settings.shootCooldown * 1000 - (Date.now() - player.lastShotTime);
    document.getElementById("shootCooldown").textContent = "Shoot-Cooldown: " + (shootCooldown < 0 ? 0.0 : (shootCooldown / 1000).toFixed(1));
    document.getElementById("level").textContent = "Level: " + level;

    // reset for dt
    lastUpdated = now;
}

function sendPlayerToPortal(deltaTime) {
    player.frozen = true;
    player.velocity = 0;
    audioManager.stopAllSounds();

    const center = new Point(gameArea.canvas.width / 2, gameArea.canvas.height / 2);
    const velocity = new Point((center.x - player.x) / 150, (center.y - player.y) / 150 );

    const moveAnimation = setInterval(() => {
        player.move(velocity.x, velocity.y, deltaTime);
        audioManager.playSound('portal', false, 0.4);

        if (Math.abs(player.x - center.x) <= 1 && Math.abs(player.y - center.y) <= 1) {
            clearInterval(moveAnimation);
            setTimeout(() => {
                var counter = 0;
                var fadingBlack = true;
                var fadingAnimation = setInterval(() => {
                    overlay.data =  "rgba(0, 0, 0, " + counter + ")"

                    if (counter >= 1.2 && fadingBlack) {
                        gameSpeed += settings.levelSpeedAmplifier;
                        portal.visible = false;
                        background.movingSpeed = -1;
                        player.setPos(235, player.getGroundContactY());
                        fadingBlack = false;
                    }

                    if (counter <= 0 && !fadingBlack) {
                        clearInterval(fadingAnimation);

                        player.frozen = false;
                        level++;
                        audioManager.playRandomMusic();
                        setTimeout(() => canSpawnObjects = true, 500);
                    }

                    counter += (fadingBlack ? 1 : -1) * 0.01;
                }, 10);
            }, 200);
        }
    }, 10);
}

function LoadSound(){
    // Sounds
    audioManager.loadSound('portal', '../Sound/Portal.mp3');
    audioManager.loadSound('damage', '../Sound/Herz_weniger.mp3');
    audioManager.loadSound('one-heart', '../Sound/One_Heart.mp3');
    audioManager.loadSound('Hauptmenu', '../Sound/Hauptmenu.mp3');
    audioManager.loadSound('extra-heart', '../Sound/Herz_dazu.mp3');
    audioManager.loadSound('powerup', '../Sound/PowerUp.mp3');
    audioManager.loadSound('shield-brocken', '../Sound/Shield_kaputt.mp3');
    audioManager.loadSound('slime-jump', '../Sound/Huepf.mp3');
    audioManager.loadSound('slime-land', '../Sound/Landen.mp3');
    audioManager.loadSound('player-shoot', '../Sound/Angriff_sound.mp3');
    audioManager.loadSound('game-over', '../Sound/GameOverSound.mp3');

    // Music
    audioManager.loadMusic('Musik7', '../Sound/Musik1.mp3');
    audioManager.loadMusic('Musik1', '../Sound/Musik2.mp3');
    audioManager.loadMusic('Musik2', '../Sound/Musik3.mp3');
    audioManager.loadMusic('Musik3', '../Sound/Musik4.mp3');
    audioManager.loadMusic('Musik4', '../Sound/Musik5.mp3');
    audioManager.loadMusic('Musik5', '../Sound/Musik6.mp3');
    audioManager.loadMusic('Musik6', '../Sound/Musik7.mp3');
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}