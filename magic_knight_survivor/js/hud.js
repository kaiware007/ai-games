// ゲームクリア時間（秒）
const GAME_CLEAR_TIME = 600;

export class HUD {
    constructor(canvas) {
        this.canvas = canvas;
        this.menuActive = false;
        this.choices = [];
        this.selection = -1;
    }

    draw(ctx, player, game) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // 背景オーバーレイ
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, w, 40);

        ctx.font = '14px monospace';
        ctx.textAlign = 'left';

        // ライフバー
        const hpRatio = player.hp / player.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(10, 8, 150, 12);
        ctx.fillStyle = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(10, 8, 150 * hpRatio, 12);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 8, 150, 12);

        ctx.fillStyle = '#fff';
        ctx.font = '11px monospace';
        ctx.fillText(`HP ${Math.ceil(player.hp)}/${player.maxHp}`, 15, 18);

        // 経験値ゲージ
        const expRatio = player.experience / player.experienceToNext;
        ctx.fillStyle = '#333';
        ctx.fillRect(10, 24, 150, 8);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(10, 24, 150 * expRatio, 8);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(10, 24, 150, 8);

        // レベル
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv.${player.level}`, w / 2, 18);

        // スコア
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`Score: ${game.score}`, w - 10, 18);

        // タイマー（残り時間表示）
        const remaining = Math.max(0, GAME_CLEAR_TIME - game.time);
        const minutes = Math.floor(remaining / 60);
        const seconds = Math.floor(remaining % 60);
        ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, w - 10, 36);

        // 武器情報（右下）
        const weapons = game.weaponManager.getWeapons();
        if (weapons.length > 0) {
            ctx.textAlign = 'right';
            ctx.font = '11px monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            weapons.forEach((w, i) => {
                ctx.fillText(`${w.name} Lv.${w.level}`, w - 10, 58 + i * 14);
            });
        }
    }

    drawLevelUpMenu(ctx, choices) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        // タイトル
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL UP!', w / 2, 60);

        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.fillText('武器を選んで強化して！', w / 2, 90);

        // カード描画
        const cardWidth = 140;
        const cardHeight = 180;
        const gap = 20;
        const totalWidth = cardWidth * 3 + gap * 2;
        const startX = (w - totalWidth) / 2;
        const startY = 120;

        this.choices = choices;

        choices.forEach((choice, i) => {
            const x = startX + i * (cardWidth + gap);
            const y = startY;

            // カード背景
            const isSelected = (i === this.selection);
            ctx.fillStyle = isSelected ? '#f39c12' : '#2c3e50';
            ctx.strokeStyle = isSelected ? '#f1c40f' : '#34495e';
            ctx.lineWidth = isSelected ? 3 : 2;

            ctx.beginPath();
            ctx.roundRect(x, y, cardWidth, cardHeight, 10);
            ctx.fill();
            ctx.stroke();
            ctx.lineWidth = 1;

            // 武器色インジケーター
            ctx.fillStyle = choice.color || '#9b59b6';
            ctx.beginPath();
            ctx.arc(x + cardWidth / 2, y + 40, 25, 0, Math.PI * 2);
            ctx.fill();

            // 武器名
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(choice.name, x + cardWidth / 2, y + 85);

            // 説明
            ctx.fillStyle = '#bbb';
            ctx.font = '11px monospace';
            const desc = choice.desc || '';
            const words = desc.match(/.{1,8}/g) || [];
            words.forEach((word, j) => {
                ctx.fillText(word, x + cardWidth / 2, y + 105 + j * 14);
            });

            // レベル表示
            if (choice.currentLevel > 0) {
                ctx.fillStyle = '#f1c40f';
                ctx.font = 'bold 12px monospace';
                ctx.fillText(`強化! Lv.${choice.currentLevel} → Lv.${choice.currentLevel + 1}`, x + cardWidth / 2, y + 165);
            } else {
                ctx.fillStyle = '#2ecc71';
                ctx.font = 'bold 12px monospace';
                ctx.fillText('新規獲得!', x + cardWidth / 2, y + 165);
            }
        });
    }

    isMenuActive() { return this.menuActive; }

    setMenuActive(active, choices) {
        this.menuActive = active;
        this.choices = choices || [];
        this.selection = -1;
    }

    getMenuSelection(mx, my) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        const cardWidth = 140;
        const cardHeight = 180;
        const gap = 20;
        const totalWidth = cardWidth * 3 + gap * 2;
        const startX = (w - totalWidth) / 2;
        const startY = 120;

        for (let i = 0; i < 3; i++) {
            const x = startX + i * (cardWidth + gap);
            const y = startY;
            if (mx >= x && mx <= x + cardWidth && my >= y && my <= y + cardHeight) {
                return i;
            }
        }
        return -1;
    }
}
