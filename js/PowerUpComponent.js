class PowerUpComponent extends GameComponent{
    constructor(width, height,color, x, y, z, powerUpType, type = "color") {
        super(width, height,color, x, y, z, type)

        this.powerUpType = powerUpType;
    }
}