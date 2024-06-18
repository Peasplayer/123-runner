class EnemyComponent extends GameComponent {
    constructor(width, height, data, x, y, z, type = "color") {
        super(width, height, data, x, y, z, type)

        this.gavePoint = false;

        this.canJump = false;
        this.deltaY = 0;
        this.jumpCooldown = 20;
    }

    move(x, y, modifier) {
        super.move(x, y, modifier);

        if (this.canJump) {
            this.deltaY += modifier * settings.gravity * 0.25;
            this.y += this.deltaY * modifier;
            if (this.getGroundContactY() <= this.y) {
                this.deltaY = 0;
                this.y = this.getGroundContactY();
                this.jumpCooldown -= modifier / 2;
                if (this.jumpCooldown > 19) {
                    this.frame = 6;
                }
                else if (this.jumpCooldown < 13 && this.jumpCooldown > 5) {
                    audioManager.playSound('slime-land');
                    this.frame = 7;
                }
                else if (this.jumpCooldown < 5) {
                    audioManager.playSound('slime-jump');   
                    this.frame = 8;
                }

                if (this.jumpCooldown < 0) {
                     this.frame = 0;
                    this.deltaY = -(5);
                    this.jumpCooldown = 20;
                }
            }
            else {
                if (this.deltaY > -4.5 && this.deltaY < -3) {
                    this.frame = 1;
                }
                else if (this.deltaY > -3 && this.deltaY < -1) {
                    this.frame = 2;
                }
                else if (this.deltaY > -1 && this.deltaY < 1) {
                    this.frame = 3;
                }
                else if (this.deltaY > 1 && this.deltaY < 3) {
                    this.frame = 4;
                }
                else if (this.deltaY > 3 && this.deltaY < 4.5) {
                    this.frame = 5;
                }
            }
        }
    }
}