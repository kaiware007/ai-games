export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.touchActive = false;
        this.touchTarget = { x: 0, y: 0 };
        this.touchStartWorld = { x: 0, y: 0 };

        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // タッチ入力
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchActive = true;
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            this.touchTarget.x = touch.clientX - rect.left;
            this.touchTarget.y = touch.clientY - rect.top;
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.touchActive) {
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                this.touchTarget.x = touch.clientX - rect.left;
                this.touchTarget.y = touch.clientY - rect.top;
            }
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchActive = false;
        }, { passive: false });
    }

    update() {
        // 毎フレームの更新処理（必要に応じて追加）
    }

    getMoveDirection() {
        let dx = 0, dy = 0;
        if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;
        return { dx, dy };
    }

    getTouchTarget() {
        return { ...this.touchTarget };
    }

    isTouchActive() {
        return this.touchActive;
    }
}
