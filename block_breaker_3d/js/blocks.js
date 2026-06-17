import * as THREE from 'three';

export class BlockManager {
    constructor(scene, config) {
        this.config = config;
        this.scene = scene;
        this.blocks = [];
        this.score = 0;
        this.colors = [0xff6666, 0x66ff66, 0x6666ff, 0xffff66, 0xff66ff, 0x66ffff];
    }

    createBlocks() {
        this.clear();
        const rows = this.config.blockRows || 4;
        const cols = this.config.blockCols || 8;
        const depth = this.config.blockDepth || 3;
        const blockW = this.config.blockWidth || 0.8;
        const blockH = this.config.blockHeight || 0.4;
        const blockD = this.config.blockDepthSize || 0.4;
        const gap = 0.1;

        // ブロックの配置範囲を壁の境界に合わせて調整
        const wallMinX = -3.6;
        const wallMaxX = 3.6;
        const wallMinY = -2.25;
        const wallMaxY = 2.25;

        // X方向の配置範囲も壁に合わせて制限
        const totalBlockWidth = cols * (blockW + gap) - gap;
        const startX = wallMinX + (wallMaxX - wallMinX - totalBlockWidth) / 2;
        const totalBlockHeight = rows * (blockH + gap) - gap;
        const startY = wallMinY + (wallMaxY - wallMinY - totalBlockHeight) / 2;

        for (let z = 0; z < depth; z++) {
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const geometry = new THREE.BoxGeometry(blockW, blockH, blockD);
                    const colorIndex = (r + z) % this.colors.length;
                    const material = new THREE.MeshPhongMaterial({
                        color: this.colors[colorIndex],
                        emissive: this.colors[colorIndex],
                        emissiveIntensity: 0.15
                    });
                    const mesh = new THREE.Mesh(geometry, material);

                    const x = startX + c * (blockW + gap);
                    const y = startY + r * (blockH + gap) + blockH / 2;
                    // ブロックはZ=-5~-7に配置（カメラZ=5から見て奥）
                    const zz = (z - (depth - 1) / 2) * (blockD + gap) - 6;

                    mesh.position.set(x, y, zz);
                    this.scene.add(mesh);
                    this.blocks.push({ mesh, active: true, row: r });
                }
            }
        }
    }

    clear() {
        for (const block of this.blocks) {
            this.scene.remove(block.mesh);
            block.mesh.geometry.dispose();
            block.mesh.material.dispose();
        }
        this.blocks = [];
        this.score = 0;
    }

    destroyBlock(index) {
        if (index < 0 || index >= this.blocks.length) return;
        if (!this.blocks[index].active) return;
        this.blocks[index].active = false;
        this.scene.remove(this.blocks[index].mesh);
        this.score += 10 * (this.blocks[index].row + 1);
    }

    getAllBounds() {
        const bounds = [];
        for (let i = 0; i < this.blocks.length; i++) {
            if (!this.blocks[i].active) continue;
            const m = this.blocks[i].mesh;
            const hw = this.config.blockWidth / 2 || 0.4;
            const hh = this.config.blockHeight / 2 || 0.2;
            const hd = this.config.blockDepthSize / 2 || 0.2;
            bounds.push({
                minX: m.position.x - hw, maxX: m.position.x + hw,
                minY: m.position.y - hh, maxY: m.position.y + hh,
                minZ: m.position.z - hd, maxZ: m.position.z + hd,
                blockIndex: i
            });
        }
        return bounds;
    }

    // アクティブなブロックを取得
    getActiveBlocks() {
        return this.blocks.filter(b => b.active);
    }

    isCleared() {
        return this.blocks.every(b => !b.active);
    }

    getScore() { return this.score; }

    reset() {
        this.clear();
        this.createBlocks();
    }
}