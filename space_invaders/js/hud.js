// HUDクラス — スコア・ライフ・レベル表示
export class HUD {
    constructor(canvasHeight) {
        this.canvasHeight = canvasHeight;
    }

    draw(ctx, score, lives, level, message = '') {
        const y = this.canvasHeight - 30;

        // スコア
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${score}`, 10, y);

        // レベル
        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL: ${level}`, ctx.canvas.width / 2, y);

        // ライフ（アイコン表示）
        ctx.textAlign = 'right';
        ctx.fillText('LIVES:', ctx.canvas.width - 80, y);
        for (let i = 0; i < lives; i++) {
            const lx = ctx.canvas.width - 70 + i * 20;
            this.drawPlayerIcon(ctx, lx, y - 12, 16, 10);
        }

        // メッセージ（ゲームオーバーなど）
        if (message) {
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(message, ctx.canvas.width / 2, this.canvasHeight / 2 - 20);
        }
    }

    drawPlayerIcon(ctx, x, y, width, height) {
        ctx.fillStyle = '#00ff00';
        // シンプルなプレイヤーアイコン
        ctx.fillRect(x, y + height * 0.5, width, height * 0.5);
        ctx.fillRect(x + width * 0.3, y, width * 0.4, height * 0.5);
    }
}
