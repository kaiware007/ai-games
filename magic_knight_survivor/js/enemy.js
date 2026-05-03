export class EnemyManager {
    constructor(config) {
        this.enemies = [];
        this.config = config;
        this.spawnTimer = 0;
        this.wave = 1;
        this.waveTimer = 0;
        this.totalKills = 0;
    }

    init() {
        this.enemies = [];
        this.spawnTimer = 0;
        this.wave = 1;
        this.waveTimer = 0;
        this.totalKills = 0;
    }

    spawnEnemy(playerX, playerY) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 400 + Math.random() * 200;
        const x = playerX + Math.cos(angle) * dist;
        const y = playerY + Math.sin(angle) * dist;

        const types = ['zombie', 'skeleton', 'bat'];
        const type = types[Math.floor(Math.random() * Math.min(types.length, this.wave))];

        const enemy = {
            x, y, type,
            hp: this.getHp(type),
            maxHp: this.getHp(type),
            speed: this.getSpeed(type),
            damage: this.getDamage(type),
            radius: this.getRadius(type),
            score: this.getScore(type),
            hitFlash: 0
        };
        this.enemies.push(enemy);
    }

    getHp(type) {
        const base = { zombie: 20, skeleton: 15, bat: 10 };
        return (base[type] || 15) * (1 + this.wave * 0.2);
    }

    getSpeed(type) {
        const base = { zombie: 40, skeleton: 60, bat: 80 };
        return (base[type] || 50) * (1 + this.wave * 0.05);
    }

    getDamage(type) {
        const base = { zombie: 10, skeleton: 8, bat: 5 };
        return base[type] || 8;
    }

    getRadius(type) {
        const base = { zombie: 12, skeleton: 10, bat: 8 };
        return base[type] || 10;
    }

    getScore(type) {
        const base = { zombie: 10, skeleton: 15, bat: 20 };
        return base[type] || 10;
    }

    // 時間経過による難易度上昇（倍率アップ版）
    getDifficultyMultiplier(gameTime) {
        if (gameTime < 120) return 1.0;    // 0-2分: 基本
        if (gameTime < 240) return 2.0;    // 2-4分: 2.0倍
        if (gameTime < 360) return 3.0;    // 4-6分: 3.0倍
        if (gameTime < 480) return 4.5;    // 6-8分: 4.5倍
        return 7.0;                        // 8-10分: 7.0倍
    }

    update(dt, player, game) {
        this.waveTimer += dt;
        if (this.waveTimer >= 30) {
            this.waveTimer = 0;
            this.wave += 1;
        }

        const difficultyMult = this.getDifficultyMultiplier(game.time);

        const baseSpawnRate = 2.0;
        const spawnRate = Math.max(0.15, baseSpawnRate / difficultyMult - this.wave * 0.05);
        const maxEnemies = Math.floor(100 + this.wave * 10 * difficultyMult);

        this.spawnTimer += dt;
        if (this.spawnTimer >= spawnRate && this.enemies.length < maxEnemies) {
            this.spawnTimer = 0;
            this.spawnEnemy(player.getX(), player.getY());
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            const dx = player.getX() - e.x;
            const dy = player.getY() - e.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                e.x += (dx / dist) * e.speed * dt;
                e.y += (dy / dist) * e.speed * dt;
            }

            if (dist < e.radius + player.radius) {
                player.takeDamage(e.damage);
                e.hitFlash = 0.2;
            }

            if (e.hitFlash > 0) e.hitFlash -= dt;

            const screenDist = Math.sqrt(
                Math.pow(e.x - player.getX(), 2) + Math.pow(e.y - player.getY(), 2)
            );
            if (screenDist > 1000) {
                this.enemies.splice(i, 1);
            }
        }
    }

    draw(ctx, camera) {
        for (const e of this.enemies) {
            if (e.hitFlash > 0) {
                ctx.fillStyle = '#fff';
            } else {
                const colors = { zombie: '#5a8a3c', skeleton: '#d4c5a9', bat: '#6b4c8a' };
                ctx.fillStyle = colors[e.type] || '#888';
            }

            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            ctx.fill();

            if (e.hp < e.maxHp) {
                const barWidth = e.radius * 2;
                const barHeight = 3;
                ctx.fillStyle = '#333';
                ctx.fillRect(e.x - barWidth / 2, e.y - e.radius - 8, barWidth, barHeight);
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(e.x - barWidth / 2, e.y - e.radius - 8, barWidth * (e.hp / e.maxHp), barHeight);
            }
        }
    }

    getEnemies() { return this.enemies; }
    getAll() { return this.enemies; }

    removeEnemy(enemy) {
        const idx = this.enemies.indexOf(enemy);
        if (idx >= 0) {
            this.enemies.splice(idx, 1);
            this.totalKills += 1;
        }
    }
}