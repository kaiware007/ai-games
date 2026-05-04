// 音声マネージャー — BGM は Howler.js、SFX は Howler.ctx 経由の OscillatorNode
export class AudioManager {
    constructor() {
        this.bgm = null;
        this.bgmPlaying = false;
    }

    init() {
        if (this.bgm) return;
        this.bgm = new Howl({
            src: ['assets/bgm.m4a'],
            loop: true,
            volume: 0.1,
        });
    }

    // Howler が管理する AudioContext を返す
    _ctx() {
        return (typeof Howler !== 'undefined' && Howler.ctx) ? Howler.ctx : null;
    }

    // ctx が running になってから fn を実行する
    _ready(fn) {
        const ctx = this._ctx();
        if (!ctx) return;
        if (ctx.state === 'running') {
            fn();
        } else {
            ctx.resume().then(fn).catch(() => {});
        }
    }

    playTone(frequency, duration, type = 'sine', volume = 0.15) {
        this._ready(() => {
            const ctx = this._ctx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        });
    }

    startBGM() {
        if (!this.bgm || this.bgmPlaying) return;
        this.bgmPlaying = true;
        this.bgm.play();
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgm) this.bgm.stop();
    }

    playLevelUp() {
        this._ready(() => {
            const ctx = this._ctx();
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
                gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
                gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.1 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.1);
                osc.stop(ctx.currentTime + i * 0.1 + 0.3);
            });
        });
    }

    playHit() {
        this.playTone(150, 0.1, 'square', 0.08);
        this.playTone(80, 0.15, 'sawtooth', 0.05);
    }

    playCollect() {
        this.playTone(880, 0.08, 'sine', 0.1);
        this.playTone(1320, 0.12, 'sine', 0.08);
    }

    playDamage() {
        this.playTone(100, 0.2, 'sawtooth', 0.12);
        this.playTone(60, 0.3, 'square', 0.06);
    }

    // ボス出現時の効果音（低いドラム＋不気味な音）
    playBossSpawned() {
        this._ready(() => {
            const ctx = this._ctx();
            // ドラムのような低音
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(80, ctx.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.5);
            gain1.gain.setValueAtTime(0.2, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.5);

            // 不気味な音
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(200, ctx.currentTime);
            osc2.frequency.linearRampToValueAtTime(100, ctx.currentTime + 1.0);
            gain2.gain.setValueAtTime(0.08, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 1.0);
        });
    }

    // ボス撃破時の効果音（派手なファンファーレ）
    playBossDefeated() {
        this._ready(() => {
            const ctx = this._ctx();
            const notes = [523, 659, 784, 1047, 1319, 1568];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
                gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.08);
                osc.stop(ctx.currentTime + i * 0.08 + 0.3);
            });

            // 低音エフェクト
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.8);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.8);
        });
    }

    playGameClear() {
        this.stopBGM();
        this._ready(() => {
            const ctx = this._ctx();
            const notes = [523, 659, 784, 1047, 784, 1047];
            const durations = [0.15, 0.15, 0.15, 0.3, 0.15, 0.4];
            let offset = 0;
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + offset);
                gain.gain.setValueAtTime(0.1, ctx.currentTime + offset);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + durations[i]);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + offset);
                osc.stop(ctx.currentTime + offset + durations[i]);
                offset += durations[i] * 0.7;
            });
        });
    }

    playGameOver() {
        this.stopBGM();
        this._ready(() => {
            const ctx = this._ctx();
            const notes = [400, 350, 300, 200];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
                gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.2);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.2);
                osc.stop(ctx.currentTime + i * 0.2 + 0.3);
            });
        });
    }
}