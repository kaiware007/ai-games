export class WaveManager {
    constructor(enemyManager) {
        this.enemyManager = enemyManager;
        this.currentWave = 0;
        this.totalWaves = 10;
        this.waveActive = false;
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.waveDelay = 0;
        this.waveDelayDuration = 3.0;
        this.betweenWaves = true;

        this.waveConfigs = this.generateWaveConfigs();
    }

    generateWaveConfigs() {
        return [
            // ウェーブ1: スライムのみ
            [
                { type: 'slime', hp: 40, speed: 80, reward: 10, count: 8, interval: 1.0 }
            ],
            // ウェーブ2: スライム+ゴーレム
            [
                { type: 'slime', hp: 50, speed: 80, reward: 10, count: 6, interval: 0.9 },
                { type: 'golem', hp: 120, speed: 40, reward: 15, count: 2, interval: 2.0 }
            ],
            // ウェーブ3: スライム+ウィザード
            [
                { type: 'slime', hp: 60, speed: 85, reward: 10, count: 8, interval: 0.8 },
                { type: 'wizard', hp: 60, speed: 60, reward: 12, count: 2, interval: 1.5 }
            ],
            // ウェーブ4: 混合
            [
                { type: 'slime', hp: 70, speed: 90, reward: 10, count: 10, interval: 0.7 },
                { type: 'golem', hp: 140, speed: 42, reward: 15, count: 3, interval: 1.8 }
            ],
            // ウェーブ5: ボスウェーブ
            [
                { type: 'slime', hp: 80, speed: 90, reward: 10, count: 5, interval: 0.8 },
                { type: 'boss', hp: 500, speed: 30, reward: 100, count: 1, interval: 3.0 }
            ],
            // ウェーブ6: ウィザード増加
            [
                { type: 'slime', hp: 90, speed: 95, reward: 10, count: 8, interval: 0.6 },
                { type: 'wizard', hp: 80, speed: 65, reward: 12, count: 4, interval: 1.2 }
            ],
            // ウェーブ7: ゴーレム増加
            [
                { type: 'slime', hp: 100, speed: 100, reward: 10, count: 6, interval: 0.6 },
                { type: 'golem', hp: 180, speed: 45, reward: 15, count: 5, interval: 1.5 }
            ],
            // ウェーブ8: 混合高密度
            [
                { type: 'slime', hp: 110, speed: 100, reward: 10, count: 12, interval: 0.5 },
                { type: 'wizard', hp: 90, speed: 70, reward: 12, count: 4, interval: 1.0 },
                { type: 'golem', hp: 200, speed: 48, reward: 15, count: 3, interval: 1.5 }
            ],
            // ウェーブ9: 高密度混合
            [
                { type: 'slime', hp: 120, speed: 105, reward: 10, count: 10, interval: 0.4 },
                { type: 'wizard', hp: 100, speed: 72, reward: 12, count: 5, interval: 0.9 },
                { type: 'golem', hp: 220, speed: 50, reward: 15, count: 4, interval: 1.2 }
            ],
            // ウェーブ10: ボスウェーブ
            [
                { type: 'slime', hp: 130, speed: 110, reward: 10, count: 8, interval: 0.5 },
                { type: 'golem', hp: 250, speed: 52, reward: 15, count: 4, interval: 1.0 },
                { type: 'boss', hp: 800, speed: 28, reward: 100, count: 1, interval: 4.0 }
            ]
        ];
    }

    startNextWave() {
        if (this.currentWave >= this.totalWaves) return;
        if (this.waveActive) return;

        this.currentWave++;
        this.waveActive = true;
        this.betweenWaves = false;

        const batches = this.waveConfigs[this.currentWave - 1];
        this.spawnQueue = [];
        for (const batch of batches) {
            for (let i = 0; i < batch.count; i++) {
                this.spawnQueue.push({
                    ...batch,
                    delay: i * batch.interval
                });
            }
        }
        // delayでソート
        this.spawnQueue.sort((a, b) => a.delay - b.delay);
        this.spawnTimer = 0;
    }

    update(dt) {
        if (!this.waveActive) {
            if (this.betweenWaves) {
                this.waveDelay -= dt;
                if (this.waveDelay <= 0) {
                    this.startNextWave();
                }
            }
            return;
        }

        this.spawnTimer += dt;

        // スポーンキューから敵をスポーン
        while (this.spawnQueue.length > 0 && this.spawnQueue[0].delay <= this.spawnTimer) {
            const config = this.spawnQueue.shift();
            this.enemyManager.spawnEnemy({
                type: config.type,
                hp: config.hp,
                speed: config.speed,
                reward: config.reward
            });
        }

        // 全ての敵がスポーン済みかつ生存敵がいない場合、ウェーブ終了
        if (this.spawnQueue.length === 0 && this.enemyManager.getAliveCount() === 0) {
            this.waveActive = false;
            if (this.currentWave >= this.totalWaves) {
                // 全ウェーブ完了
                return;
            }
            this.betweenWaves = true;
            this.waveDelay = this.waveDelayDuration;
        }
    }

    isWaveActive() {
        return this.waveActive;
    }

    getCurrentWave() {
        return this.currentWave;
    }

    getNextWave() {
        return Math.min(this.currentWave + 1, this.totalWaves);
    }

    getTotalWaves() {
        return this.totalWaves;
    }

    isAllWavesDone() {
        return this.currentWave >= this.totalWaves && !this.waveActive && this.enemyManager.getAliveCount() === 0;
    }
}
