const ALL_WEAPON_IDS = [
    'magic_bowl', 'spinning_sword', 'holy_aura', 'thunder',
    'poison_cloud', 'shower_of_arrows', 'guardian', 'holy_cross'
];

const WEAPON_DISPLAY_NAMES = {
    magic_bowl: 'マジックボウル',
    spinning_sword: '回転剣',
    holy_aura: '聖光陣',
    thunder: '雷撃',
    poison_cloud: 'ポイズンクラウド',
    shower_of_arrows: 'シャワーオブアロウ',
    guardian: 'ガーディアン',
    holy_cross: 'ホーリークロス'
};

const WEAPON_ICONS = {
    magic_bowl: '🔮',
    spinning_sword: '⚔️',
    holy_aura: '✨',
    thunder: '⚡',
    poison_cloud: '☁️',
    shower_of_arrows: '🏹',
    guardian: '🗿',
    holy_cross: '✝️'
};

export class LevelUpUI {
    constructor(canvas) {
        this.canvas = canvas;
        this.showing = false;
        this.cards = [];
        this.selection = null;
        this.hoverIndex = -1;
        this.clickHandler = null;

        // クリックイベント
        canvas.addEventListener('click', (e) => {
            if (!this.showing) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const cardWidth = 160;
            const cardHeight = 200;
            const gap = 20;
            const totalWidth = cardWidth * 3 + gap * 2;
            const startX = (canvas.width - totalWidth) / 2;
            const startY = (canvas.height - cardHeight) / 2;

            for (let i = 0; i < 3; i++) {
                const cardX = startX + i * (cardWidth + gap);
                const cardY = startY;
                
                if (x >= cardX && x <= cardX + cardWidth && y >= cardY && y <= cardY + cardHeight) {
                    this.selection = this.cards[i];
                    this.showing = false;
                    break;
                }
            }
        });

        // タッチイベント
        canvas.addEventListener('touchend', (e) => {
            if (!this.showing) return;
            e.preventDefault();
            
            const touch = e.changedTouches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            const cardWidth = 160;
            const cardHeight = 200;
            const gap = 20;
            const totalWidth = cardWidth * 3 + gap * 2;
            const startX = (canvas.width - totalWidth) / 2;
            const startY = (canvas.height - cardHeight) / 2;

            for (let i = 0; i < 3; i++) {
                const cardX = startX + i * (cardWidth + gap);
                const cardY = startY;
                
                if (x >= cardX && x <= cardX + cardWidth && y >= cardY && y <= cardY + cardHeight) {
                    this.selection = this.cards[i];
                    this.showing = false;
                    break;
                }
            }
        }, { passive: false });
    }

    init() {
        this.showing = false;
        this.cards = [];
        this.selection = null;
    }

    show(availableWeapons) {
        this.showing = true;
        this.selection = null;
        this.cards = availableWeapons;
    }

    hide() {
        this.showing = false;
    }

    update(dt) {
        // アニメーションなど
    }

    isShowing() {
        return this.showing;
    }

    getSelection() {
        return this.selection;
    }

    draw(ctx) {
        if (!this.showing) return;

        // 背景を暗く
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // タイトル
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('レベルアップ！', this.canvas.width / 2, 80);

        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#FFF';
        ctx.fillText('武器を選んでください', this.canvas.width / 2, 110);

        // カード描画
        const cardWidth = 160;
        const cardHeight = 200;
        const gap = 20;
        const totalWidth = cardWidth * 3 + gap * 2;
        const startX = (this.canvas.width - totalWidth) / 2;
        const startY = (this.canvas.height - cardHeight) / 2;

        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            const cardX = startX + i * (cardWidth + gap);
            const cardY = startY;

            // カード背景
            ctx.fillStyle = '#2C3E50';
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 10);
            ctx.fill();
            ctx.stroke();

            // アイコン
            ctx.font = '48px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(WEAPON_ICONS[card.id] || '⚔️', cardX + cardWidth / 2, cardY + 70);

            // 名前
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = '#FFD700';
            ctx.fillText(WEAPON_DISPLAY_NAMES[card.id] || card.id, cardX + cardWidth / 2, cardY + 105);

            // レベル
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#FFF';
            const existingLevel = card.level || 1;
            ctx.fillText(`Lv.${existingLevel} → Lv.${existingLevel + 1}`, cardX + cardWidth / 2, cardY + 130);

            // 説明
            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#BDC3C7';
            const desc = this.getWeaponDescription(card.id);
            this.drawWrappedText(ctx, desc, cardX + 10, cardY + 150, cardWidth - 20, 14);
        }
    }

    getWeaponDescription(weaponId) {
        const descriptions = {
            magic_bowl: '最も近い敵に魔法弾を発射',
            spinning_sword: '周囲を剣が回転して攻撃',
            holy_aura: '周囲の敵にダメージを与える',
            thunder: 'ランダムな敵に雷を落とす',
            poison_cloud: '歩いた跡に毒雲を残す',
            shower_of_arrows: '上空から矢を降らせる',
            guardian: '味方ゴーレムを召喚',
            holy_cross: '縦横に光の十字架を放つ'
        };
        return descriptions[weaponId] || '';
    }

    drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split('');
        let line = '';
        let lineY = y;

        for (const char of words) {
            const testLine = line + char;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, x + maxWidth / 2, lineY);
                line = char;
                lineY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x + maxWidth / 2, lineY);
    }
}
