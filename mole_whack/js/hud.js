export class HUD {
  constructor(canvasHeight) {
    this.canvasHeight = canvasHeight;
  }

  draw(ctx, score, timeLeft, totalTime) {
    // 背景バー
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, 110);

    // タイトル
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('モグラ叩き！', ctx.canvas.width / 2, 40);
    ctx.fillText('モグラ叩き！', ctx.canvas.width / 2, 40);

    // スコア
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFD700';
    ctx.strokeText(`スコア: ${score}`, 20, 80);
    ctx.fillText(`スコア: ${score}`, 20, 80);

    // 残り時間
    ctx.textAlign = 'right';
    const isLowTime = timeLeft <= 10;
    if (isLowTime) {
      // 残り10秒で点滅
      const blink = Math.sin(Date.now() / 100) > 0;
      ctx.fillStyle = blink ? '#FF4444' : '#FF8888';
    } else {
      ctx.fillStyle = '#FFFFFF';
    }
    ctx.strokeText(`残り: ${Math.ceil(timeLeft)}秒`, ctx.canvas.width - 20, 80);
    ctx.fillText(`残り: ${Math.ceil(timeLeft)}秒`, ctx.canvas.width - 20, 80);
  }
}