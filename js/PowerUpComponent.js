class PowerUpComponent extends GameComponent{
    constructor(width, height,color, x, y, powerUpType) {
        super(width, height,color, x, y)

        this.powerUpType = powerUpType;
    }  
}