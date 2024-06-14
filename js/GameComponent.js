class GameComponent {
    constructor(width, height, color, x, y, z) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = x;
        this.y = y;
        this.z = z ?? 0;

        this.movingSpeed = 3;

        this.collidesWithPlayer = (player) => {};
        this.collidesWithObject = (otherObject) => {};

        this.overlayColor = null;
    }

    getGroundContactY() {
        return groundY - this.height;
    }

    isTouching(comp) {
        var pointA1 = new Point(this.x + 3, this.y + 3);
        var pointA2 = new Point(this.x + this.width - 3, this.y + this.height - 3);

        var pointB1 = new Point(comp.x, comp.y);
        var pointB2 = new Point(comp.x + comp.width, comp.y + comp.height);

        if (pointA1.x > pointB2.x || pointB1.x > pointA2.x)
            return false;

        if (pointA1.y > pointB2.y || pointB1.y > pointA2.y)
            return false;

        /*if (minX <= comp.x && maxX >= comp.x && minY <= comp.y && maxY >= comp.y)
            return true;*/

        return true;
    }

    move(x, y, modifier) {
        this.x += x * modifier;
        this.y += y * modifier;
    }
    
    setPos(x, y) {
        this.x = x;
        this.y = y;
    }

    draw() {
        let ctx = gameArea.context;
        if (this.overlayColor){
            ctx.fillStyle = this.overlayColor;
            ctx.fillRect(0, 0, gameArea.canvas.width, gameArea.canvas.height);    
        }
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
