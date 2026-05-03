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
            volume: 0.3,
        });
    }

    // Howler が管理する AudioContext を返す
    // Howler が iOS アンロック・resume を全て担うため、直接 new AudioContext() しない
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
