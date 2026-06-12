import { Enemy } from './enemy.js?v=1781257821';

export class EnemyManager {
    constructor(path) {
        this.enemies = [];
        this.path = path;
    }

    spawnEnemy(config) {
        const enemy = new Enemy(this.path, config.hp, config.speed, config.reward, config.type);
        this.enemies.push(enemy);
        return enemy;
    }

    update(dt) {
        for (const enemy of this.enemies) {
            enemy.update(dt);
        }
        // 死亡またはゴール到達した敵を削除
        this.enemies = this.enemies.filter(e => !e.isDead() && !e.isReachedEnd());
    }

    draw(ctx) {
        for (const enemy of this.enemies) {
            enemy.draw(ctx);
        }
    }

    getEnemiesInRange(x, y, radius) {
        const results = [];
        for (const enemy of this.enemies) {
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= radius) {
                results.push(enemy);
            }
        }
        return results;
    }

    getClosestEnemy(x, y, maxRange) {
        let closest = null;
        let minDist = maxRange;
        for (const enemy of this.enemies) {
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                closest = enemy;
            }
        }
        return closest;
    }

    clear() {
        this.enemies = [];
    }

    getAliveCount() {
        return this.enemies.length;
    }
}
