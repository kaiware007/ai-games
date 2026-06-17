export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        // 絶対位置（マウス用）
        this.normX = 0;
        this.normY = 0;
        // 相対移動差分（スマホタッチ用）
        this.deltaX = 0;
        this.deltaY = 0;
        // タッチモードフラグ
        this.isTouch = false;
        // 前フレームのタッチ位置
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        // タッチ中に移動した累積量（指を離しても保持）
        this.touchMovedX = 0;
        this.touchMovedY = 0;
        // タッチ開始時に累積値を保持するためのフラグ
        this.touchInitialized = false;
        this.setupEvents();
    }

    setupEvents() {
        // マウス移動 — 絶対位置
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isTouch) return;
            const rect = this.canvas.getBoundingClientRect();
            this.normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        });

        // タッチ開始 — 最初のタッチ時は累積値をタッチ位置に合わせて初期化
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.isTouch = true;
            this.lastTouchX = touch.clientX;
            this.lastTouchY = touch.clientY;

            // 初めてのタッチなら、タッチ位置を基準にして累積値を初期化
            // 2回目以降のタッチは、指を離した時の位置を保持したままスライド差分を加算
            if (!this.touchInitialized) {
                this.touchMovedX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
                this.touchMovedY = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
                this.touchInitialized = true;
            }
            // touchInitialized=true なら touchMovedX/Y をそのまま使う（その場に留まる）
        }, { passive: false });

        // タッチ移動 — 前フレームからの差分を累積する相対移動
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.isTouch) return;
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();

            // 前のタッチ位置からの差分を計算
            const dx = (touch.clientX - this.lastTouchX) / rect.width;
            const dy = -(touch.clientY - this.lastTouchY) / rect.height;

            // 累積移動量に差分を加算
            this.touchMovedX += dx * 2;
            this.touchMovedY += dy * 2;

            // 現在の位置を次フレーム用に保存
            this.lastTouchX = touch.clientX;
            this.lastTouchY = touch.clientY;
        }, { passive: false });

        // タッチ終了 — 累積値は保持したまま（指を離したらその場に残る）
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isTouch = false;
            // touchMovedX/Y はリセットしない！その場に留まる
        }, { passive: false });

        // ポインターダウン（互換性のため）
        this.canvas.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'touch') return; // touchstart で処理済み
            const rect = this.canvas.getBoundingClientRect();
            this.normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        });
    }

    update() {
        // 毎フレームdeltaをリセット（使わないけど将来拡張用）
        this.deltaX = 0;
        this.deltaY = 0;
    }

    // パドルが使うメソッド — タッチなら累積値、マウスなら絶対位置を返す
    getNormX() {
        return this.touchInitialized ? this.touchMovedX : this.normX;
    }
    getNormY() {
        return this.touchInitialized ? this.touchMovedY : this.normY;
    }

    reset() {
        this.normX = 0;
        this.normY = 0;
        this.touchMovedX = 0;
        this.touchMovedY = 0;
        this.isTouch = false;
        this.touchInitialized = false;
    }
}
