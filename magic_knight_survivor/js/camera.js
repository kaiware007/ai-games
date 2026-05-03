export class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = 0;
        this.y = 0;
        this.width = canvasWidth;
        this.height = canvasHeight;
    }

    update(targetX, targetY) {
        this.x = targetX - this.width / 2;
        this.y = targetY - this.height / 2;
    }

    apply(ctx) {
        ctx.translate(-this.x, -this.y);
    }

    getX() { return this.x; }
    getY() { return this.y; }
    getWidth() { return this.width; }
    getHeight() { return this.height; }
}