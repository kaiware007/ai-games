export class EnemyManager {
    constructor(config) {
        this.enemies = [];
        this.bosses = [];
        this.config = config;
        this.spawnTimer = 0;
        this.wave = 1;
        this.waveTimer = 0;
        this.totalKills = 0;
        this.bossSpawned240 = false;
        this.bossSpawned480 = false;
    }

    init() {
        this.enemies = [];
        this.bosses = [];
        this.spawnTimer = 0;
        this.wave = 1;
        this.waveTimer = 0;
        this.totalKills = 0;
        this.bossSpawned240 = false;
        this.bossSpawned480 = false;
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

    // HPは固定（難易度倍率なし）
    getHp(type) {
        const base = { zombie: 20, skeleton: 15, bat: 10 };
        return base[type] || 15;
    }

    getSpeed(type) {
        const base = { zombie: 40, skeleton: 60, bat: 80 };
        return base[type] || 50;
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

    // 時間経過による出現間隔（秒）
    getSpawnInterval(gameTime) {
        if (gameTime < 60) return 2.0;    // 0-1分
        if (gameTime < 120) return 1.5;   // 1-2分
        if (gameTime < 180) return 1.2;   // 2-3分
        if (gameTime < 240) return 1.0;   // 3-4分
        if (gameTime < 300) return 0.8;   // 4-5分
        if (gameTime < 360) return 0.6;   // 5-6分
        if (gameTime < 420) return 0.5;   // 6-7分
        if (gameTime < 480) return 0.4;   // 7-8分
        return 0.3;                        // 8分〜
    }

    // 巨大ボス生成
    spawnBoss(playerX, playerY) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 500;
        const x = playerX + Math.cos(angle) * dist;
        const y = playerY + Math.sin(angle) * dist;

        const boss = {
            x, y,
            type: 'boss',
            name: '闇の巨人',
            hp: 5000,
            maxHp: 5000,
            speed: 25,
            damage: 50,
            radius: 60,
            score: 500,
            hitFlash: 0,
            isBoss: true
        };
        this.bosses.push(boss);
    }

    update(dt, player, game) {
        this.waveTimer += dt;
        if (this.waveTimer >= 30) {
            this.waveTimer = 0;
            this.wave += 1;
        }

        // 出現間隔で敵を生成
        const spawnInterval = this.getSpawnInterval(game.time);
        const maxEnemies = Math.min(100 + this.wave * 20, 300);

        this.spawnTimer += dt;
        if (this.spawnTimer >= spawnInterval && this.enemies.length < maxEnemies) {
            this.spawnTimer = 0;
            this.spawnEnemy(player.getX(), player.getY());
        }

        // 4分(240秒)と8分(480秒)に巨大ボス出現
        if (game.time >= 240 && !this.bossSpawned240) {
            this.bossSpawned240 = true;
            this.spawnBoss(player.getX(), player.getY());
            game.onBossSpawned();
        }
        if (game.time >= 480 && !this.bossSpawned480) {
            this.bossSpawned480 = true;
            this.spawnBoss(player.getX(), player.getY());
            game.onBossSpawned();
        }

        // 通常敵の更新
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
                const wasInvulnerable = player.invulnerable > 0;
                player.takeDamage(e.damage);
                if (!wasInvulnerable && player.invulnerable > 0) {
                    game.onPlayerDamaged();
                }
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

        // ボスの更新
        for (let i = this.bosses.length - 1; i >= 0; i--) {
            const b = this.bosses[i];
            const dx = player.getX() - b.x;
            const dy = player.getY() - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                b.x += (dx / dist) * b.speed * dt;
                b.y += (dy / dist) * b.speed * dt;
            }

            if (dist < b.radius + player.radius) {
                const wasInvulnerable = player.invulnerable > 0;
                player.takeDamage(b.damage);
                if (!wasInvulnerable && player.invulnerable > 0) {
                    game.onPlayerDamaged();
                }
                b.hitFlash = 0.2;
            }

            if (b.hitFlash > 0) b.hitFlash -= dt;

            const screenDist = Math.sqrt(
                Math.pow(b.x - player.getX(), 2) + Math.pow(b.y - player.getY(), 2)
            );
            if (screenDist > 1500) {
                this.bosses.splice(i, 1);
            }
        }
    }

    draw(ctx, camera) {
        // 通常敵描画
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

        // ボス描画
        for (const b of this.bosses) {
            // ボスの体（濃い紫色）
            if (b.hitFlash > 0) {
                ctx.fillStyle = '#fff';
            } else {
                ctx.fillStyle = '#4a0080';
            }

            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();

            // ボスの輪郭
            ctx.strokeStyle = '#9b30ff';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.lineWidth = 1;

            // ボスの名前
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(b.name, b.x, b.y - b.radius - 20);

            // HPバー（大きい）
            const barWidth = b.radius * 2.5;
            const barHeight = 8;
            const barY = b.y - b.radius - 12;
            ctx.fillStyle = '#333';
            ctx.fillRect(b.x - barWidth / 2, barY, barWidth, barHeight);
            ctx.fillStyle = '#9b30ff';
            ctx.fillRect(b.x - barWidth / 2, barY, barWidth * (b.hp / b.maxHp), barHeight);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(b.x - barWidth / 2, barY, barWidth, barHeight);

            // HPテキスト
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.fillText(`${Math.ceil(b.hp)}/${b.maxHp}`, b.x, barY + barHeight + 12);
        }
    }

    getEnemies() { return this.enemies; }
    getAll() { return [...this.enemies, ...this.bosses]; }
    getBosses() { return this.bosses; }

    removeEnemy(enemy) {
        const idx = this.enemies.indexOf(enemy);
        if (idx >= 0) {
            this.enemies.splice(idx, 1);
            this.totalKills += 1;
        }
    }

    removeBoss(boss) {
        const idx = this.bosses.indexOf(boss);
        if (idx >= 0) {
            this.bosses.splice(idx, 1);
            this.totalKills += 1;
        }
    }
}