export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speed = 200;
        this.maxHP = 100;
        this.hp = 100;
        this.xp = 0;
        this.xpToNextLevel = 10;
        this.level = 1;
        this.weapons = []; // { id, level }
        this.buffs = []; // { id, level }
        this.invincible = false;
        this.invincibleTimer = 0;
        this.alive = true;
    }

    init() {
        this.hp = this.maxHP;
        this.xp = 0;
        this.level = 1;
        this.weapons = [];
        this.buffs = [];
        this.alive = true;
    }

    update(dt, input, enemies) {
        if (!this.alive) return;

        // インビジブリブタイマー
        if (this.invincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        // 移動
        let dx = 0, dy = 0;

        if (input.isTouchActive()) {
            // タッチ入力: タッチ位置へ向かう
            const worldTouchX = input.getTouchTarget().x + enemies.cameraX;
            const worldTouchY = input.getTouchTarget().y + enemies.cameraY;
            const diffX = worldTouchX - this.x;
            const diffY = worldTouchY - this.y;
            const dist = Math.sqrt(diffX * diffX + diffY * diffY);
            if (dist > 5) {
                dx = diffX / dist;
                dy = diffY / dist;
            }
        } else {
            // キーボード入力
            const dir = input.getMoveDirection();
            dx = dir.dx;
            dy = dir.dy;
        }

        // 正規化
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
            dx /= len;
            dy /= len;
        }

        this.x += dx * this.speed * dt;
        this.y += dy * this.speed * dt;
    }

    takeDamage(amount) {
        if (this.invincible || !this.alive) return;
        this.hp -= amount;
        this.invincible = true;
        this.invincibleTimer = 0.5;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }
    }

    gainXP(amount) {
        this.xp += amount;
        this.checkLevelUp();
    }

    checkLevelUp() {
        while (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.level++;
            this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5) + 5;
            return true; // レベルUP発生
        }
        return false;
    }

    addWeapon(weaponId) {
        const existing = this.weapons.find(w => w.id === weaponId);
        if (existing) {
            existing.level++;
        } else if (this.weapons.length < 5) {
            this.weapons.push({ id: weaponId, level: 1 });
        }
    }

    getWeapons() {
        return this.weapons.map(w => ({ ...w, type: 'weapon' }));
    }

    getBuffs() {
        return this.buffs.map(b => ({ ...b, type: 'buff' }));
    }

    draw(ctx, cameraX, cameraY) {
        if (!this.alive) return;

        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;

        // インビジブリブ中は点滅
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // 体（骑士風）
        ctx.fillStyle = '#4A90D9';
        ctx.fillRect(screenX - 12, screenY - 16, 24, 32);

        // ヘルメット
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(screenX - 10, screenY - 20, 20, 8);

        // 目
        ctx.fillStyle = '#FFF';
        ctx.fillRect(screenX - 6, screenY - 14, 4, 4);
        ctx.fillRect(screenX + 2, screenY - 14, 4, 4);

        // 剣（右手）
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(screenX + 12, screenY - 8, 4, 20);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(screenX + 10, screenY - 2, 8, 4);

        ctx.globalAlpha = 1;
    }

    isDead() {
        return !this.alive;
    }
}
