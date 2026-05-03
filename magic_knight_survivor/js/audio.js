// 効果音・BGMマネージャー — Web Audio APIで生成する（外部ファイル不要）
export class AudioManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.enabled = true;
        this.bgmPlaying = false;
        this.bgmNodes = [];
    }

    // 初回ユーザー操作時に初期化
    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
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

    // BGM開始 — ファンタジー風のループBGM
    startBGM() {
        if (!this.enabled || !this.ctx || this.bgmPlaying) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.stopBGM();

        this.bgmPlaying = true;

        // シンプルなループBGM — パッド＋メロディ
        const loopDuration = 8; // 8秒ループ

        // パッド（ベース）
        const padGain = this.ctx.createGain();
        padGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        padGain.connect(this.ctx.destination);
        this.bgmNodes.push(padGain);

        const padNotes = [130.81, 164.81, 196.00, 261.63]; // C3, E3, G3, C4
        padNotes.forEach((freq) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            osc.connect(padGain);
            osc.start(this.ctx.currentTime);
            this.bgmNodes.push(osc);
        });

        // メロディループ
        const melodyGain = this.ctx.createGain();
        melodyGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        melodyGain.connect(this.ctx.destination);
        this.bgmNodes.push(melodyGain);

        // メロディパターン（8小節）
        const melodyPattern = [
            { freq: 523.25, dur: 0.5 }, // C5
            { freq: 587.33, dur: 0.5 }, // D5
            { freq: 659.25, dur: 0.5 }, // E5
            { freq: 523.25, dur: 0.5 }, // C5
            { freq: 783.99, dur: 0.5 }, // G5
            { freq: 659.25, dur: 0.5 }, // E5
            { freq: 587.33, dur: 1.0 }, // D5
            { freq: 523.25, dur: 1.0 }, // C5
            { freq: 493.88, dur: 0.5 }, // B4
            { freq: 523.25, dur: 0.5 }, // C5
            { freq: 587.33, dur: 0.5 }, // D5
            { freq: 659.25, dur: 0.5 }, // E5
            { freq: 783.99, dur: 0.5 }, // G5
            { freq: 659.25, dur: 0.5 }, // E5
            { freq: 587.33, dur: 0.5 }, // D5
            { freq: 523.25, dur: 0.5 }, // C5
        ];

        const scheduleMelodyLoop = (startTime) => {
            if (!this.bgmPlaying) return;

            let time = startTime;
            melodyPattern.forEach((note) => {
                const osc = this.ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(note.freq, time);

                const noteGain = this.ctx.createGain();
                noteGain.gain.setValueAtTime(0, time);
                noteGain.gain.linearRampToValueAtTime(0.06, time + 0.02);
                noteGain.gain.exponentialRampToValueAtTime(0.001, time + note.dur * 0.9);

                osc.connect(noteGain);
                noteGain.connect(this.ctx.destination);

                osc.start(time);
                osc.stop(time + note.dur);
                time += note.dur;
            });

            // 次のループをスケジュール
            const nextLoopTime = startTime + loopDuration;
            if (this.bgmPlaying) {
                this.bgmLoopTimeout = setTimeout(() => scheduleMelodyLoop(nextLoopTime), (nextLoopTime - this.ctx.currentTime) * 1000 - 100);
            }
        };

        scheduleMelodyLoop(this.ctx.currentTime);
    }

    // BGM停止
    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmLoopTimeout) {
            clearTimeout(this.bgmLoopTimeout);
            this.bgmLoopTimeout = null;
        }
        this.bgmNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                node.disconnect();
            } catch (e) {}
        });
        this.bgmNodes = [];
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

        // ノイズ風 — 短めの低い音
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