// 入力管理クラス（キーボード＋タッチ対応）
export class InputManager {
    constructor() {
        this.keys = {};
        this.touchLeft = false;
        this.touchRight = false;
        this.touchFire = false;
        this.fired = false; // フレーム内で発射トリガーが発火したか

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                this.fired = true;
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // タッチ対応 — 各タッチを個別に管理
        window.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                this.handleTouchStart(touch);
            }
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                this.handleTouchEnd(touch);
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                this.handleTouchMove(touch);
            }
        }, { passive: false });

        // タッチの追跡用マップ
        this.touchMap = new Map();
    }

    handleTouchStart(touch) {
        const x = touch.clientX;
        const w = window.innerWidth;
        const id = touch.identifier;

        if (x < w * 0.3) {
            this.touchMap.set(id, 'left');
            this.touchLeft = true;
        } else if (x > w * 0.7) {
            this.touchMap.set(id, 'right');
            this.touchRight = true;
        } else {
            this.touchMap.set(id, 'fire');
            this.touchFire = true;
            this.fired = true;
        }
    }

    handleTouchEnd(touch) {
        const id = touch.identifier;
        const type = this.touchMap.get(id);
        this.touchMap.delete(id);

        if (type === 'left') this.touchLeft = false;
        if (type === 'right') this.touchRight = false;
        if (type === 'fire') this.touchFire = false;

        // 他のタッチが同じ役割を持ってるか確認
        this.recheckTouches();
    }

    handleTouchMove(touch) {
        const x = touch.clientX;
        const w = window.innerWidth;
        const id = touch.identifier;
        const oldType = this.touchMap.get(id);

        let newType;
        if (x < w * 0.3) newType = 'left';
        else if (x > w * 0.7) newType = 'right';
        else newType = 'fire';

        if (oldType !== newType) {
            // 古いタイプのフラグを他のタッチがあるか確認して更新
            this.touchMap.set(id, newType);
            this.recheckTouches();
        }
    }

    recheckTouches() {
        // 現在のtouchMapからフラグを再計算
        this.touchLeft = false;
        this.touchRight = false;
        this.touchFire = false;

        for (const type of this.touchMap.values()) {
            if (type === 'left') this.touchLeft = true;
            if (type === 'right') this.touchRight = true;
            if (type === 'fire') this.touchFire = true;
        }
    }

    isLeft() {
        return this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touchLeft;
    }

    isRight() {
        return this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchRight;
    }

    isFire() {
        return this.keys['Space'] || this.touchFire;
    }

    consumeFire() {
        if (this.fired) {
            this.fired = false;
            return true;
        }
        return false;
    }

    resetFire() {
        this.fired = false;
    }
}
