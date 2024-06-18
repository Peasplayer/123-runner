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
        if (currentTime - this.lastShotTime >= settings.shootCooldown * 1000) {
            audioManager.playSound('player-shoot');
            var currentData = this.data;
            this.animateManually(ResourceManager.Ghost_Shoot, 1, () => {
                this.changeImage(currentData);
                this.animate = true;
            }, 4);

            let newProjectile = new GameComponent(18, 18, ResourceManager.Attack_Cat, this.x + this.width, this.y + this.height / 2, 3, "image");
            newProjectile.animateManually(ResourceManager.Attack_Cat, 1, () => newProjectile.frame = 11);
            newProjectile.movingSpeed = 3;
            newProjectile.collidesWithObject = (otherObject) => {
                if (otherObject.constructor.name !== "PowerUpComponent")
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
        if (!this.isAlive()) {
            this.die();
            return;
        }
        else if (this.lives === 1) {
            audioManager.playSound('one-heart', true);
        }

        gameIsFrozen = true;
        this.lastShotTime = Date.now() - settings.shootCooldown * 1000;

        this.animateManually(ResourceManager.Ghost_Damage, 3, () => {
            this.changeImage(ResourceManager.Ghost_Normal);
            this.animate = true;
            objects = [];
            gameIsFrozen = false;
        });
    }

    collectPowerUp(powerUpType){
        switch(powerUpType){
            case 0:
                audioManager.playSound('extra-heart');
                this.lives++;
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
                }, settings.watchTime * 1000)
                break;
            case 2:
                if (this.invincible)
                    return;

                audioManager.playSound('powerup');
                this.shield = true;
                this.changeImage(ResourceManager.Ghost_Shield);
                break;
            case 3:
                if (this.powerUpActive)
                    return;

                audioManager.playSound('powerup');
                this.powerUpActive = this.invincible = true;
                this.changeImage(ResourceManager.Ghost_Book);

                setTimeout(() => {
                    this.changeImage(ResourceManager.Ghost_Normal);
                    this.powerUpActive = this.invincible = false;
                }, settings.bookTime * 1000)
                break;
        }
    }

    die() {
        gameIsFrozen = true;
        audioManager.playSound('game-over')

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