// プレイヤークラス
export class Player {
    constructor(canvasWidth, canvasHeight, speed, bulletSpeed) {
        this.width = 40;
        this.height = 20;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.speed = speed || 250;
        this.bulletSpeed = bulletSpeed || -400;
        this.init();
    }

    init() {
        this.x = this.canvasWidth / 2 - this.width / 2;
        this.y = this.canvasHeight - 50;
        this.hasBullet = true;
    }

    update(dt, input) {
        if (input.isLeft()) this.x -= this.speed * dt;
        if (input.isRight()) this.x += this.speed * dt;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.canvasWidth) this.x = this.canvasWidth - this.width;

        if (input.consumeFire() && this.hasBullet) {
            this.hasBullet = false;
            return {
                x: this.x + this.width / 2 - 2,
                y: this.y - 12,
                width: 4,
                height: 12,
                speed: this.bulletSpeed,
                isPlayer: true
            };
        }
        return null;
    }

    isHit(bullet) {
        return bullet.x < this.x + this.width &&
               bullet.x + bullet.width > this.x &&
               bullet.y < this.y + this.height &&
               bullet.y + bullet.height > this.y;
    }

    draw(ctx) {
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(this.x, this.y + 8, this.width, 12);
        ctx.fillRect(this.x + 15, this.y, 10, 8);
        ctx.fillRect(this.x + 18, this.y - 4, 4, 6);
    }
}
