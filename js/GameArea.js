class GameArea {
    constructor() {
        this.canvas = document.getElementsByTagName("canvas")[0] ?? document.createElement("canvas");       
        this.context = this.canvas.getContext("2d");
    }
    start() {
        this.canvas.width = 960;
        this.canvas.height = 540;  
        document.body.append(this.canvas);
    }
    drawScore(score) {
        this.context.font = "15px Unispace";
        this.context.fillStyle = "white";
        this.context.fillText("Score: " + score, 10, 60);
    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}