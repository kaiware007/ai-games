// プレイヤークラス
export class Player {
    constructor(canvasWidth, canvasHeight) {
        this.width = 40;
        this.height = 20;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - 50;
        this.canvasWidth = canvasWidth;
        this.speed = 300; // 移動速度（px/s）
        this.hasBullet = true; // 現在弾を持っているか
        this.lives = 3;
    }

    update(dt, input) {
        // 移動
        if (input.isLeft()) {
            this.x -= this.speed * dt;
        }
        if (input.isRight()) {
            this.x += this.speed * dt;
        }

        // 画面内に収める
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.canvasWidth) {
            this.x = this.canvasWidth - this.width;
        }
    }

    fire() {
        if (!this.hasBullet) return null;
        this.hasBullet = false;
        return {
            x: this.x + this.width / 2 - 2,
            y: this.y - 12,
            width: 4,
            height: 12,
            speed: -400, // 上向き
            isPlayer: true
        };
    }

    hit() {
        this.lives--;
        return this.lives <= 0;
    }

    reset() {
        this.lives = 3;
        this.hasBullet = true;
    }

    draw(ctx) {
        // プレイヤーの描画（シンプルな戦艦形）
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(this.x, this.y + 8, this.width, 12); // 本体
        ctx.fillRect(this.x + 15, this.y, 10, 8); // 砲塔
        ctx.fillRect(this.x + 18, this.y - 4, 4, 6); // 砲身
    }
}
