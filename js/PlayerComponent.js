class PlayerComponent extends GameComponent {
    constructor(width, height, data, x, y, z, type = "color") {
        super(width, height, data, x, y, z, type);

        this.frozen = false;
        this.velocity = 0.0;
        this.lives = 3;

        this.powerUpActive = false;
        this.faster = false;
        this.invincible = false;
        this.shield = false;
        this.lastShotTime = 0;
    }

    shootProjectile() {
        var currentTime = Date.now();
        if (currentTime - this.lastShotTime >= Settings.currentOptions.shootCooldown * 1000) {
            audioManager.playSound('player-shoot');
            let newProjectile = new GameComponent(10, 10, "green", this.x + this.width, this.y + this.height / 2);
            newProjectile.movingSpeed = 3;
            newProjectile.collidesWithObject = (otherObject) => {
                objects = objects.filter(obj => obj !== otherObject && obj !== newProjectile);
            };
            objects.push(newProjectile);
            this.lastShotTime = currentTime;
        }
    }

    accelerate(v) {
        if (!this.frozen)
            this.velocity += v;
    }

    calcMove(dt) {
        if (this.y + this.velocity > this.getGroundContactY()) {
            this.y = this.getGroundContactY();
            this.velocity = 0;
        }
        else if (this.y + this.velocity < this.getCeilingContactY()){
            this.y = this.getCeilingContactY();
            this.velocity = 0;
        }
        else if (!this.frozen)
            this.y += this.velocity * dt;
    }

    isAlive() {
        return this.lives > 0;
    }

    gotDamaged(livesTaken, obj = undefined) {
        if (this.invincible)
            return;

        if (this.shield) {
            if (obj !== undefined)
                objects.splice(objects.indexOf(obj), 1);

            this.shield = false;
            audioManager.playSound('shield-brocken');
            this.changeImage(ResourceManager.Ghost_Normal)
            return;
        }

        this.lives -= livesTaken;
        audioManager.playSound('damage');
        if (this.lives == 1 && this.isAlive){
           audioManager.playSound('one-heart', true);
        }
        if (!this.isAlive()) {
            this.die();
            return;
        }

        gameIsFrozen = true;
        this.lastShotTime = Date.now() - Settings.currentOptions.shootCooldown * 1000;

        var lastUpdated = Date.now();
        var cycles = 3;
        this.animate = false;
        this.ticksPerFrame = 7;
        this.frame = 0;
        this.changeImage(ResourceManager.Ghost_Damage);
        var damageAnimation = setInterval(() => {
            var now = Date.now();
            var deltaTime = (now - lastUpdated) / 10.0;
            this.ticksPerFrame -= deltaTime;
            if (this.ticksPerFrame <= 0) {
                this.frame++;
                this.ticksPerFrame = 7;
            }
            if (this.frame >= this.data.frames) {
                this.frame = 0;
                cycles--;
                if (cycles === 0) {
                    objects = [];
                    gameIsFrozen = false;
                    clearInterval(damageAnimation);
                }
            }
            lastUpdated = now;
        }, 1);
    }

    collectPowerUp(powerUpType){
        switch(powerUpType){
            case 0:
                audioManager.playSound('extra-heart');
                this.lives++;

                //this.blink("green", "blue", 200, 2, false);
                break;
            case 1:
                if (this.powerUpActive)
                    return;
                audioManager.playSound('powerup');
                this.powerUpActive = this.faster = true;
                gameSpeed /= 2;
                setTimeout(() => {
                    this.powerUpActive = this.faster = false;
                    gameSpeed *= 2;
                }, 2000)

                //this.blink("white", "blue", 200, 2, false);
                break;
            case 2:
                audioManager.playSound('powerup');
                this.shield = true;
                this.changeImage(ResourceManager.Ghost_Shield);
                //this.blink("cyan", "blue", 200, 2, false);
                break;
            case 3:
                if (this.powerUpActive)
                    return;
                audioManager.playSound('powerup');
                this.powerUpActive = this.invincible = true;
                this.changeImage(ResourceManager.Ghost_Book);

                var counter = 20;
                var blinked = true;
                var blinkAnimation = () => {
                    if (counter <= 0.01) {
                        //this.data = "blue";
                        this.changeImage(ResourceManager.Ghost_Normal);
                        this.powerUpActive = this.invincible = false;
                        return;
                    }

                    /*if (!blinked)
                        this.data = "red";
                    else
                        this.data = "blue";
                    blinked = !blinked;*/

                    counter *= 0.75;
                    setTimeout(blinkAnimation, 50 * counter + 100);
                };
                blinkAnimation();
                break;
        }
    }

    die() {
        gameIsFrozen = true;
        audioManager.playSound('game-over')
        this.lastShotTime = Date.now() - Settings.currentOptions.shootCooldown * 1000;

        var lastUpdated = Date.now();
        var cycles = 1;
        this.animate = false;
        this.ticksPerFrame = 7;
        this.frame = 0;
        this.changeImage(ResourceManager.Ghost_Death);
        var deathAnimation = setInterval(() => {
            var now = Date.now();
            var deltaTime = (now - lastUpdated) / 10.0;
            this.ticksPerFrame -= deltaTime;
            if (this.ticksPerFrame <= 0) {
                this.frame++;
                this.ticksPerFrame = 7;
            }
            if (this.frame >= this.data.frames) {
                this.frame = 0;
                cycles--;
                if (cycles === 0) {
                    audioManager.stopAllSounds();
                    audioManager.playSound('Hauptmenu');
                    stopGame();
                    clearInterval(deathAnimation);
                }
            }
            lastUpdated = now;
        }, 1);
        //stopGame();
    }

    drawStats() {
        let ctx = gameArea.context;
        var currentX = 0;
        for (let i = 0; i < this.lives; i++) {
            ctx.fillStyle = "red";
            currentX = 10 + i * 20;
            ctx.fillRect(currentX, 10, 15, 15);
        }

        if (this.shield) {
            ctx.fillStyle = "cyan";
            currentX += 20;
            ctx.fillRect(currentX, 10, 15, 15);
        }
    }
}