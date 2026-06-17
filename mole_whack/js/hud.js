export class HUD {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    drawScore(ctx, score) {
        const x = 20;
        const y = 70;

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
        const y = 70;

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

    // フィーバーゲージ描画
    drawFeverGauge(ctx, gaugeValue, isFever, feverTimeLeft) {
        const gaugeWidth = 300;
        const gaugeHeight = 20;
        const x = (this.canvasWidth - gaugeWidth) / 2;
        const y = 10;

        ctx.save();

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(x - 2, y - 2, gaugeWidth + 4, gaugeHeight + 4, 6);
        ctx.fill();

        // ゲージ本体
        const fillWidth = (gaugeValue / 100) * gaugeWidth;

        if (isFever) {
            // フィーバー中は虹色アニメーション
            const hue = (Date.now() / 10) % 360;
            const gradient = ctx.createLinearGradient(x, y, x + gaugeWidth, y);
            gradient.addColorStop(0, `hsl(${hue}, 100%, 60%)`);
            gradient.addColorStop(0.5, `hsl(${(hue + 120) % 360}, 100%, 60%)`);
            gradient.addColorStop(1, `hsl(${(hue + 240) % 360}, 100%, 60%)`);
            ctx.fillStyle = gradient;
        } else {
            // 通常: 黄色→オレンジ→赤
            const gradient = ctx.createLinearGradient(x, y, x + gaugeWidth, y);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(0.5, '#FFA500');
            gradient.addColorStop(1, '#FF4500');
            ctx.fillStyle = gradient;
        }

        ctx.beginPath();
        ctx.roundRect(x, y, fillWidth, gaugeHeight, 4);
        ctx.fill();

        // ゲージ枠
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, gaugeWidth, gaugeHeight, 4);
        ctx.stroke();

        // テキスト
        if (isFever) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`🔥 FEVER! (${Math.ceil(feverTimeLeft)}秒) 🔥`, this.canvasWidth / 2, y + gaugeHeight / 2);
        } else {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${Math.floor(gaugeValue)}%`, this.canvasWidth / 2, y + gaugeHeight / 2);
        }

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
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('またにたたき', x, y);

        // スタートテキスト
        ctx.fillStyle = 'white';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('タップしてスタート！', x, y + 80);

        // 説明
        ctx.fillStyle = '#DDD';
        ctx.font = '20px Arial';
        ctx.fillText('モグラがでたらタップして叩いてね！', x, y + 140);
        ctx.fillText('連続で叩くとフィーバーゲージが溜まる！', x, y + 170);
        ctx.fillText('20コンボでフィーバーモード発動🔥', x, y + 200);

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
}