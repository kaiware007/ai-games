import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { InputManager } from './input.js?v=1781692866';
import { Paddle } from './paddle.js?v=1781692866';
import { Ball } from './ball.js?v=1781692866';
import { BlockManager } from './blocks.js?v=1781692866';
import { WallManager } from './walls.js?v=1781692866';
import { HUD } from './hud.js?v=1781692866';
import { PhysicsWorld } from './physics.js?v=1781692866';

const CONFIG = {
    paddleWidth: 1.5,
    paddleHeight: 1.5,
    paddleDepth: 0.15,
    paddleZ: 1,
    ballRadius: 0.2,
    ballSpeed: 6,
    blockRows: 4,
    blockCols: 8,
    blockDepth: 3,
    blockWidth: 0.8,
    blockHeight: 0.4,
    blockDepthSize: 0.4,
    cameraZ: 5,
    maxLives: 3,
    aspectRatio: 16 / 9,
    // 壁の境界（1割狭く）
    wallMinX: -3.6,
    wallMaxX: 3.6,
    wallMinY: -2.25,
    wallMaxY: 2.25,
    wallMinZ: -10
};

export class Game {
    constructor(canvas, hudContainer) {
        this.canvas = canvas;
        this.state = 'title';
        this.lives = CONFIG.maxLives;
        this.score = 0;

        // Three.jsシーン
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111122);

        // カメラのaspectを16:9に固定
        this.camera = new THREE.PerspectiveCamera(60, CONFIG.aspectRatio, 0.1, 100);
        this.camera.position.set(0, 0, CONFIG.cameraZ);
        this.camera.lookAt(0, 0, -5);

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(canvas.width, canvas.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // 照明設定
        const ambient = new THREE.AmbientLight(0x666666, 1.0);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 5, 5);
        this.scene.add(dirLight);

        const spotLight = new THREE.SpotLight(0xffffff, 30, 30, Math.PI / 4, 0.5);
        spotLight.position.set(0, 8, 5);
        spotLight.target.position.set(0, 0, -5);
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);

        const pointLight = new THREE.PointLight(0x8888ff, 15, 25);
        pointLight.position.set(0, 3, -5);
        this.scene.add(pointLight);

        // 物理ワールド
        this.physics = new PhysicsWorld();
        // 壁の物理ボディを作成
        this.physics.createWalls(CONFIG.wallMinX, CONFIG.wallMaxX, CONFIG.wallMinY, CONFIG.wallMaxY, CONFIG.wallMinZ);

        this.input = new InputManager(canvas);
        this.paddle = new Paddle(this.scene, CONFIG);
        this.ball = new Ball(this.scene, CONFIG);
        this.blocks = new BlockManager(this.scene, CONFIG);
        this.walls = new WallManager(this.scene, CONFIG);
        this.hud = new HUD(hudContainer);

        this.setupButtons();
        this.showTitle();

        this.lastTime = 0;
        requestAnimationFrame((t) => this.loop(t));
    }

    setupButtons() {
        const self = this;
        this.hud.buttons.start.addEventListener('click', () => self.startGame());
        this.hud.buttons.help.addEventListener('click', () => {
            self.hud.showMessage('操作方法', 'マウスまたは指でパドルを動かして<br>ボールを反射させてブロックを壊そう！');
        });
    }

    showTitle() {
        this.state = 'title';
        this.hud.showTitle();
        this.hud.hideMessage();
    }

    startGame() {
        this.lives = CONFIG.maxLives;
        this.score = 0;
        this.state = 'playing';
        this.hud.hideTitle();
        this.hud.reset();
        this.blocks.reset();
        this.paddle.reset();
        this.ball.reset();

        // 物理ボディを再作成
        this.physics.clear();
        this.createPhysicsBodies();

        // 物理ボディ作成後にボールをアクティブにする
        // （物理ボディがない状態でactivateすると衝突がおきる）
        this.ball.activate();
        // ボールの物理ボディに速度を設定
        if (this.ballBody) {
            this.ballBody.velocity.set(
                this.ball.velocity.x,
                this.ball.velocity.y,
                this.ball.velocity.z
            );
        }
    }

    // 物理ボディを作成
    createPhysicsBodies() {
        // パドルの物理ボディ
        this.paddleBody = this.physics.createPaddle(
            CONFIG.paddleWidth, CONFIG.paddleHeight, CONFIG.paddleDepth,
            0, 0, CONFIG.paddleZ
        );

        // ボールの物理ボディ
        this.ballBody = this.physics.createBall(
            CONFIG.ballRadius, 0, 0, CONFIG.paddleZ
        );

        // ブロックの物理ボディ
        const activeBlocks = this.blocks.getActiveBlocks();
        for (const block of activeBlocks) {
            const body = this.physics.createBlock(
                CONFIG.blockWidth, CONFIG.blockHeight, CONFIG.blockDepthSize,
                block.mesh.position.x, block.mesh.position.y, block.mesh.position.z
            );
            // 衝突イベントを登録
            const self = this;
            body.addEventListener('collide', (e) => {
                // ボールと衝突した場合のみ処理
                if (e.body === self.ballBody) {
                    // 衝突したブロックを特定して破壊
                    self.handleBlockCollision(body);
                }
            });
            // ボディにブロックのメッシュ情報を保存
            body.blockData = block;
        }
    }

    // ブロック衝突処理
    handleBlockCollision(blockBody) {
        if (!blockBody.blockData || !blockBody.blockData.active) return;

        // ブロックを破壊
        const index = this.blocks.blocks.indexOf(blockBody.blockData);
        if (index >= 0) {
            this.blocks.destroyBlock(index);
        }

        // 物理ボディも削除
        this.physics.removeBlock(blockBody);
        blockBody.blockData = null;
    }

    resetGame() {
        this.startGame();
    }

    goTitle() {
        this.showTitle();
    }

    handleBallLoss() {
        this.lives--;
        this.hud.setLives(this.lives);
        if (this.lives <= 0) {
            this.state = 'gameover';
            this.ball.reset();
            this.hud.showGameOver();
            this.setupRestartButtons();
        } else {
            this.ball.reset();
            // ボールの物理ボディをリセット
            if (this.ballBody) {
                this.ballBody.position.set(0, 0, CONFIG.paddleZ);
                this.ballBody.velocity.set(0, 0, 0);
                this.ballBody.angularVelocity.set(0, 0, 0);
            }
            setTimeout(() => {
                if (this.state === 'playing') {
                    this.ball.activate();
                    // ボールに速度を物理エンジンに設定
                    if (this.ballBody) {
                        this.ballBody.velocity.set(
                            this.ball.velocity.x,
                            this.ball.velocity.y,
                            this.ball.velocity.z
                        );
                    }
                }
            }, 1000);
        }
    }

    handleClear() {
        this.state = 'clear';
        this.ball.reset();
        this.hud.showClear();
        this.setupRestartButtons();
    }

    setupRestartButtons() {
        const self = this;
        const restart = this.hud.buttons.restart;
        const title = this.hud.buttons.title;
        if (restart) restart.addEventListener('click', () => self.resetGame());
        if (title) title.addEventListener('click', () => self.goTitle());
    }

    loop(timestamp) {
        requestAnimationFrame((t) => this.loop(t));
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        this.input.update();

        if (this.state === 'playing') {
            // パドル更新
            this.paddle.update(this.input, this.camera);

            // パドルの物理ボディ位置を同期
            if (this.paddleBody) {
                this.paddleBody.position.set(
                    this.paddle.mesh.position.x,
                    this.paddle.mesh.position.y,
                    this.paddle.mesh.position.z
                );
            }

            // 物理ステップ
            this.physics.step(dt);

            // ボールの位置・速度を物理エンジンから取得
            if (this.ballBody && this.ball.isActive()) {
                // 物理エンジンの位置をThree.jsメッシュに同期
                this.ball.mesh.position.copy(this.ballBody.position);

                // 物理エンジンの速度をBallクラスに同期
                this.ball.velocity.set(
                    this.ballBody.velocity.x,
                    this.ballBody.velocity.y,
                    this.ballBody.velocity.z
                );

                // パドルとの衝突処理（ボールがパドルに当たった時に角度反射）
                this.handlePaddleCollision();

                // ボール速度の正規化（エネルギー減衰防止）
                this.normalizeBallSpeed();

                // ボールがパドルより手前に来たらミス
                if (this.ballBody.position.z > CONFIG.paddleZ + 2) {
                    this.handleBallLoss();
                }
            }

            this.hud.setScore(this.blocks.getScore());

            if (this.blocks.isCleared()) {
                this.handleClear();
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    // パドルとの衝突処理（パドル中心からの角度で反射方向を変える）
    handlePaddleCollision() {
        if (!this.ballBody || !this.paddleBody || !this.ball.isActive()) return;

        const ballPos = this.ballBody.position;
        const paddlePos = this.paddleBody.position;
        const paddleHalfW = CONFIG.paddleWidth / 2;
        const paddleHalfH = CONFIG.paddleHeight / 2;
        const ballR = CONFIG.ballRadius;

        // ボールがパドルのZ方向の範囲内かチェック（パドルの奥側面付近のみ）
        const paddleBackZ = paddlePos.z - CONFIG.paddleDepth / 2;
        const zDiff = ballPos.z - paddleBackZ;
        if (zDiff > ballR * 1.5) return;
        if (zDiff < -ballR) return;

        // ボールがパドルのX-Y範囲内か
        const dx = Math.abs(ballPos.x - paddlePos.x);
        const dy = Math.abs(ballPos.y - paddlePos.y);
        if (dx > paddleHalfW + ballR || dy > paddleHalfH + ballR) return;

        // ボールがパドルの奥側（Zが小さい方）から来ているか（速度が正=手前向き）
        if (this.ballBody.velocity.z >= 0) return;

        // パドル中心からの相対位置で反射角度を計算
        const relX = (ballPos.x - paddlePos.x) / paddleHalfW; // -1〜1
        const relY = (ballPos.y - paddlePos.y) / paddleHalfH; // -1〜1

        const speed = CONFIG.ballSpeed;
        const maxAngle = Math.PI / 3; // 最大60度

        // X方向の反射角度
        const angleX = relX * maxAngle;
        // Y方向の反射角度
        const angleY = relY * maxAngle * 0.5;

        // 反射速度を設定（Zは必ず奥方向へ）
        this.ballBody.velocity.set(
            Math.sin(angleX) * speed,
            Math.sin(angleY) * speed,
            -Math.cos(angleX) * Math.cos(angleY) * speed
        );

        // ボールをパドルから押し出す（めり込み防止）
        this.ballBody.position.z = paddlePos.z - CONFIG.paddleDepth / 2 - ballR - 0.01;
    }

    // ボール速度の正規化（目標速度に維持）
    normalizeBallSpeed() {
        if (!this.ballBody || !this.ball.isActive()) return;

        const speed = this.ballBody.velocity.length();
        const targetSpeed = CONFIG.ballSpeed;
        const tolerance = 0.5;

        // 速度が目標から外れていたら正規化
        if (Math.abs(speed - targetSpeed) > tolerance) {
            const currentVelocity = this.ballBody.velocity;
            if (speed > 0) {
                currentVelocity.scale(targetSpeed / speed, currentVelocity);
            }
        }
    }
}