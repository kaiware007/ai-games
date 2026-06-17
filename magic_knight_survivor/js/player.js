export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 150;
        this.speedBonus = 0; // バフからの移動速度ボーナス%
        this.radius = 12;
        this.hp = 100;
        this.maxHp = 100;
        this.experience = 0;
        this.experienceToNext = 10;
        this.level = 1;
        this.invulnerable = 0;
        this.alive = true;
        this.healBonus = 0; // バフからの回復量ボーナス
        this.pickupRangeBonus = 0; // バフからの取得範囲ボーナス%
    }

    init() {
        this.hp = this.maxHp;
        this.experience = 0;
        this.level = 1;
        this.alive = true;
        this.invulnerable = 0;
        this.speedBonus = 0;
        this.healBonus = 0;
        this.pickupRangeBonus = 0;
    }

    getSpeed() {
        return this.speed * (1 + this.speedBonus / 100);
    }

    getPickupRange() {
        return 80 * (1 + this.pickupRangeBonus / 100);
    }

    update(dt, input, game) {
        if (!this.alive) return;

        const dir = input.getMoveDirection();
        const speed = this.getSpeed();
        this.x += dir.x * speed * dt;
        this.y += dir.y * speed * dt;

        if (this.invulnerable > 0) {
            this.invulnerable -= dt;
        }

        const pickupRange = this.getPickupRange();

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
                game.onItemCollected();
            } else if (dist < pickupRange) {
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
                const healAmount = item.getHealAmount() + this.healBonus;
                this.hp = Math.min(this.hp + healAmount, this.maxHp);
                healItems.splice(i, 1);
                game.onItemCollected();
            } else if (dist < pickupRange) {
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

        if (this.invulnerable > 0 && Math.floor(this.invulnerable * 10) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const px = this.x;
        const py = this.y;

        // アフロ（黒い丸い塊）
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(px, py - 6, this.radius * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // アフロの縁取り（光沢感）
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py - 6, this.radius * 1.3, 0, Math.PI * 2);
        ctx.stroke();

        // 顔（メカニックな四角形）
        ctx.fillStyle = '#c0c0c0';
        ctx.strokeStyle = '#606060';
        ctx.lineWidth = 1;
        const faceW = this.radius * 1.4;
        const faceH = this.radius * 1.2;
        const faceX = px - faceW / 2;
        const faceY = py - 2;
        ctx.beginPath();
        ctx.roundRect(faceX, faceY, faceW, faceH, 3);
        ctx.fill();
        ctx.stroke();

        // 目の部分（メカ的な赤い眼）
        ctx.fillStyle = '#ff3333';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 4;
        // 左目
        ctx.beginPath();
        ctx.ellipse(px - 4, py + 1, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // 右目
        ctx.beginPath();
        ctx.ellipse(px + 4, py + 1, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 目のハイライト
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px - 4, py, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px + 4, py, 1, 0, Math.PI * 2);
        ctx.fill();

        // 口のメカ線（横溝）
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px - 4, py + 5);
        ctx.lineTo(px + 4, py + 5);
        ctx.stroke();

        // 頬のメカパネル線
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(faceX + 1, py);
        ctx.lineTo(px - faceW / 2 + 3, py + faceH - 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(faceX + faceW - 1, py);
        ctx.lineTo(px + faceW / 2 - 3, py + faceH - 1);
        ctx.stroke();

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

    heal(amount) {
        this.hp = Math.min(this.hp + amount + this.healBonus, this.maxHp);
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
    }

    getLevel() { return this.level; }
    getX() { return this.x; }
    getY() { return this.y; }
}