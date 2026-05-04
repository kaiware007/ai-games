const ENEMY_CONFIG = {
    goblin: {
        name: 'グロブリン',
        hp: 20,
        speed: 80,
        damage: 10,
        size: 20,
        xpValue: 5,
        color: '#4CAF50',
        hairColor: '#2E7D32'
    },
    eliteGoblin: {
        name: 'エリートグロブリン',
        hp: 100,
        speed: 100,
        damage: 25,
        size: 30,
        xpValue: 25,
        color: '#8B0000',
        hairColor: '#4A0000'
    },
    boss: {
        name: 'ボスグロブリン',
        hp: 500,
        speed: 60,
        damage: 50,
        size: 50,
        xpValue: 100,
        color: '#4B0082',
        hairColor: '#2E0854'
    }
};

let enemyIdCounter = 0;

export class EnemyManager {
    constructor(worldWidth, worldHeight) {
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.enemies = [];
        this.kills = 0;
        this.spawnTimer = 0;
        this.eliteSpawned = false;
        this.bossSpawned = false;
        this.cameraX = 0;
        this.cameraY = 0;
    }

    init() {
        this.enemies = [];
        this.kills = 0;
        this.spawnTimer = 0;
        this.eliteSpawned = false;
        this.bossSpawned = false;
        enemyIdCounter = 0;
    }

    update(dt, player, bullets, gameTime) {
        // カメラ更新（プレイヤー追従）
        const canvas = player.canvas || { width: 800, height: 600 };
        this.cameraX = player.x - canvas.width / 2;
        this.cameraY = player.y - canvas.height / 2;

        // 敵生成
        this.spawnEnemies(dt, gameTime);

        // エリート敵生成（2分後）
        if (!this.eliteSpawned && gameTime >= 120) {
            this.spawnElite(gameTime);
        }

        // ボス生成（5分後）
        if (!this.bossSpawned && gameTime >= 300) {
            this.spawnBoss();
        }

        // 敵の更新
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // プレイヤーへ追従
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                enemy.x += (dx / dist) * enemy.speed * dt;
                enemy.y += (dy / dist) * enemy.speed * dt;
            }

            // プレイヤーとの衝突
            const hitDist = enemy.size + 16;
            if (dist < hitDist) {
                player.takeDamage(enemy.damage);
                // プレイヤーを少し押し戻す
                if (dist > 0) {
                    player.x -= (dx / dist) * 5;
                    player.y -= (dy / dist) * 5;
                }
            }

            // 弾との衝突
            const playerBullets = bullets.getPlayerBullets();
            for (let j = playerBullets.length - 1; j >= 0; j--) {
                const bullet = playerBullets[j];
                if (!bullet.active) continue;
                
                const bx = bullet.x - enemy.x;
                const by = bullet.y - enemy.y;
                const bDist = Math.sqrt(bx * bx + by * by);
                
                if (bDist < enemy.size + bullet.size) {
                    enemy.hp -= bullet.damage;
                    bullet.active = false;
                    
                    if (enemy.hp <= 0) {
                        // 敵死亡
                        player.gainXP(enemy.xpValue);
                        this.kills++;
                        this.enemies.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }

    spawnEnemies(dt, gameTime) {
        // 経過時間に応じて生成速度を上昇
        let spawnInterval = 1.0;
        if (gameTime > 60) spawnInterval = 0.8;
        if (gameTime > 120) spawnInterval = 0.6;
        if (gameTime > 180) spawnInterval = 0.4;
        if (gameTime > 240) spawnInterval = 0.3;

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = spawnInterval;
            this.spawnGoblin();
        }
    }

    spawnGoblin() {
        const config = ENEMY_CONFIG.goblin;
        const angle = Math.random() * Math.PI * 2;
        const distance = 400 + Math.random() * 200;
        
        this.enemies.push({
            id: enemyIdCounter++,
            type: 'goblin',
            x: this.cameraX + 400 + Math.cos(angle) * distance,
            y: this.cameraY + 300 + Math.sin(angle) * distance,
            hp: config.hp,
            maxHP: config.hp,
            speed: config.speed,
            damage: config.damage,
            size: config.size,
            xpValue: config.xpValue,
            color: config.color,
            hairColor: config.hairColor
        });
    }

    spawnElite(gameTime) {
        this.eliteSpawned = true;
        const config = ENEMY_CONFIG.eliteGoblin;
        const angle = Math.random() * Math.PI * 2;
        const distance = 500;
        
        this.enemies.push({
            id: enemyIdCounter++,
            type: 'eliteGoblin',
            x: this.cameraX + 400 + Math.cos(angle) * distance,
            y: this.cameraY + 300 + Math.sin(angle) * distance,
            hp: config.hp,
            maxHP: config.hp,
            speed: config.speed,
            damage: config.damage,
            size: config.size,
            xpValue: config.xpValue,
            color: config.color,
            hairColor: config.hairColor
        });
    }

    spawnBoss() {
        this.bossSpawned = true;
        const config = ENEMY_CONFIG.boss;
        const angle = Math.random() * Math.PI * 2;
        const distance = 500;
        
        this.enemies.push({
            id: enemyIdCounter++,
            type: 'boss',
            x: this.cameraX + 400 + Math.cos(angle) * distance,
            y: this.cameraY + 300 + Math.sin(angle) * distance,
            hp: config.hp,
            maxHP: config.hp,
            speed: config.speed,
            damage: config.damage,
            size: config.size,
            xpValue: config.xpValue,
            color: config.color,
            hairColor: config.hairColor
        });
    }

    getEnemies() {
        return this.enemies;
    }

    getEnemyById(id) {
        return this.enemies.find(e => e.id === id);
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index >= 0) {
            this.enemies.splice(index, 1);
        }
    }

    addKill() {
        this.kills++;
    }

    draw(ctx, cameraX, cameraY) {
        for (const enemy of this.enemies) {
            const screenX = enemy.x - cameraX;
            const screenY = enemy.y - cameraY;

            // 画面外なら描画しない
            if (screenX < -50 || screenX > 850 || screenY < -50 || screenY > 650) continue;

            // 体
            ctx.fillStyle = enemy.color;
            ctx.fillRect(screenX - enemy.size / 2, screenY - enemy.size / 2, enemy.size, enemy.size);

            // デカ頭（緑髪）
            ctx.fillStyle = enemy.hairColor;
            ctx.fillRect(screenX - enemy.size / 2 - 2, screenY - enemy.size / 2 - 8, enemy.size + 4, 12);

            // 目
            ctx.fillStyle = '#FFF';
            ctx.fillRect(screenX - 6, screenY - 4, 4, 4);
            ctx.fillRect(screenX + 2, screenY - 4, 4, 4);
            ctx.fillStyle = '#000';
            ctx.fillRect(screenX - 5, screenY - 3, 2, 2);
            ctx.fillRect(screenX + 3, screenY - 3, 2, 2);

            // HPバー
            const hpWidth = enemy.size;
            const hpHeight = 4;
            const hpPercent = enemy.hp / enemy.maxHP;
            ctx.fillStyle = '#333';
            ctx.fillRect(screenX - hpWidth / 2, screenY - enemy.size / 2 - 14, hpWidth, hpHeight);
            ctx.fillStyle = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FF9800' : '#F44336';
            ctx.fillRect(screenX - hpWidth / 2, screenY - enemy.size / 2 - 14, hpWidth * hpPercent, hpHeight);
        }
    }
}
