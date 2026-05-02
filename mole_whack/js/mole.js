// モグラクラス

export class Mole {
    constructor(column, row, holeX, holeY, holeRadius, moleImage) {
        this.column = column;
        this.row = row;
        this.holeX = holeX;
        this.holeY = holeY;
        this.holeRadius = holeRadius;
        this.moleImage = moleImage;

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

    appear(duration) {
        this.isUp = true;
        this.isHit = false;
        this.timer = duration;
        this.maxTime = duration;
        this.targetYOffset = -this.holeRadius * 0.8;
        this.hitEffect = 0;
    }

    hide() {
        this.isUp = false;
        this.isHit = false;
        this.targetYOffset = 0;
        this.timer = 0;
        this.hitEffect = 0;
    }

    // モグラを叩く処理 — パーティクルとスコアポップアップを発生させてモグラをすぐに消す
    hit(particles, popups) {
        if (this.isHit) return false;

        this.isHit = true;

        // モグラの中心位置
        const x = this.holeX;
        const y = this.holeY + this.yOffset;

        // パーティクルを噴射（黄色・白・緑・オレンジ）
        const colors = ['#FFD700', '#FFFFFF', '#90EE90', '#FFA500', '#FF6B6B'];
        particles.emit(x, y, 20, colors);

        // スコアポップアップ（+10 を表示）
        popups.add(x, y - 20, '+10', '#FFD700');

        // すぐにモグラを消す（hitEffect は短い演出時間）
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
        } else {
            // フォールバック: 円+顔
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = this.isHit ? '#FF6B6B' : '#8B4513';
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