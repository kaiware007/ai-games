// モグラクラス — 3種類（通常・速い・超速い）

// モグラ種類定義
export const MOLE_TYPES = {
    normal:   { name: '通常',   duration: 5.0, points: 10, color: '#8B4513', tint: null },
    fast:     { name: '速い',   duration: 3.0, points: 30, color: '#4A90D9', tint: 'rgba(74,144,217,0.4)' },
    ultra:    { name: '超速い', duration: 1.5, points: 50, color: '#E74C3C', tint: 'rgba(231,76,60,0.5)' }
};

// 出現確率（通常50%, 速い30%, 超速い20%）
function randomMoleType() {
    const r = Math.random();
    if (r < 0.50) return 'normal';
    if (r < 0.80) return 'fast';
    return 'ultra';
}

export class Mole {
    constructor(column, row, holeX, holeY, holeRadius, moleImage) {
        this.column = column;
        this.row = row;
        this.holeX = holeX;
        this.holeY = holeY;
        this.holeRadius = holeRadius;
        this.moleImage = moleImage;

        // 種類
        this.type = 'normal';
        this.typeInfo = MOLE_TYPES.normal;

        // 状態
        this.isUp = false;
        this.isHit = false;
        this.timer = 0;
        this.maxTime = 1.5;
        this.hitEffect = 0;

        // 出現アニメーション
        this.yOffset = 0;
        this.targetYOffset = 0;
    }

    appear(duration, type) {
        this.isUp = true;
        this.isHit = false;
        this.timer = duration;
        this.maxTime = duration;
        this.targetYOffset = -this.holeRadius * 0.8;
        this.hitEffect = 0;

        // 種類を設定
        this.type = type || randomMoleType();
        this.typeInfo = MOLE_TYPES[this.type];
    }

    hide() {
        this.isUp = false;
        this.isHit = false;
        this.targetYOffset = 0;
        this.timer = 0;
        this.hitEffect = 0;
    }

    // モグラを叩く処理 — パーティクルとスコアポップアップを発生させてモグラをすぐに消す
    hit(particles, popups, isFever) {
        if (this.isHit) return false;

        this.isHit = true;

        // モグラの中心位置
        const x = this.holeX;
        const y = this.holeY + this.yOffset;

        // 種類ごとの得点（フィーバー中は2倍）
        let points = this.typeInfo.points;
        if (isFever) points *= 2;

        // パーティクルを噴射 — 種類ごとの色
        const colorSets = {
            normal: ['#FFD700', '#FFFFFF', '#90EE90', '#FFA500'],
            fast:   ['#4A90D9', '#87CEEB', '#FFFFFF', '#ADD8E6'],
            ultra:  ['#E74C3C', '#FF6B6B', '#FFFFFF', '#FF4500']
        };
        const popupColors = {
            normal: '#FFD700',
            fast:   '#87CEEB',
            ultra:  '#FF6B6B'
        };
        particles.emit(x, y, 20, colorSets[this.type]);

        // スコアポップアップ
        const text = `+${points}`;
        popups.add(x, y - 20, text, popupColors[this.type]);

        // すぐにモグラを消す
        this.hitEffect = 0.15;

        return true;
    }

    update(dt) {
        // 出現アニメーション
        const speed = 20 * dt;
        if (this.yOffset < this.targetYOffset) {
            this.yOffset = Math.min(this.yOffset + speed, this.targetYOffset);
        } else if (this.yOffset > this.targetYOffset) {
            this.yOffset = Math.max(this.yOffset - speed, this.targetYOffset);
        }

        // タイマー
        if (this.isUp) {
            this.timer -= dt;
            if (this.timer <= 0 || (this.isHit && this.hitEffect <= 0)) {
                this.hide();
            }
        }

        // 叩かれた演出タイマー
        if (this.hitEffect > 0) {
            this.hitEffect -= dt;
        }
    }

    draw(ctx) {
        if (!this.isUp) return;

        const x = this.holeX;
        const y = this.holeY + this.yOffset;
        const size = this.holeRadius * 1.5;

        ctx.save();

        // 叩かれたら少し透明にする
        if (this.isHit) {
            ctx.globalAlpha = Math.max(0, this.hitEffect / 0.15);
        }

        if (this.moleImage && this.moleImage.complete) {
            // 画像表示
            const imgSize = size * 2;
            ctx.drawImage(this.moleImage, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);

            // 種類ごとの色 tint を上に乗せる
            if (this.typeInfo.tint) {
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = this.typeInfo.tint;
                ctx.fillRect(x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
                ctx.globalCompositeOperation = 'source-over';
            }
        } else {
            // フォールバック: 円+顔（種類ごとの色）
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = this.isHit ? '#FF6B6B' : this.typeInfo.color;
            ctx.fill();
            ctx.strokeStyle = '#5C2E00';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 目
            if (!this.isHit) {
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(x - size * 0.3, y - size * 0.2, size * 0.25, 0, Math.PI * 2);
                ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.25, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(x - size * 0.3, y - size * 0.2, size * 0.12, 0, Math.PI * 2);
                ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.12, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // 叩かれた目 (×)
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 3;
                const eyeSize = size * 0.25;
                [-0.3, 0.3].forEach(offset => {
                    const ex = x + size * offset;
                    const ey = y - size * 0.2;
                    ctx.beginPath();
                    ctx.moveTo(ex - eyeSize, ey - eyeSize);
                    ctx.lineTo(ex + eyeSize, ey + eyeSize);
                    ctx.moveTo(ex + eyeSize, ey - eyeSize);
                    ctx.lineTo(ex - eyeSize, ey + eyeSize);
                    ctx.stroke();
                });
            }
        }

        ctx.restore();
    }

    isClicked(clickX, clickY) {
        if (!this.isUp || this.isHit) return false;

        const x = this.holeX;
        const y = this.holeY + this.yOffset;
        const size = this.holeRadius * 1.5;

        const dx = clickX - x;
        const dy = clickY - y;
        return Math.sqrt(dx * dx + dy * dy) < size;
    }
}