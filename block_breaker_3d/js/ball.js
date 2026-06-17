import * as THREE from 'three';

export class Ball {
    constructor(scene, config) {
        this.config = config;
        this.radius = config.ballRadius || 0.2;
        this.speed = config.ballSpeed || 6;
        this.active = false;

        const geometry = new THREE.SphereGeometry(this.radius, 16, 16);
        const material = new THREE.MeshPhongMaterial({ color: 0xff4444, emissive: 0x441111 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.visible = false;
        scene.add(this.mesh);

        this.velocity = new THREE.Vector3();
    }

    reset() {
        this.active = false;
        this.mesh.visible = false;
        this.mesh.position.set(0, 0, this.config.paddleZ || 0);
        this.velocity.set(0, 0, 0);
    }

    activate() {
        this.active = true;
        this.mesh.visible = true;
        const angle = (Math.random() - 0.5) * 0.5;
        const yAngle = (Math.random() - 0.5) * 0.3;
        this.velocity.set(
            Math.sin(angle) * this.speed,
            Math.sin(yAngle) * this.speed,
            -Math.cos(angle) * Math.cos(yAngle) * this.speed
        );
    }

    isActive() { return this.active; }

    // 物理エンジンがボールの移動を処理するので、updateは最小限
    update(dt, paddle, blocks, walls) {
        // 物理エンジンが位置更新を行うので、ここでは何もしない
    }
}