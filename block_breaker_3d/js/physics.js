import * as CANNON from 'cannon-es';

// 物理ワールドを管理するクラス
export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        // Z軸が奥行き方向なので、重力は使わない（ブロック崩しなので）
        this.world.gravity.set(0, 0, 0);

        // 衝突ペアの最適化
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;

        // 壁の物理ボディ
        this.wallBodies = [];
        // ブロックの物理ボディ
        this.blockBodies = [];
    }

    // 壁の物理ボディを作成
    createWalls(minX, maxX, minY, maxY, minZ) {
        // 壁の厚み
        const wallThickness = 0.5;

        // 壁の境界値は呼び出し元（game.jsのCONFIG）から渡される
        // 左右 ±3.6, 上下 ±2.25, 奥 -10

        // 奥の壁 (Z = minZ)
        const backWall = new CANNON.Body({
            mass: 0, // 静的
            position: new CANNON.Vec3(0, 0, minZ - wallThickness / 2),
            shape: new CANNON.Box(new CANNON.Vec3(maxX - minX, maxY - minY, wallThickness / 2)),
            material: new CANNON.Material({ friction: 0, restitution: 1.0 })
        });
        this.world.addBody(backWall);
        this.wallBodies.push(backWall);

        // 左壁 (X = minX)
        const leftWall = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(minX - wallThickness / 2, 0, minZ + (0 - minZ) / 2),
            shape: new CANNON.Box(new CANNON.Vec3(wallThickness / 2, maxY - minY, (0 - minZ) / 2)),
            material: new CANNON.Material({ friction: 0, restitution: 1.0 })
        });
        this.world.addBody(leftWall);
        this.wallBodies.push(leftWall);

        // 右壁 (X = maxX)
        const rightWall = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(maxX + wallThickness / 2, 0, minZ + (0 - minZ) / 2),
            shape: new CANNON.Box(new CANNON.Vec3(wallThickness / 2, maxY - minY, (0 - minZ) / 2)),
            material: new CANNON.Material({ friction: 0, restitution: 1.0 })
        });
        this.world.addBody(rightWall);
        this.wallBodies.push(rightWall);

        // 上壁 (Y = maxY)
        const topWall = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0, maxY + wallThickness / 2, minZ + (0 - minZ) / 2),
            shape: new CANNON.Box(new CANNON.Vec3(maxX - minX, wallThickness / 2, (0 - minZ) / 2)),
            material: new CANNON.Material({ friction: 0, restitution: 1.0 })
        });
        this.world.addBody(topWall);
        this.wallBodies.push(topWall);

        // 下壁 (Y = minY)
        const bottomWall = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0, minY - wallThickness / 2, minZ + (0 - minZ) / 2),
            shape: new CANNON.Box(new CANNON.Vec3(maxX - minX, wallThickness / 2, (0 - minZ) / 2)),
            material: new CANNON.Material({ friction: 0, restitution: 1.0 })
        });
        this.world.addBody(bottomWall);
        this.wallBodies.push(bottomWall);
    }

    // パドルの物理ボディを作成（キネマティック）
    createPaddle(width, height, depth, x, y, z) {
        const paddleBody = new CANNON.Body({
            mass: 0, // キネマティック（手動で位置更新）
            type: CANNON.Body.KINEMATIC,
            position: new CANNON.Vec3(x, y, z),
            shape: new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)),
            material: new CANNON.Material({ friction: 0, restitution: 1.0 })
        });
        this.world.addBody(paddleBody);
        return paddleBody;
    }

    // ボールの物理ボディを作成（ダイナミック）
    createBall(radius, x, y, z) {
        const ballBody = new CANNON.Body({
            mass: 1, // ダイナミック
            position: new CANNON.Vec3(x, y, z),
            shape: new CANNON.Sphere(radius),
            material: new CANNON.Material({ friction: 0, restitution: 1.0 }),
            linearDamping: 0, // 減衰なし
            angularDamping: 0
        });
        // 回転を制限（ボールは回転させない）
        ballBody.fixedRotation = true;
        this.world.addBody(ballBody);
        return ballBody;
    }

    // ブロックの物理ボディを作成（静的→衝突後に削除）
    createBlock(width, height, depth, x, y, z) {
        const blockBody = new CANNON.Body({
            mass: 0, // 静的
            position: new CANNON.Vec3(x, y, z),
            shape: new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)),
            material: new CANNON.Material({ friction: 0, restitution: 1.0 })
        });
        this.world.addBody(blockBody);
        this.blockBodies.push(blockBody);
        return blockBody;
    }

    // ブロックを削除
    removeBlock(body) {
        this.world.removeBody(body);
        const index = this.blockBodies.indexOf(body);
        if (index >= 0) {
            this.blockBodies.splice(index, 1);
        }
    }

    // 全ブロックを削除
    clearBlocks() {
        for (const body of this.blockBodies) {
            this.world.removeBody(body);
        }
        this.blockBodies = [];
    }

    // 物理ステップ（dtで進める）
    step(dt) {
        // 固定タイムステップで進める
        this.world.step(1 / 60, dt, 3);
    }

    // 全物理ボディを削除（リセット用）
    clear() {
        // 壁は削除しない
        for (const body of this.blockBodies) {
            this.world.removeBody(body);
        }
        this.blockBodies = [];
    }
}