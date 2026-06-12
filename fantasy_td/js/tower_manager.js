import { Tower } from './tower.js?v=1781257821';

export class TowerManager {
    constructor() {
        this.towers = [];
        this.enemies = [];
    }

    setEnemies(enemies) {
        this.enemies = enemies;
    }

    addTower(x, y, type) {
        const tower = new Tower(x, y, type);
        tower.enemies = this.enemies;
        this.towers.push(tower);
        return tower;
    }

    update(dt, enemies) {
        this.enemies = enemies;
        for (const tower of this.towers) {
            tower.enemies = enemies;
            tower.update(dt, enemies);
        }
    }

    draw(ctx) {
        for (const tower of this.towers) {
            tower.draw(ctx);
        }
    }

    canPlaceAt(x, y) {
        // パス上または既存タワーの近くに置けない
        for (const tower of this.towers) {
            const dx = tower.x - x;
            const dy = tower.y - y;
            if (Math.sqrt(dx * dx + dy * dy) < 30) return false;
        }
        return true;
    }

    getTowers() {
        return this.towers;
    }

    clear() {
        this.towers = [];
    }
}
