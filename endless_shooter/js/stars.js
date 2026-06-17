export class StarBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.stars = [];
        this._init();
    }

    _init() {
        this.stars = [];
        const count = 80;
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 60 + 20,
                brightness: Math.random() * 0.5 + 0.5
            });
        }
    }

    update(dt) {
        for (const star of this.stars) {
            star.y += star.speed * dt;
            if (star.y > this.canvas.height) {
                star.y = -2;
                star.x = Math.random() * this.canvas.width;
            }
        }
    }

    draw(ctx) {
        for (const star of this.stars) {
            const alpha = star.brightness;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
