export class InputManager {
    constructor(canvas) {
        this.x = 0;
        this.y = 0;
        this.down = false;
        this.clickX = 0;
        this.clickY = 0;
        this.clicked = false;

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (canvas.width / rect.width),
                y: (clientY - rect.top) * (canvas.height / rect.height)
            };
        };

        canvas.addEventListener('mousedown', (e) => {
            const pos = getPos(e);
            this.x = pos.x;
            this.y = pos.y;
            this.down = true;
        });
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const pos = getPos(e);
            this.x = pos.x;
            this.y = pos.y;
            this.down = true;
        }, { passive: false });

        canvas.addEventListener('mousemove', (e) => {
            const pos = getPos(e);
            this.x = pos.x;
            this.y = pos.y;
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const pos = getPos(e);
            this.x = pos.x;
            this.y = pos.y;
        }, { passive: false });

        const endHandler = (e) => {
            this.down = false;
            this.clickX = this.x;
            this.clickY = this.y;
            this.clicked = true;
        };
        canvas.addEventListener('mouseup', endHandler);
        canvas.addEventListener('touchend', endHandler);
    }

    getPointerPos() {
        return { x: this.x, y: this.y };
    }

    isMouseDown() {
        return this.down;
    }

    getClick() {
        if (this.clicked) {
            this.clicked = false;
            return { x: this.clickX, y: this.clickY };
        }
        return null;
    }

    update() {
        // クリック状態はgetClickで消費される
    }
}
