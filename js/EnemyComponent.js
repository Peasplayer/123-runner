class EnemyComponent extends GameComponent {
    constructor(width, height, color, x, y) {
        super(width, height, color, x, y)

        this.gavePoint = false;

        this.canJump = false;
        this.deltaY = 0;
        this.jumpCooldown = 20;
    }

    move(x, y, modifier) {
        super.move(x, y, modifier);

        if (this.canJump) {
            this.deltaY += modifier * Settings.currentOptions.gravity * 0.25;
            this.y += this.deltaY * modifier;
            if (this.getGroundContactY() <= this.y){
                this.deltaY = 0;
                this.y = this.getGroundContactY();
                this.jumpCooldown -= modifier;

                if (this.jumpCooldown < 0) {
                    this.deltaY = -(5);
                    this.jumpCooldown = 20;
                }
            }
        }
    }
}