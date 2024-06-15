class PlayerComponent extends GameComponent {
    constructor(width, height, color, x, y) {
        super(width, height, color, x, y)

        this.velocity = 0.0;
        this.lives = 3;
    }

    accelerate(v) {
        this.velocity += v;
    }

    calcMove(dt) {
        if (this.y + this.velocity > this.getGroundContactY()){
            this.y = this.getGroundContactY();
            this.velocity = 0;
        }
        else if (this.y + this.velocity < 0){
            this.y = 0;
            this.velocity = 0;
        }
        else
            this.y += this.velocity * dt;
    }

    isAlive() {
        return player.lives > 0;
    }

    gotDamaged(livesTaken) {
        this.lives -= livesTaken;

        if (!this.isAlive()) {
            this.die();
            return;
        }

        gameIsFrozen = true;
        var counter = 0;
        var blinkAnimation = setInterval(() => {
            if (counter >= 6) {
                clearInterval(blinkAnimation);
                gameIsFrozen = false;
                return;
            }

            if (counter % 2 === 0){
                this.color = "orange";
            }
            else {
                this.color = "blue";
            }

            counter++;
        }, 500);
    }

    die() {
        player.color = "yellow";
        stopGame();
    }
}