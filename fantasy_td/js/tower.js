export class Tower {
    static CONFIGS = {
        arrow: { cost: 50, damage: 10, range: 120, fireRate: 0.5, color: '#FF9800', icon: '🏹' },
        ice: { cost: 75, damage: 5, range: 100, fireRate: 0.8, color: '#00BCD4', icon: '❄️' },
        poison: { cost: 100, damage: 3, range: 110, fireRate: 1.0, color: '#8BC34A', icon: '☠️' },
        lightning: { cost: 150, damage: 25, range: 90, fireRate: 1.5, color: '#FFEB3B', icon: '⚡' }
    };

    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        const config = Tower.CONFIGS[type];
        this.range = config.range;
        this.fireRate = config.fireRate;
        this.damage = config.damage;
        this.color = config.color;
        this.icon = config.icon;
        this.fireTimer = 0;
        this.level = 1;
        this.projectiles = [];
    }

    update(dt, enemies) {
        this.fireTimer -= dt;
        if (this.fireTimer > 0) return;

        if (this.type === 'lightning') {
            // 範囲攻撃
            const targets = this.getEnemiesInRange(this.x, this.y, this.range);
            if (targets.length > 0) {
                // 範囲攻撃: ターゲット周辺の敵にもダメージ
                // ターゲットとその周辺の敵にダメージ
                const hitSet = new Set();
                for (const t of targets) {
                    const nearEnemies = this.getEnemiesInRange(t.x, t.y, 40);
                    for (const e of nearEnemies) {
                        if (!hitSet.has(e)) {
                            hitSet.add(e);
                            e.takeDamage(this.damage);
                        }
                    }
                }
                this.fireTimer = this.fireRate;
            }
        } else {
            const target = this.getClosestEnemy(enemies);
            if (target) {
                target.takeDamage(this.damage);
                if (this.type === 'ice') {
                    target.applySlow(0.5, 0.5);
                }
                if (this.type === 'poison') {
                    target.applyPoison(2, 2.0);
                }
                this.fireTimer = this.fireRate;
            }
        }
    }

    getEnemiesInRange(x, y, radius) {
        const results = [];
        for (const e of this.enemies || []) {
            const dx = e.x - x;
            const dy = e.y - y;
            if (Math.sqrt(dx * dx + dy * dy) <= radius) {
                results.push(e);
            }
        }
        return results;
    }

    getClosestEnemy(enemies) {
        let closest = null;
        let minDist = this.range;
        for (const e of enemies) {
            const dx = e.x - this.x;
            const dy = e.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                closest = e;
            }
        }
        return closest;
    }

    draw(ctx) {
        // 範囲表示（選択時）
        // 塔台
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(this.x - 12, this.y - 12, 24, 24);

        // 塔の本体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 22);
        ctx.lineTo(this.x - 14, this.y - 4);
        ctx.lineTo(this.x + 14, this.y - 4);
        ctx.closePath();
        ctx.fill();

        // アイコン
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x, this.y - 10);
    }

    getRange() { return this.range; }
    getFireRate() { return this.fireRate; }
    getDamage() { return this.damage; }
    getCost() { return Tower.CONFIGS[this.type].cost; }
}
