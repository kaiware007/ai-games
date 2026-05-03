// 効果音・BGMマネージャー — 効果音はWeb Audio API、BGMはファイル再生
export class AudioManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.enabled = true;
        this.bgmPlaying = false;
        this.bgmElement = null;
    }

    // 初回ユーザー操作時に初期化
    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;

            // BGMオーディオ要素を作成
            this.bgmElement = new Audio('assets/bgm.m4a');
            this.bgmElement.loop = true;
            this.bgmElement.volume = 0.3;
        } catch (e) {
            this.enabled = false;
        }
    }

    // 短めの音波を生成して再生するヘルパー
    playTone(frequency, duration, type = 'sine', volume = 0.15) {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    // BGM開始 — ファイルからループ再生
    startBGM() {
        if (!this.enabled || !this.bgmElement || this.bgmPlaying) return;
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        this.stopBGM();

        this.bgmPlaying = true;
        this.bgmElement.play().catch(e => {
            console.log('BGM再生失敗:', e);
        });
    }

    // BGM停止
    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmElement) {
            this.bgmElement.pause();
            this.bgmElement.currentTime = 0;
        }
    }

    // レベルUP音 — 上昇するチャイム
    playLevelUp() {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + i * 0.1 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + i * 0.1);
            osc.stop(this.ctx.currentTime + i * 0.1 + 0.3);
        });
    }

    // 敵撃破音 — 小さな爆発
    playHit() {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.playTone(150, 0.1, 'square', 0.08);
        this.playTone(80, 0.15, 'sawtooth', 0.05);
    }

    // アイテム回収音 — ピンッ
    playCollect() {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.playTone(880, 0.08, 'sine', 0.1);
        this.playTone(1320, 0.12, 'sine', 0.08);
    }

    // ダメージ音 — 低い衝撃
    playDamage() {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.playTone(100, 0.2, 'sawtooth', 0.12);
        this.playTone(60, 0.3, 'square', 0.06);
    }

    // ゲームクリア音 — 勝利ファンファーレ風
    playGameClear() {
        this.stopBGM();
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const notes = [523, 659, 784, 1047, 784, 1047];
        const durations = [0.15, 0.15, 0.15, 0.3, 0.15, 0.4];
        let offset = 0;
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + offset);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + offset + durations[i]);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + offset);
            osc.stop(this.ctx.currentTime + offset + durations[i]);
            offset += durations[i] * 0.7;
        });
    }

    // ゲームオーバー音 — 下降音
    playGameOver() {
        this.stopBGM();
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const notes = [400, 350, 300, 200];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.2);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime + i * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.2 + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + i * 0.2);
            osc.stop(this.ctx.currentTime + i * 0.2 + 0.3);
        });
    }
}