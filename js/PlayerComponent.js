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
            let newProjectile = new GameComponent(10, 10, "green", this.x + this.width, this.y + this.height / 2, 2);
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
            this.changeImage(ResourceManager.Ghost_Normal)
            return;
        }

        this.lives -= livesTaken;

        if (!this.isAlive()) {
            this.die();
            return;
        }

        gameIsFrozen = true;
        this.lastShotTime = Date.now() - settings.shootCooldown * 1000;

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
                    this.changeImage(ResourceManager.Ghost_Normal);
                    this.animate = true;
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
                this.lives++;
                break;
            case 1:
                if (this.powerUpActive)
                    return;

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

                this.shield = true;
                this.changeImage(ResourceManager.Ghost_Shield);
                break;
            case 3:
                if (this.powerUpActive)
                    return;

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
        player.color = "yellow";
        stopGame();
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