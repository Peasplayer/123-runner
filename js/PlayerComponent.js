class PlayerComponent extends GameComponent {
    constructor(width, height, data, x, y, z, type = "color") {
        super(width, height, data, x, y, z, type);

        this.isAnimating = false;
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
        if (!this.isAnimating)
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
        else if (!this.isAnimating)
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

        objects = [];
        gameIsFrozen = true;
        this.lastShotTime = Date.now() - Settings.currentOptions.shootCooldown * 1000;

        setTimeout(() => gameIsFrozen = false, 500 * 6);
        //this.blink("orange", "blue", 500, 3, true);
    }

    collectPowerUp(powerUpType){
        switch(powerUpType){
            case 0:
                this.lives++;

                //this.blink("green", "blue", 200, 2, false);
                break;
            case 1:
                if (this.powerUpActive)
                    return;

                this.powerUpActive = this.faster = true;
                gameSpeed /= 2;
                setTimeout(() => {
                    this.powerUpActive = this.faster = false;
                    gameSpeed *= 2;
                }, 2000)

                //this.blink("white", "blue", 200, 2, false);
                break;
            case 2:
                this.shield = true;
                this.changeImage(ResourceManager.Ghost_Shield);
                //this.blink("cyan", "blue", 200, 2, false);
                break;
            case 3:
                if (this.powerUpActive)
                    return;

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