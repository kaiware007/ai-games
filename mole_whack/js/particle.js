// パーティクルシステム — モグラを叩いたときに飛散する演出

export class Particle {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;       // 残り時間（秒）
        this.maxLife = life;    // 最大寿命（透明度計算用）
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 400 * dt;    // 重力
        this.life -= dt;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    get isAlive() {
        return this.life > 0;
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    // 指定位置からパーティクルを噴射
    emit(x, y, count, colors) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 200;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 150; // 若干上に寄せる
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 3 + Math.random() * 5;
            const life = 0.4 + Math.random() * 0.6;
            this.particles.push(new Particle(x, y, vx, vy, color, size, life));
        }
    }

    update(dt) {
        for (const p of this.particles) {
            p.update(dt);
        }
        // 寿命切れを削除
        this.particles = this.particles.filter(p => p.isAlive);
    }

    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }

    clear() {
        this.particles = [];
    }
}