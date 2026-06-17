import * as THREE from 'three';

export class Paddle {
    constructor(scene, config) {
        this.config = config;
        this.width = config.paddleWidth || 3;
        this.height = config.paddleHeight || 0.3;
        this.depth = config.paddleDepth || 0.3;
        this.zPos = config.paddleZ || 1;

        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4488ff,
            emissive: 0x4488ff,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.5,
            depthWrite: false
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0, this.zPos);
        scene.add(this.mesh);
    }

    update(input, camera) {
        // 壁の境界を使ってパドルの移動範囲を制限（画面外にはみ出さない）
        const wallMinX = -3.6;
        const wallMaxX = 3.6;
        const wallMinY = -2.25;
        const wallMaxY = 2.25;

        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        // ノーマライズされた入力(-1〜1)を壁の範囲にマップ
        const targetX = input.getNormX() * (wallMaxX - wallMinX) / 2;
        const targetY = input.getNormY() * (wallMaxY - wallMinY) / 2;

        // パドルが壁にはみ出ないようにclamp
        const minX = wallMinX + halfWidth;
        const maxX = wallMaxX - halfWidth;
        const minY = wallMinY + halfHeight;
        const maxY = wallMaxY - halfHeight;

        this.mesh.position.x = THREE.MathUtils.clamp(targetX, minX, maxX);
        this.mesh.position.y = THREE.MathUtils.clamp(targetY, minY, maxY);
    }

    getBounds() {
        const hw = this.width / 2;
        const hh = this.height / 2;
        const hd = this.depth / 2;
        return {
            minX: this.mesh.position.x - hw,
            maxX: this.mesh.position.x + hw,
            minY: this.mesh.position.y - hh,
            maxY: this.mesh.position.y + hh,
            minZ: this.mesh.position.z - hd,
            maxZ: this.mesh.position.z + hd
        };
    }

    reset() {
        this.mesh.position.set(0, 0, this.zPos);
    }
}