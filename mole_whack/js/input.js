export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.clickPosition = null;
        this.isClicking = false;

        this.setupEvents();
    }

    setupEvents() {
        // マウス
        this.canvas.addEventListener('mousedown', (e) => this.handleClick(e.clientX, e.clientY));

        // タッチ
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleClick(touch.clientX, touch.clientY);
        }, { passive: false });
    }

    handleClick(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        this.clickPosition = {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
        this.isClicking = true;
    }

    consumeClick() {
        const pos = this.clickPosition;
        if (pos) {
            this.clickPosition = null;
            this.isClicking = false;
            return pos;
        }
        return null;
    }

    hasClick() {
        return this.clickPosition !== null;
    }
}
