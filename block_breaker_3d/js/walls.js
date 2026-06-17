import * as THREE from 'three';

export class WallManager {
    constructor(scene, config) {
        this.config = config;
        this.scene = scene;
        this.walls = [];
        this.wallMinX = 0;
        this.wallMaxX = 0;
        this.wallMinY = 0;
        this.wallMaxY = 0;
        this.wallMinZ = 0;
        this.createWalls();
    }

    createWalls() {
        const wallMat = new THREE.MeshPhongMaterial({
            color: 0x555577,
            transparent: true,
            opacity: 0.25,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        // 壁の境界を定義 — 1割狭く
        const wallMinX = -3.6;
        const wallMaxX = 3.6;
        const wallMinY = -2.25;
        const wallMaxY = 2.25;
        const wallMinZ = -10;

        this.wallMinX = wallMinX;
        this.wallMaxX = wallMaxX;
        this.wallMinY = wallMinY;
        this.wallMaxY = wallMaxY;
        this.wallMinZ = wallMinZ;

        const wallW = wallMaxX - wallMinX;
        const wallH = wallMaxY - wallMinY;
        const wallD = 0 - wallMinZ; // 手前(Z=0)から奥(wallMinZ)までの距離

        // 奥の壁 (Z = wallMinZ、X-Y平面)
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(wallW, wallH),
            wallMat.clone()
        );
        backWall.position.set(0, 0, wallMinZ);
        this.scene.add(backWall);
        this.walls.push(backWall);

        // 左壁 (X = wallMinX、Y-Z平面)
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(wallD, wallH),
            wallMat.clone()
        );
        leftWall.position.set(wallMinX, 0, wallMinZ + wallD / 2);
        leftWall.rotation.y = Math.PI / 2;
        this.scene.add(leftWall);
        this.walls.push(leftWall);

        // 右壁 (X = wallMaxX、Y-Z平面)
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(wallD, wallH),
            wallMat.clone()
        );
        rightWall.position.set(wallMaxX, 0, wallMinZ + wallD / 2);
        rightWall.rotation.y = -Math.PI / 2;
        this.scene.add(rightWall);
        this.walls.push(rightWall);

        // 上壁 (Y = wallMaxY、X-Z平面)
        const topWall = new THREE.Mesh(
            new THREE.PlaneGeometry(wallW, wallD),
            wallMat.clone()
        );
        topWall.position.set(0, wallMaxY, wallMinZ + wallD / 2);
        topWall.rotation.x = -Math.PI / 2;
        this.scene.add(topWall);
        this.walls.push(topWall);

        // 下壁 (Y = wallMinY、X-Z平面)
        const bottomWall = new THREE.Mesh(
            new THREE.PlaneGeometry(wallW, wallD),
            wallMat.clone()
        );
        bottomWall.position.set(0, wallMinY, wallMinZ + wallD / 2);
        bottomWall.rotation.x = Math.PI / 2;
        this.scene.add(bottomWall);
        this.walls.push(bottomWall);

        // 壁の縁に明るいラインを貼る（壁が目立つように）
        const edgeMat = new THREE.MeshBasicMaterial({ color: 0x8888cc, transparent: true, opacity: 0.5 });

        // 奥の壁の縁
        const edgeGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(wallW, wallH));
        const backEdge = new THREE.LineSegments(edgeGeo, edgeMat);
        backEdge.position.set(0, 0, wallMinZ);
        this.scene.add(backEdge);
    }

    getBounds() {
        return {
            minX: this.wallMinX,
            maxX: this.wallMaxX,
            minY: this.wallMinY,
            maxY: this.wallMaxY,
            minZ: this.wallMinZ,
            maxZ: Infinity
        };
    }

    checkCollision(ball) {
        return false;
    }
}