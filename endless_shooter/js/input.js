export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = canvas.width / 2;
        this.y = canvas.height * 0.75;
        this.active = false;
        this.touchEnabled = true;
        this._lastTouchX = 0;
        this._lastTouchY = 0;
        this._hasLastTouch = false;
        this.keys = {};
        this._setupEvents();
    }

    _setupEvents() {
        const c = this.canvas;

        c.addEventListener('pointerdown', (e) => {
            if (!this.touchEnabled) return;
            const pos = this._getPos(e);
            this._lastTouchX = pos.x;
            this._lastTouchY = pos.y;
            this._hasLastTouch = true;
            this.active = true;
        });

        c.addEventListener('pointermove', (e) => {
            if (!this.touchEnabled) return;
            if (this.active) {
                const pos = this._getPos(e);
                if (this._hasLastTouch) {
                    const dx = pos.x - this._lastTouchX;
                    const dy = pos.y - this._lastTouchY;
                    this.x += dx;
                    this.y += dy;
                }
                this._lastTouchX = pos.x;
                this._lastTouchY = pos.y;
                this._hasLastTouch = true;
            }
        });

        c.addEventListener('pointerup', () => {
            this.active = false;
            this._hasLastTouch = false;
        });
        c.addEventListener('pointerleave', () => {
            this.active = false;
            this._hasLastTouch = false;
        });

        window.addEventListener('keydown', (e) => { this.keys[e.key] = true; });
        window.addEventListener('keyup', (e) => { this.keys[e.key] = false; });
    }

    _getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    update() {
        const speed = 250;
        const dt = 1 / 60;
        if (this.keys['ArrowLeft'] || this.keys['a']) this.x -= speed * dt;
        if (this.keys['ArrowRight'] || this.keys['d']) this.x += speed * dt;
        if (this.keys['ArrowUp'] || this.keys['w']) this.y -= speed * dt;
        if (this.keys['ArrowDown'] || this.keys['s']) this.y += speed * dt;
        this.x = Math.max(10, Math.min(this.canvas.width - 10, this.x));
        this.y = Math.max(10, Math.min(this.canvas.height - 10, this.y));
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    reset() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height * 0.75;
        this.active = false;
        this._hasLastTouch = false;
        this.keys = {};
    }

    setTouchEnabled(enabled) {
        this.touchEnabled = enabled;
    }
}
