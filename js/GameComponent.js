class GameComponent {
    constructor(width, height, data, x, y, z, type = "color") {
        this.width = width;
        this.height = height;
        this.data = data;
        this.x = x;
        this.y = y;
        this.z = z ?? 0;
        this.hitboxOffset = { left: 3, up: 3, right: 3, down: 3 };
        this.type = type;

        this.animate = true;
        if (type === "image") {
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
        this.ticksPerFrame = this.data.ticksPerFrame ?? 7;
    }

    getCeilingContactY() {
        return 0;
    }

    getGroundContactY() {
        return groundY - this.height;
    }

    isTouching(comp) {
        var pointA1 = new Point(this.x + this.hitboxOffset.left, this.y + this.hitboxOffset.up);
        var pointA2 = new Point(this.x + this.width - this.hitboxOffset.right, this.y + this.height - this.hitboxOffset.down);

        var pointB1 = new Point(comp.x + comp.hitboxOffset.left, comp.y + comp.hitboxOffset.up);
        var pointB2 = new Point(comp.x + comp.width - comp.hitboxOffset.right, comp.y + comp.height - comp.hitboxOffset.down);

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
        this.image = new Image();
        this.image.src = data.src;
        this.data = data;
        this.frame = 0;
    }

    animateManually(data, cycles, callback, maxTicksPerFrame = 7) {
        clearInterval(this.lastAnimation);
        this.animate = false;
        this.ticksPerFrame = maxTicksPerFrame;
        this.frame = 0;

        var lastUpdated = Date.now();
        var remainingCycles = cycles;
        this.changeImage(data);
        this.lastAnimation = setInterval(() => {
            var now = Date.now();
            var deltaTime = (now - lastUpdated) / 10.0;
            this.ticksPerFrame -= deltaTime;
            if (this.ticksPerFrame <= 0) {
                this.frame++;
                this.ticksPerFrame = maxTicksPerFrame;
            }
            if (this.frame >= this.data.frames) {
                this.frame = 0;
                remainingCycles--;
                if (remainingCycles === 0) {
                    callback();
                    clearInterval(this.lastAnimation);
                }
            }
            lastUpdated = now;
        }, 1);
    }

    draw(deltaTime) {
        if (!this.visible)
            return;

        let ctx = gameArea.context;
        if (this.type === "color") {
            ctx.fillStyle = this.data;
            ctx.fillRect(this.x + 0.5, this.y + 0.5, this.width, this.height);
        }
        else if (this.type === "image" || this.type === "background") {
            if (this.image === undefined)
                this.setupImage();

            var sw = this.image.naturalWidth / this.data.cols;
            var sx = sw * (this.frame % this.data.cols);
            var sh = this.image.naturalHeight / this.data.rows;
            var sy = sh * Math.floor(this.frame / this.data.cols);
            var scale = new Point(this.width * (this.data.scale - 1),this.height * (this.data.scale - 1))
            ctx.drawImage(this.image, sx, sy, sw, sh, this.x - scale.x / 2 + 0.5, this.y - scale.y / 2 + 0.5, this.width * this.data.scale, this.height * this.data.scale);

            if (this.type === "background") {
                /*var sw = this.image.naturalWidth / this.data.cols;
                var sx = sw * (this.frame % this.data.cols);
                var sh = this.image.naturalHeight / this.data.rows;
                var sy = sh * Math.floor(this.frame / this.data.cols);*/
                ctx.drawImage(this.image, sx, sy, sw, sh, this.x + this.width, this.y, this.width, this.height);
            }

            if (this.animate === true) {
                this.ticksPerFrame -= deltaTime;
                if (this.ticksPerFrame <= 0) {
                    this.frame++;
                    this.ticksPerFrame = this.data.ticksPerFrame ?? 7;
                }
                if (this.frame >= this.data.frames)
                    this.frame = 0;
            }
        }
    }
}
