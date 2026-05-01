// 敵管理クラス
export class EnemyManager {
    constructor(canvasWidth) {
        this.enemies = [];
        this.canvasWidth = canvasWidth;
        this.moveInterval = 1.0;
        this.moveTimer = 0;
        this.direction = 1;
        this.fireInterval = 1.5;
        this.fireTimer = 0;
        this.speedMultiplier = 1.0;
    }

    init() {
        this.enemies = [];
        const cols = 11;
        const rows = 5;
        const padding = 15;
        const ew = 30, eh = 20;
        const startX = (this.canvasWidth - (cols * (ew + padding) - padding)) / 2;
        const startY = 60;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let type = (r === 0) ? 2 : (r < 3) ? 1 : 0;
                this.enemies.push({
                    x: startX + c * (ew + padding),
                    y: startY + r * (eh + padding),
                    width: ew, height: eh, type, alive: true
                });
            }
        }
        this.moveInterval = 1.0;
        this.direction = 1;
        this.speedMultiplier = 1.0;
    }

    update(dt) {
        const alive = this.enemies.filter(e => e.alive);
        if (alive.length === 0) return null;
        this.speedMultiplier = Math.max(0.2, alive.length / this.enemies.length);
        this.moveTimer += dt;
        if (this.moveTimer >= this.moveInterval * this.speedMultiplier) {
            this.moveTimer = 0;
            this.moveEnemies();
        }
        this.fireTimer += dt;
        if (this.fireTimer >= this.fireInterval) {
            this.fireTimer = 0;
            return this.fireBullet(alive);
        }
        return null;
    }

    moveEnemies() {
        let hitEdge = false;
        for (const e of this.enemies) {
            if (!e.alive) continue;
            e.x += 10 * this.direction;
            if (e.x <= 5 || e.x + e.width >= this.canvasWidth - 5) hitEdge = true;
        }
        if (hitEdge) {
            this.direction *= -1;
            for (const e of this.enemies) {
                if (!e.alive) continue;
                e.y += 15;
            }
        }
    }

    fireBullet(alive) {
        if (!alive.length) return null;
        const s = alive[Math.floor(Math.random() * alive.length)];
        return { x: s.x + s.width / 2 - 2, y: s.y + s.height, width: 4, height: 12, speed: 200, isPlayer: false };
    }

    hitEnemy(x, y) {
        for (const e of this.enemies) {
            if (!e.alive) continue;
            if (x >= e.x && x <= e.x + e.width && y >= e.y && y <= e.y + e.height) {
                e.alive = false;
                return e.type;
            }
        }
        return -1;
    }

    checkGameOver(playerY) {
        for (const e of this.enemies) {
            if (!e.alive) continue;
            if (e.y + e.height >= playerY) return true;
        }
        return false;
    }

    draw(ctx) {
        for (const e of this.enemies) {
            if (!e.alive) continue;
            ctx.fillStyle = e.type === 2 ? '#ff4444' : e.type === 1 ? '#44aaff' : '#44ff44';
            ctx.fillRect(e.x, e.y + e.height * 0.3, e.width, e.height * 0.7);
            ctx.fillRect(e.x + e.width * 0.2, e.y, e.width * 0.6, e.height * 0.3);
            ctx.fillStyle = '#000';
            ctx.fillRect(e.x + e.width * 0.3, e.y + e.height * 0.4, e.width * 0.1, e.height * 0.2);
            ctx.fillRect(e.x + e.width * 0.6, e.y + e.height * 0.4, e.width * 0.1, e.height * 0.2);
        }
    }

    getRemainingCount() {
        return this.enemies.filter(e => e.alive).length;
    }
}
