export class BulletManager {
    constructor() {
        this.bullets = [];
    }

    clear() {
        this.bullets = [];
    }

    add(bullet) {
        this.bullets.push(bullet);
    }

    remove(bullet) {
        const index = this.bullets.indexOf(bullet);
        if (index >= 0) {
            this.bullets.splice(index, 1);
        }
    }

    update(dt, enemies, player) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            if (!bullet.active) {
                this.bullets.splice(i, 1);
                continue;
            }

            // ダメージオンリーの弾（即座に処理）
            if (bullet.isDamageOnly) {
                const enemy = enemies.getEnemyById(bullet.targetId);
                if (enemy) {
                    enemy.hp -= bullet.damage;
                    if (enemy.hp <= 0) {
                        player.gainXP(enemy.xpValue);
                        enemies.addKill();
                        enemies.removeEnemy(enemy);
                    }
                }
                this.bullets.splice(i, 1);
                continue;
            }

            // 通常弾の移動
            bullet.x += bullet.vx * dt;
            bullet.y += bullet.vy * dt;

            // 画面外なら削除
            const screenX = bullet.x - enemies.cameraX;
            const screenY = bullet.y - enemies.cameraY;
            if (screenX < -100 || screenX > 900 || screenY < -100 || screenY > 700) {
                bullet.active = false;
                continue;
            }

            // 敵との衝突
            let hit = false;
            for (const enemy of enemies.getEnemies()) {
                const dx = bullet.x - enemy.x;
                const dy = bullet.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < enemy.size + bullet.size) {
                    enemy.hp -= bullet.damage;
                    hit = true;
                    
                    if (enemy.hp <= 0) {
                        player.gainXP(enemy.xpValue);
                        enemies.addKill();
                        enemies.removeEnemy(enemy);
                    }
                    break;
                }
            }

            if (hit) {
                bullet.active = false;
            }
        }
    }

    getPlayerBullets() {
        return this.bullets.filter(b => !b.isEnemy);
    }

    getEnemyBullets() {
        return this.bullets.filter(b => b.isEnemy);
    }

    draw(ctx, cameraX, cameraY) {
        for (const bullet of this.bullets) {
            if (!bullet.active) continue;
            if (bullet.isDamageOnly) continue; // ダメージオンリーは描画しない

            const screenX = bullet.x - cameraX;
            const screenY = bullet.y - cameraY;

            if (screenX < -20 || screenX > 820 || screenY < -20 || screenY > 620) continue;

            ctx.fillStyle = bullet.color || '#4FC3F7';
            
            if (bullet.type === 'arrow') {
                // 矢の描画
                ctx.save();
                ctx.translate(screenX, screenY);
                const angle = Math.atan2(bullet.vy, bullet.vx);
                ctx.rotate(angle - Math.PI / 2);
                ctx.fillRect(-2, -8, 4, 16);
                ctx.restore();
            } else {
                // 通常の弾
                ctx.beginPath();
                ctx.arc(screenX, screenY, bullet.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}
