// スコアポップアップ — モグラを叩いたときに浮かび上がる「+10」などのテキスト演出

export class ScorePopup {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1.0;       // 残り時間（秒）
        this.maxLife = 1.0;    // 最大寿命
        this.vy = -80;         // 上昇速度（px/秒）
    }

    update(dt) {
        this.y += this.vy * dt;
        this.vy *= 0.95;       // 徐々に減速
        this.life -= dt;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // テキストの縁取り
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 4;
        ctx.strokeText(this.text, this.x, this.y);

        // テキスト本体
        ctx.fillText(this.text, this.x, this.y);

        ctx.restore();
    }

    get isAlive() {
        return this.life > 0;
    }
}

export class ScorePopupManager {
    constructor() {
        this.popups = [];
    }

    // 指定位置にスコアテキストを作成
    add(x, y, text, color) {
        this.popups.push(new ScorePopup(x, y, text, color));
    }

    update(dt) {
        for (const p of this.popups) {
            p.update(dt);
        }
        this.popups = this.popups.filter(p => p.isAlive);
    }

    draw(ctx) {
        for (const p of this.popups) {
            p.draw(ctx);
        }
    }

    clear() {
        this.popups = [];
    }
}