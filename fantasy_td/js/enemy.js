export class Enemy {
    constructor(path, hp, speed, reward, type) {
        this.path = path;
        this.maxHp = hp;
        this.hp = hp;
        this.baseSpeed = speed;
        this.speed = speed;
        this.reward = reward;
        this.type = type;
        this.distance = 0;
        this.x = path.waypoints[0].x;
        this.y = path.waypoints[0].y;
        this.slowFactor = 1.0;
        this.slowTimer = 0;
        this.poisonDamage = 0;
        this.poisonTimer = 0;
        this.poisonTickTimer = 0;
        this.dead = false;
        this.reachedEnd = false;
    }

    update(dt) {
        if (this.dead || this.reachedEnd) return;

        // スロー効果の更新
        if (this.slowTimer > 0) {
            this.slowTimer -= dt;
            this.speed = this.baseSpeed * this.slowFactor;
            if (this.slowTimer <= 0) {
                this.slowFactor = 1.0;
                this.speed = this.baseSpeed;
            }
        }

        // ポイズン効果の更新
        if (this.poisonTimer > 0) {
            this.poisonTimer -= dt;
            this.poisonTickTimer -= dt;
            if (this.poisonTickTimer <= 0) {
                this.hp -= this.poisonDamage;
                this.poisonTickTimer = 0.5;
                if (this.hp <= 0) {
                    this.hp = 0;
                    this.dead = true;
                }
            }
        }

        // 移動
        this.distance += this.speed * dt;
        const pos = this.path.getPointAtDistance(this.distance);
        this.x = pos.x;
        this.y = pos.y;

        // ゴール到達判定
        if (this.distance >= this.path.getTotalLength()) {
            this.reachedEnd = true;
        }
    }

    draw(ctx) {
        if (this.dead || this.reachedEnd) return;

        const hpRatio = this.hp / this.maxHp;

        // 種類のカラー
        const colors = {
            slime: '#4CAF50',
            golem: '#795548',
            wizard: '#9C27B0',
            boss: '#F44336'
        };
        const color = colors[this.type] || '#4CAF50';

        // 本体
        const size = this.type === 'boss' ? 18 : (this.type === 'golem' ? 14 : 10);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();

        // スロー効果の視覚
        if (this.slowTimer > 0) {
            ctx.strokeStyle = '#00BCD4';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size + 4, 0, Math.PI * 2);
            ctx.stroke();
        }

        // ポイズン効果の視覚
        if (this.poisonTimer > 0) {
            ctx.fillStyle = '#8BC34A';
            ctx.beginPath();
            ctx.arc(this.x, this.y, size + 2, 0, Math.PI * 2);
            ctx.globalAlpha = 0.3;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        // HPバー
        const barWidth = size * 2.5;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y - size - 8;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = hpRatio > 0.5 ? '#4CAF50' : (hpRatio > 0.25 ? '#FF9800' : '#F44336');
        ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
        }
    }

    applySlow(factor, duration) {
        this.slowFactor = Math.min(this.slowFactor, factor);
        this.slowTimer = Math.max(this.slowTimer, duration);
        this.speed = this.baseSpeed * this.slowFactor;
    }

    applyPoison(damage, duration) {
        this.poisonDamage = Math.max(this.poisonDamage, damage);
        this.poisonTimer = Math.max(this.poisonTimer, duration);
        this.poisonTickTimer = 0;
    }

    isDead() {
        return this.dead;
    }

    isReachedEnd() {
        return this.reachedEnd;
    }
}
