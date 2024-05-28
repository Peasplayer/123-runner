class GameComponent {
    constructor(width, height, color, x, y) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = x;
        this.y = y;

        this.movingSpeed = 3;

        this.collidesWithPlayer = (player) => {};
    }

    shootProjectile() {
        var newProjectile = new GameComponent(10, 10, "green", this.x, this.y + this.height / 2);
        this.projejctiles.push(newProjectile);
        };
    }

    updateProjectiles() {
        for (let i = 0; i < this.projejctiles.length; i++) {
            let proj = this.projejctiles[i];
            proj.x += proj.movingSpeed; 
        }
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
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }