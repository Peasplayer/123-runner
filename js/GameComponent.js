class GameComponent {
    constructor(width, height, data, x, y, z, type = "color") {
        this.width = width;
        this.height = height;
        this.data = data;
        this.x = x;
        this.y = y;
        this.z = z ?? 0;
        this.hitboxTolerance = 3;
        this.type = type;

        if (type === "image") {
            this.animate = true;
            this.setupImage();
        }

        this.visible = true;
        this.movingSpeed = -3;
        this.collidesWithPlayer = (player) => {};
        this.collidesWithObject = (otherObject) => {};
    }

    setupImage() {
        this.image = new Image();
        this.image.src = this.data.src;
        this.frame = 0;
        this.ticksPerFrame = 3;
    }

    getCeilingContactY() {
        return 0 - this.hitboxTolerance;
    }

    getGroundContactY() {
        return groundY - this.height + this.hitboxTolerance;
    }

    isTouching(comp) {
        var pointA1 = new Point(this.x + this.hitboxTolerance, this.y + this.hitboxTolerance);
        var pointA2 = new Point(this.x + this.width - this.hitboxTolerance, this.y + this.height - this.hitboxTolerance);

        var pointB1 = new Point(comp.x, comp.y);
        var pointB2 = new Point(comp.x + comp.width, comp.y + comp.height);

        if (pointA1.x > pointB2.x || pointB1.x > pointA2.x)
           return false;

        if (pointA1.y > pointB2.y || pointB1.y > pointA2.y)
            return false;

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

    changeImage(data) {
        this.image.src = data.src;
        this.data = data;
    }

    draw() {
        if (!this.visible)
            return;

        let ctx = gameArea.context;
        if (this.type === "color") {
            ctx.fillStyle = this.data;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        else if (this.type === "image") {
            if (this.image === undefined)
                this.setupImage();

            var sw = this.image.naturalWidth / this.data.cols;
            var sx = sw * (this.frame % this.data.cols);
            var sh = this.image.naturalHeight / this.data.rows;
            var sy = sh * Math.floor(this.frame / this.data.cols);
            var scale = new Point(this.width * (this.data.scale - 1),this.height * (this.data.scale - 1))
            ctx.drawImage(this.image, sx, sy, sw, sh, this.x - scale.x / 2, this.y - scale.y / 2, this.width * this.data.scale, this.height * this.data.scale);

            if (this.animate === true) {
                this.ticksPerFrame--;
                if (this.ticksPerFrame <= 0) {
                    this.frame++;
                    this.ticksPerFrame = 3;
                }
                if (this.frame >= this.data.frames)
                    this.frame = 0;
            }
        }
    }

    blink(color, defaultColor, timeout, count, freezeGame) {
        if (freezeGame)
            gameIsFrozen = true;

        var counter = 1;
        var blinkAnimation = setInterval(() => {
            if (counter > count * 2) {
                clearInterval(blinkAnimation);
                if (freezeGame)
                    gameIsFrozen = false;
                return;
            }

            if (counter % 2 === 1) {
                this.data = color;
            }
            else {
                this.data = defaultColor;
            }

            counter++;
        }, timeout);
    }
}
