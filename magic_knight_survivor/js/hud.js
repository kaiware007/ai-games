export class HUD {
    constructor(canvas) {
        this.canvas = canvas;
    }

    init() {
        // 初期化
    }

    update(player, gameTime, kills) {
        // 毎フレームの更新
    }

    draw(ctx) {
        // 引数でプレイヤー情報を受けるように修正
    }

    drawWithPlayer(ctx, player, gameTime, kills) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // HPバー
        const hpBarWidth = 200;
        const hpBarHeight = 20;
        const hpX = 20;
        const hpY = 20;
        const hpPercent = player.hp / player.maxHP;

        // HPバー背景
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.roundRect(hpX, hpY, hpBarWidth, hpBarHeight, 5);
        ctx.fill();

        // HPバー
        const hpColor = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FF9800' : '#F44336';
        ctx.fillStyle = hpColor;
        ctx.beginPath();
        ctx.roundRect(hpX, hpY, hpBarWidth * hpPercent, hpBarHeight, 5);
        ctx.fill();

        // HPテキスト
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.ceil(player.hp)} / ${player.maxHP}`, hpX + hpBarWidth / 2, hpY + 15);

        // レベル表示
        ctx.textAlign = 'left';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`Lv.${player.level}`, hpX, hpY + 45);

        // 経験値バー
        const xpBarWidth = 150;
        const xpBarHeight = 10;
        const xpX = hpX;
        const xpY = hpY + 55;
        const xpPercent = player.xp / player.xpToNextLevel;

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.roundRect(xpX, xpY, xpBarWidth, xpBarHeight, 3);
        ctx.fill();

        ctx.fillStyle = '#E040FB';
        ctx.beginPath();
        ctx.roundRect(xpX, xpY, xpBarWidth * xpPercent, xpBarHeight, 3);
        ctx.fill();

        // 時間表示
        const minutes = Math.floor(gameTime / 60);
        const seconds = Math.floor(gameTime % 60);
        ctx.textAlign = 'right';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#FFF';
        ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, w - 20, 40);

        // スコア
        const score = kills * 10 + Math.floor(gameTime);
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`スコア: ${score}`, w - 20, 65);

        // クリル数
        ctx.fillStyle = '#FFF';
        ctx.fillText(`倒した敵: ${kills}`, w - 20, 90);

        // 所持武器リスト（右上）
        const weapons = player.getWeapons();
        const buffs = player.getBuffs();
        
        if (weapons.length > 0 || buffs.length > 0) {
            ctx.textAlign = 'right';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = '#FFF';
            ctx.fillText('所持アイテム', w - 20, 120);

            let itemY = 140;
            ctx.font = '12px sans-serif';
            
            for (const weapon of weapons) {
                ctx.fillStyle = '#FF9800'; // 武器はオレンジ
                const name = this.getWeaponName(weapon.id);
                ctx.fillText(`${this.getWeaponIcon(weapon.id)} ${name} Lv.${weapon.level}`, w - 20, itemY);
                itemY += 18;
            }

            for (const buff of buffs) {
                ctx.fillStyle = '#8BC34A'; // バフは黄緑
                const name = this.getBuffName(buff.id);
                ctx.fillText(`★ ${name} Lv.${buff.level}`, w - 20, itemY);
                itemY += 18;
            }
        }
    }

    getWeaponName(weaponId) {
        const names = {
            magic_bowl: 'マジックボウル',
            spinning_sword: '回転剣',
            holy_aura: '聖光陣',
            thunder: '雷撃',
            poison_cloud: 'ポイズンクラウド',
            shower_of_arrows: 'シャワーオブアロウ',
            guardian: 'ガーディアン',
            holy_cross: 'ホーリークロス'
        };
        return names[weaponId] || weaponId;
    }

    getWeaponIcon(weaponId) {
        const icons = {
            magic_bowl: '🔮',
            spinning_sword: '⚔️',
            holy_aura: '✨',
            thunder: '⚡',
            poison_cloud: '☁️',
            shower_of_arrows: '🏹',
            guardian: '🗿',
            holy_cross: '✝️'
        };
        return icons[weaponId] || '⚔️';
    }

    getBuffName(buffId) {
        const names = {
            max_hp_up: 'マックスHPアップ',
            attack_speed_up: '攻撃速度アップ',
            attack_range_up: '攻撃範囲拡大'
        };
        return names[buffId] || buffId;
    }
}
