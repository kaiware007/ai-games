export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 150;
        this.radius = 12;
        this.hp = 100;
        this.maxHp = 100;
        this.experience = 0;
        this.experienceToNext = 10;
        this.level = 1;
        this.invulnerable = 0;
        this.alive = true;
    }

    init() {
        this.hp = this.maxHp;
        this.experience = 0;
        this.level = 1;
        this.alive = true;
        this.invulnerable = 0;
    }

    update(dt, input, game) {
        if (!this.alive) return;

        const dir = input.getMoveDirection();
        this.x += dir.x * this.speed * dt;
        this.y += dir.y * this.speed * dt;

        if (this.invulnerable > 0) {
            this.invulnerable -= dt;
        }

        // 経験値クリスタルの収集
        const crystals = game.expCrystals;
        for (let i = crystals.length - 1; i >= 0; i--) {
            const c = crystals[i];
            const dx = c.getX() - this.x;
            const dy = c.getY() - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.radius + 8) {
                this.addExperience(c.getValue());
                crystals.splice(i, 1);
            } else if (dist < 80) {
                // 磁石効果：近づくと吸い寄せられる
                const pullSpeed = 200;
                const pullDx = -dx / dist * pullSpeed * dt;
                const pullDy = -dy / dist * pullSpeed * dt;
                c.x += pullDx;
                c.y += pullDy;
            }
        }

        // 体力回復アイテムの収集
        const healItems = game.healItems;
        for (let i = healItems.length - 1; i >= 0; i--) {
            const item = healItems[i];
            const dx = item.getX() - this.x;
            const dy = item.getY() - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.radius + item.radius) {
                // HP回復
                this.hp = Math.min(this.hp + item.getHealAmount(), this.maxHp);
                healItems.splice(i, 1);
            } else if (dist < 80) {
                // 磁石効果：近づくと吸い寄せられる
                const pullSpeed = 200;
                const pullDx = -dx / dist * pullSpeed * dt;
                const pullDy = -dy / dist * pullSpeed * dt;
                item.x += pullDx;
                item.y += pullDy;
            }
        }
    }

    draw(ctx, camera) {
        if (!this.alive) return;

        // 無敵時間中は点滅
        if (this.invulnerable > 0 && Math.floor(this.invulnerable * 10) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // 体（魔法騎士）
        ctx.fillStyle = '#4a90d9';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // ヘルメット
        ctx.fillStyle = '#8b7355';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 4, this.radius * 0.7, Math.PI, 0);
        ctx.fill();

        // 目
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x - 5, this.y - 3, 4, 3);
        ctx.fillRect(this.x + 1, this.y - 3, 4, 3);

        ctx.globalAlpha = 1;
    }

    getBounds() {
        return { x: this.x - this.radius, y: this.y - this.radius, width: this.radius * 2, height: this.radius * 2 };
    }

    isAlive() { return this.alive; }

    takeDamage(amount) {
        if (this.invulnerable > 0 || !this.alive) return;
        this.hp -= amount;
        this.invulnerable = 0.5;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }
    }

    addExperience(amount) {
        this.experience += amount;
        while (this.experience >= this.experienceToNext) {
            this.experience -= this.experienceToNext;
            this.levelUp();
        }
    }

    levelUp() {
        this.level += 1;
        this.experienceToNext = Math.floor(10 * Math.pow(1.2, this.level - 1));
        this.maxHp += 10;
        this.hp = Math.min(this.hp + 20, this.maxHp);
    }

    getLevel() { return this.level; }
    getX() { return this.x; }
    getY() { return this.y; }
}
