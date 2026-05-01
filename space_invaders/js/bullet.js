// 弾管理クラス
export class BulletManager {
    constructor(canvasWidth, canvasHeight) {
        this.bullets = [];
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    init() {
        this.bullets = [];
    }

    addBullet(x, y, width, height, speed, isPlayer) {
        this.bullets.push({
            x, y, width, height, speed, isPlayer, active: true
        });
    }

    update(dt) {
        for (const b of this.bullets) {
            if (!b.active) continue;
            if (b.isPlayer) {
                b.y -= b.speed * dt;
            } else {
                b.y += b.speed * dt;
            }
            // 画面外に出たら非活性
            if (b.y < -b.height || b.y > this.canvasHeight) {
                b.active = false;
            }
        }
        // 非活性の弾を削除
        this.bullets = this.bullets.filter(b => b.active);
    }

    getPlayerBullets() {
        return this.bullets.filter(b => b.isPlayer && b.active);
    }

    getEnemyBullets() {
        return this.bullets.filter(b => !b.isPlayer && b.active);
    }

    draw(ctx) {
        for (const b of this.bullets) {
            if (!b.active) continue;
            ctx.fillStyle = b.isPlayer ? '#ffff00' : '#ff0000';
            ctx.fillRect(b.x, b.y, b.width, b.height);
        }
    }
}
