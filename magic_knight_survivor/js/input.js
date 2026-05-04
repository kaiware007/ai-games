export class InputManager {
    constructor(canvas, gameStateRef) {
        this.canvas = canvas;
        this.gameStateRef = gameStateRef; // () => 'title' | 'playing' | ...
        this.keys = {};
        this.touchActive = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchCurrentX = 0;
        this.touchCurrentY = 0;
        this.touchTargetX = 0;
        this.touchTargetY = 0;

        window.addEventListener('keydown', (e) => { this.keys[e.key.toLowerCase()] = true; });
        window.addEventListener('keyup', (e) => { this.keys[e.key.toLowerCase()] = false; });

        canvas.addEventListener('touchstart', (e) => {
            // タイトル画面・ゲームオーバー画面では preventDefault しない（クリック処理を通す）
            const gs = this.gameStateRef ? this.gameStateRef() : 'playing';
            if (gs === 'playing' || gs === 'levelup') {
                e.preventDefault();
            }
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            this.touchActive = true;
            this.touchStartX = touch.clientX - rect.left;
            this.touchStartY = touch.clientY - rect.top;
            this.touchCurrentX = this.touchStartX;
            this.touchCurrentY = this.touchStartY;
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            const gs = this.gameStateRef ? this.gameStateRef() : 'playing';
            if (gs === 'playing') {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                this.touchCurrentX = touch.clientX - rect.left;
                this.touchCurrentY = touch.clientY - rect.top;
            }
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            const gs = this.gameStateRef ? this.gameStateRef() : 'playing';
            if (gs === 'playing') {
                e.preventDefault();
            }
            this.touchActive = false;
        }, { passive: false });
    }

    update() {
        if (this.touchActive) {
            const dx = this.touchCurrentX - this.touchStartX;
            const dy = this.touchCurrentY - this.touchStartY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
                this.touchTargetX = dx / dist;
                this.touchTargetY = dy / dist;
            }
        }
    }

    getMoveDirection() {
        let dx = 0, dy = 0;
        if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;

        if (this.touchActive) {
            dx = this.touchTargetX;
            dy = this.touchTargetY;
        }

        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
            dx /= len;
            dy /= len;
        }
        return { x: dx, y: dy };
    }

    isTouchActive() {
        return this.touchActive;
    }

    getTouchTarget() {
        return { x: this.touchTargetX, y: this.touchTargetY };
    }
}