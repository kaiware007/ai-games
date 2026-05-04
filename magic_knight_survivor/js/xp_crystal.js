export class XPCrystal {
    constructor() {
        this.crystals = [];
    }

    clear() {
        this.crystals = [];
    }

    add(x, y, xpValue) {
        this.crystals.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            xpValue: xpValue,
            size: 6 + Math.min(xpValue / 5, 6),
            color: xpValue >= 25 ? '#FFD700' : '#E040FB',
            magnetized: false,
            angle: Math.random() * Math.PI * 2
        });
    }

    update(dt, player) {
        for (let i = this.crystals.length - 1; i >= 0; i--) {
            const crystal = this.crystals[i];
            
            // プレイヤーとの距離
            const dx = player.x - crystal.x;
            const dy = player.y - crystal.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // マグネット効果（100px以内）
            if (dist < 100) {
                crystal.magnetized = true;
            }

            if (crystal.magnetized) {
                const speed = 400;
                crystal.x += (dx / dist) * speed * dt;
                crystal.y += (dy / dist) * speed * dt;
            }

            // 収集判定
            if (dist < 20) {
                player.gainXP(crystal.xpValue);
                this.crystals.splice(i, 1);
            }

            // 回転アニメーション
            crystal.angle += dt * 2;
        }
    }

    getCrystals() {
        return this.crystals;
    }

    draw(ctx, cameraX, cameraY) {
        for (const crystal of this.crystals) {
            const screenX = crystal.x - cameraX;
            const screenY = crystal.y - cameraY;

            // 画面外なら描画しない
            if (screenX < -20 || screenX > 820 || screenY < -20 || screenY > 620) continue;

            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.rotate(crystal.angle);

            // クリスタルの描画（菱形）
            ctx.fillStyle = crystal.color;
            ctx.beginPath();
            ctx.moveTo(0, -crystal.size);
            ctx.lineTo(crystal.size * 0.6, 0);
            ctx.lineTo(0, crystal.size);
            ctx.lineTo(-crystal.size * 0.6, 0);
            ctx.closePath();
            ctx.fill();

            // ハイライト
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.moveTo(0, -crystal.size * 0.5);
            ctx.lineTo(crystal.size * 0.3, 0);
            ctx.lineTo(0, crystal.size * 0.5);
            ctx.lineTo(-crystal.size * 0.3, 0);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    }
}
