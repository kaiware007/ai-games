export class HUD {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.panelHeight = 70;
        this.selectedTower = null;
    }

    draw(ctx, gameState) {
        const { gold, lives, wave, totalWaves } = gameState;

        // 上部情報バー
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.width, 36);

        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // ゴールド
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`💰 ${gold}`, 10, 18);

        // ライフ
        ctx.fillStyle = '#F44336';
        ctx.fillText(`❤️ ${lives}`, 120, 18);

        // ウェーブ
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.fillText(`ウェーブ: ${wave}/${totalWaves}`, this.width / 2, 18);

        // 選択中のタワー
        if (this.selectedTower) {
            ctx.textAlign = 'right';
            ctx.fillStyle = '#4CAF50';
            const config = {
                arrow: '🏹 アロー',
                ice: '❄️ アイス',
                poison: '☠️ ポイズン',
                lightning: '⚡ ライトニング'
            };
            ctx.fillText(`${config[this.selectedTower]} 選択中`, this.width - 10, 18);
        }
    }

    drawTowerPanel(ctx, selectedTower) {
        const panelY = this.height - this.panelHeight;
        const towerTypes = ['arrow', 'ice', 'poison', 'lightning'];
        const configs = {
            arrow: { cost: 50, icon: '🏹', name: 'アロー', color: '#FF9800' },
            ice: { cost: 75, icon: '❄️', name: 'アイス', color: '#00BCD4' },
            poison: { cost: 100, icon: '☠️', name: 'ポイズン', color: '#8BC34A' },
            lightning: { cost: 150, icon: '⚡', name: 'ライトニング', color: '#FFEB3B' }
        };

        // パネル背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, panelY, this.width, this.panelHeight);

        const panelWidth = this.width;
        const towerWidth = panelWidth / towerTypes.length;

        towerTypes.forEach((type, i) => {
            const x = i * towerWidth;
            const config = configs[type];
            const isSelected = selectedTower === type;

            // ボタン背景
            ctx.fillStyle = isSelected ? config.color : 'rgba(255,255,255,0.1)';
            ctx.fillRect(x + 2, panelY + 2, towerWidth - 4, this.panelHeight - 4);

            if (isSelected) {
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, panelY + 2, towerWidth - 4, this.panelHeight - 4);
            }

            // アイコン
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(config.icon, x + towerWidth / 2, panelY + 22);

            // 名前
            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#FFF';
            ctx.fillText(config.name, x + towerWidth / 2, panelY + 42);

            // コスト
            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`💰${config.cost}`, x + towerWidth / 2, panelY + 56);
        });
    }

    handleTowerSelect(type) {
        this.selectedTower = type;
    }

    getTowerAtPos(x, y) {
        const panelY = this.height - this.panelHeight;
        if (y < panelY) return null;

        const towerTypes = ['arrow', 'ice', 'poison', 'lightning'];
        const towerWidth = this.width / towerTypes.length;
        const index = Math.floor(x / towerWidth);
        if (index >= 0 && index < towerTypes.length) {
            return towerTypes[index];
        }
        return null;
    }
}
