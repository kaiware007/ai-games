// 入力管理クラス（キーボード＋タッチ対応）
export class InputManager {
    constructor() {
        this.keys = {};
        this.touchLeft = false;
        this.touchRight = false;
        this.touchFire = false;
        this.fired = false; // フレーム内で発射トリガーが発火したか

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                this.fired = true;
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // タッチ対応
        window.addEventListener('touchstart', (e) => {
            for (const touch of e.changedTouches) {
                const x = touch.clientX;
                const w = window.innerWidth;
                if (x < w * 0.3) {
                    this.touchLeft = true;
                } else if (x > w * 0.7) {
                    this.touchRight = true;
                } else {
                    this.touchFire = true;
                    this.fired = true;
                }
            }
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            this.touchLeft = false;
            this.touchRight = false;
            this.touchFire = false;
        });

        window.addEventListener('touchmove', (e) => {
            this.touchLeft = false;
            this.touchRight = false;
            for (const touch of e.changedTouches) {
                const x = touch.clientX;
                const w = window.innerWidth;
                if (x < w * 0.3) {
                    this.touchLeft = true;
                } else if (x > w * 0.7) {
                    this.touchRight = true;
                }
            }
            e.preventDefault();
        }, { passive: false });
    }

    isLeft() {
        return this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touchLeft;
    }

    isRight() {
        return this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchRight;
    }

    isFire() {
        return this.keys['Space'] || this.touchFire;
    }

    consumeFire() {
        if (this.fired) {
            this.fired = false;
            return true;
        }
        return false;
    }

    resetFire() {
        this.fired = false;
    }
}
