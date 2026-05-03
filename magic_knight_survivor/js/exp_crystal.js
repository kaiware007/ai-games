export class ExpCrystal {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.radius = 5;
        this.bobTimer = Math.random() * Math.PI * 2;
    }

    update(dt) {
        this.bobTimer += dt * 3;
    }

    draw(ctx, camera) {
        const bobY = Math.sin(this.bobTimer) * 3;

        // クリスタル（菱形）
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 6 + bobY);
        ctx.lineTo(this.x + 4, this.y + bobY);
        ctx.lineTo(this.x, this.y + 6 + bobY);
        ctx.lineTo(this.x - 4, this.y + bobY);
        ctx.closePath();
        ctx.fill();

        // ハイライト
        ctx.fillStyle = '#85c1e9';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 4 + bobY);
        ctx.lineTo(this.x + 2, this.y + bobY);
        ctx.lineTo(this.x, this.y + 2 + bobY);
        ctx.lineTo(this.x - 1, this.y + bobY);
        ctx.closePath();
        ctx.fill();
    }

    getBounds() {
        return { x: this.x - this.radius, y: this.y - this.radius, width: this.radius * 2, height: this.radius * 2 };
    }

    getValue() { return this.value; }
    getX() { return this.x; }
    getY() { return this.y; }
}