class PlayerComponent extends GameComponent {
    constructor(width, height, color, x, y) {
        super(width, height, color, x, y)

        this.velocity = 0.0;
        this.lives = 3;
        this.invincible = false;
        this.schild = false;
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

            if (counter % 2 === 0){
                this.color = "orange";
            }
            else {
                this.color = "blue";
            }

            counter++;
        }, 500);
    }
    collectPowerUp(powerUpType){
        switch(powerUpType){
            
            case 0:
                this.lives++;
                var counter = 0;
                var blinkAnimation = setInterval(() => {
                if (counter >= 4) {
                    clearInterval(blinkAnimation);
                gameIsFrozen = false;
                return;
                }

                if (counter % 2 === 0){
                this.color = "green";
                }
                else {
                this.color = "blue";
                }

                counter++;
                }, 200);
                console.log;
                break;
            case 1:
                    var counter = 0;
                    var blinkAnimation = setInterval(() => {
                    if (counter >= 4) {
                        clearInterval(blinkAnimation);
                    gameIsFrozen = false;
                    return;
                    }
    
                    if (counter % 2 === 0){
                    this.color = "white";
                    }
                    else {
                    this.color = "blue";
                    }

                    counter++;
                    }, 200);
                                       
                    gameSpeed /= 2;
                    const myTimeout = setTimeout(this.speedCooldown, 2000)
                break;
            case 2:
                    var counter = 0;
                    var blinkAnimation = setInterval(() => {
                    if (counter >= 4) {
                        clearInterval(blinkAnimation);
                    gameIsFrozen = false;
                    return;
                    }
    
                    if (counter % 2 === 0){
                    this.color = "cyan";
                    }
                    else {
                    this.color = "blue";
                    }

                    counter++;
                    }, 200);

                    this.schild = true
                    break;
            case 3:
                    var counter = 10;
                    //Blinkt, solange counter und conterinvincible >= 0 ist.
                    var blinkAnimation = setInterval(() => {
                    if (counter && counterInvincible <= 0) {
                        clearInterval(blinkAnimation);
                        this.color = "blue";
                        console.log("fertig")
                        this.invincible = false;                        
                    gameIsFrozen = false;
                    return;
                    }
    
                    if (counter % 2 === 0){
                    this.color = "red";
                    }
                    else {
                    this.color = "blue";
                    }

                    counter--;
                    }, 35 * counter);

                    this.invincible = true;

                    //Zählt 5 Sekunden. Spielt eine Rolle für das Blinken.
                    var counterInvincible = 5;
                    var invincibleCooldown = setInterval(() => {
                        if(counterInvincible <= 0) {
                            clearInterval(invincibleCooldown)
                        }
                        counterInvincible--;
                    }, 1000)
                    break;           
        }
        
    }
    speedCooldown() {
        gameSpeed *= 2
    }
}