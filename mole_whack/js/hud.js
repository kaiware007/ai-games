export class HUD {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    drawScore(ctx, score) {
        const x = 20;
        const y = 40;

        ctx.save();

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(x - 10, y - 30, 160, 50, 10);
        ctx.fill();

        // スコアテキスト
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`スコア: ${score}`, x, y - 5);

        ctx.restore();
    }

    drawCombo(ctx, combo) {
        if (combo < 2) return;

        const x = this.canvasWidth - 20;
        const y = 40;

        ctx.save();

        // 背景
        ctx.fillStyle = 'rgba(255, 100, 100, 0.7)';
        ctx.beginPath();
        ctx.roundRect(x - 120, y - 30, 140, 50, 10);
        ctx.fill();

        // コンボテキスト
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${combo} コンボ!`, x, y - 5);

        ctx.restore();
    }

    drawTimer(ctx, timeLeft) {
        const x = this.canvasWidth / 2;
        const y = 30;

        ctx.save();

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(x - 50, y - 20, 100, 40, 10);
        ctx.fill();

        // 残り時間
        ctx.fillStyle = timeLeft <= 5 ? '#FF6B6B' : 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.ceil(timeLeft)}秒`, x, y);

        ctx.restore();
    }

    drawCountdown(ctx, number) {
        const x = this.canvasWidth / 2;
        const y = this.canvasHeight / 2;

        ctx.save();

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(x, y, 80, 0, Math.PI * 2);
        ctx.fill();

        // テキスト
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (number > 0) {
            ctx.fillText(`${number}`, x, y);
        } else {
            ctx.fillText('GO!', x, y);
        }

        ctx.restore();
    }

    drawTitle(ctx) {
        const x = this.canvasWidth / 2;
        const y = this.canvasHeight / 2 - 50;

        ctx.save();

        // タイトル
        ctx.fillStyle = '#FF6B6B';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('モグラ叩き', x, y);

        // スタートテキスト
        ctx.fillStyle = 'white';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('タップしてスタート！', x, y + 80);

        // 説明
        ctx.fillStyle = '#DDD';
        ctx.font = '20px Arial';
        ctx.fillText('モグラがでたらタップして叩いてね！', x, y + 140);
        ctx.fillText('連続で叩くとコンボUP！', x, y + 170);

        ctx.restore();
    }

    drawGameOver(ctx, score, combo) {
        const x = this.canvasWidth / 2;
        const y = this.canvasHeight / 2;

        ctx.save();

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.roundRect(x - 150, y - 120, 300, 280, 20);
        ctx.fill();

        // ゲームオーバー
        ctx.fillStyle = '#FF6B6B';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ゲームオーバー', x, y - 70);

        // スコア
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 32px Arial';
        ctx.fillText(`スコア: ${score}`, x, y - 10);

        // 最高コンボ
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText(`最高コンボ: ${combo}`, x, y + 30);

        // もう一度
        ctx.fillStyle = '#90EE90';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('タップしてもう一度！', x, y + 90);

        ctx.restore();
    }

    drawHitEffect(ctx, x, y, size) {
        ctx.save();

        // 星の演出
        ctx.fillStyle = '#FFD700';
        ctx.font = `bold ${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', x, y);

        ctx.restore();
    }
}
