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
        this.maxTime = 1.5; // 出現時間
        this.hitEffect = 0; // 叩かれた演出タイマー

        // 出現アニメーション
        this.yOffset = 0; // 穴からの高さ
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

    hit() {
        if (this.isHit) return false;
        this.isHit = true;
        this.hitEffect = 0.5; // 0.5秒間演出
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

        if (this.moleImage && this.moleImage.complete) {
            // 画像表示
            const imgSize = size * 2;
            ctx.drawImage(this.moleImage, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
        } else {
            // フォールバック: 円+顔
            // 体
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
