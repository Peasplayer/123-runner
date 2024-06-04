class PlayerComponent extends GameComponent {
    constructor(width, height, color, x, y) {
        super(width, height, color, x, y);
        this.velocity = 0.0;
        this.lives = 3;
    }

    shootProjectile() {
        let newProjectile = new GameComponent(10, 10, "green", this.x + this.width, this.y + this.height / 2);
        newProjectile.movingSpeed = 5;
        newProjectile.collidesWithObject = (otherObject) => {
            this.projectiles = this.projectiles.filter(proj => proj !== newProjectile);
            objects = objects.filter(obj => obj !== otherObject);
        };
        this.projectiles.push(newProjectile);
    }

    updateProjectiles() {
        for (let i = 0; i < this.projectiles.length; i++) {
            let proj = this.projectiles[i];
            proj.x += proj.movingSpeed;
            if (proj.x > gameArea.canvas.width) {
                this.projectiles.splice(i, 1);
                i--;
            }
        }
    }

    drawProjectiles() {
        for (let proj of this.projectiles) {
            proj.draw();
        }
    }


    accelerate(v) {
        this.velocity += v;
    }

    calcMove(dt) {
        if (this.y + this.velocity > this.getGroundContactY()) {
            this.y = this.getGroundContactY();
            this.velocity = 0;
        } else if (this.y + this.velocity < 0) {
            this.y = 0;
            this.velocity = 0;
        } else {
            this.y += this.velocity * dt;
        }
    }

    isAlive() {
        return this.lives > 0;
    }

    gotDamaged(livesTaken) {
        gameIsFrozen = true;
        this.lives -= livesTaken;
        var counter = 0;
        var blinkAnimation = setInterval(() => {
            if (counter >= 6) {
                clearInterval(blinkAnimation);
                gameIsFrozen = false;
                return;
            }
            if (counter % 2 === 0) {
                this.color = "orange";
            } else {
                this.color = "blue";
            }
            counter++;
        }, 500);
    }
}