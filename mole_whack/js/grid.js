import { Mole } from './mole.js?v=1777724670';

export class Grid {
    constructor(canvasWidth, canvasHeight, moleImage) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // 3x3グリッド
        this.columns = 3;
        this.rows = 3;

        // グリッドの位置計算
        const gridWidth = Math.min(canvasWidth * 0.85, 500);
        const gridHeight = Math.min(canvasHeight * 0.6, 500);
        const startX = (canvasWidth - gridWidth) / 2;
        const startY = (canvasHeight - gridHeight) / 2 + canvasHeight * 0.05;

        this.holeSpacingX = gridWidth / (this.columns - 1);
        this.holeSpacingY = gridHeight / (this.rows - 1);
        this.holeRadius = Math.min(this.holeSpacingX, this.holeSpacingY) * 0.35;

        // 穴の位置を計算
        this.holes = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                const hole = {
                    column: col,
                    row: row,
                    x: startX + col * this.holeSpacingX,
                    y: startY + row * this.holeSpacingY,
                    mole: null
                };
                hole.mole = new Mole(
                    hole.column, hole.row, hole.x, hole.y, this.holeRadius, moleImage
                );
                this.holes.push(hole);
            }
        }
    }

    getHoleAt(column, row) {
        return this.holes.find(h => h.column === column && h.row === row);
    }

    getRandomEmptyHole() {
        const emptyHoles = this.holes.filter(h => !h.mole.isUp);
        if (emptyHoles.length === 0) return null;
        return emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
    }

    update(dt) {
        this.holes.forEach(hole => {
            hole.mole.update(dt);
        });
    }

    draw(ctx) {
        // 穴を描画
        this.holes.forEach(hole => {
            // 穴の影
            ctx.beginPath();
            ctx.ellipse(hole.x, hole.y + this.holeRadius * 0.5,
                this.holeRadius * 1.2, this.holeRadius * 0.6, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#5C4033';
            ctx.fill();

            // 穴
            ctx.beginPath();
            ctx.ellipse(hole.x, hole.y + this.holeRadius * 0.3,
                this.holeRadius * 1.0, this.holeRadius * 0.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#3D2817';
            ctx.fill();
        });

        // モグラを描画（穴の上に）
        this.holes.forEach(hole => {
            hole.mole.draw(ctx);
        });
    }

    checkClick(clickX, clickY) {
        for (const hole of this.holes) {
            if (hole.mole.isClicked(clickX, clickY)) {
                return hole;
            }
        }
        return null;
    }

    spawnMole(duration) {
        const hole = this.getRandomEmptyHole();
        if (hole) {
            hole.mole.appear(duration);
            return true;
        }
        return false;
    }

    getAllMoles() {
        return this.holes.map(h => h.mole);
    }
}
