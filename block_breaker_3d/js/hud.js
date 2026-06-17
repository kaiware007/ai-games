export class HUD {
    constructor(hudContainer) {
        this.container = hudContainer;
        this.scoreEl = null;
        this.livesEl = null;
        this.messageEl = null;
        this.titleEl = null;
        this.buttons = {};
        this.setup();
    }

    setup() {
        this.container.innerHTML = '';

        this.scoreEl = document.createElement('div');
        this.scoreEl.className = 'hud-score';
        this.scoreEl.style.cssText = 'position:absolute;top:10px;right:20px;color:#fff;font-size:24px;text-shadow:2px 2px 4px #000;';
        this.scoreEl.textContent = 'Score: 0';
        this.container.appendChild(this.scoreEl);

        this.livesEl = document.createElement('div');
        this.livesEl.className = 'hud-lives';
        this.livesEl.style.cssText = 'position:absolute;top:10px;left:20px;color:#fff;font-size:24px;text-shadow:2px 2px 4px #000;';
        this.livesEl.textContent = 'Balls: 3';
        this.container.appendChild(this.livesEl);

        this.messageEl = document.createElement('div');
        this.messageEl.className = 'hud-message';
        this.messageEl.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:48px;text-align:center;text-shadow:2px 2px 8px #000;display:none;';
        this.container.appendChild(this.messageEl);

        this.titleEl = document.createElement('div');
        this.titleEl.className = 'hud-title';
        this.titleEl.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;display:none;';
        this.titleEl.innerHTML = `
            <div style="color:#4488ff;font-size:64px;font-weight:bold;text-shadow:3px 3px 10px #000;margin-bottom:40px;">3Dブロック崩し</div>
            <div style="color:#aaa;font-size:16px;margin-bottom:40px;">v1.0.0</div>
            <button id="btn-start" style="pointer-events:auto;padding:15px 40px;font-size:24px;background:#4488ff;color:#fff;border:none;border-radius:8px;cursor:pointer;margin:10px;">スタート</button>
            <button id="btn-help" style="pointer-events:auto;padding:15px 40px;font-size:24px;background:#888;color:#fff;border:none;border-radius:8px;cursor:pointer;margin:10px;">説明</button>
        `;
        this.container.appendChild(this.titleEl);

        const btnStart = this.titleEl.querySelector('#btn-start');
        const btnHelp = this.titleEl.querySelector('#btn-help');
        this.buttons.start = btnStart;
        this.buttons.help = btnHelp;
        this.buttons.restart = null;
        this.buttons.title = null;
    }

    setScore(n) { this.scoreEl.textContent = `Score: ${n}`; }
    setLives(n) { this.livesEl.textContent = `Balls: ${n}`; }

    showMessage(text, subtext) {
        this.titleEl.style.display = 'none';
        this.messageEl.style.display = 'block';
        this.messageEl.innerHTML = `<div>${text}</div>${subtext ? `<div style="font-size:24px;margin-top:20px;">${subtext}</div>` : ''}`;
    }

    hideMessage() { this.messageEl.style.display = 'none'; }

    showTitle() {
        this.titleEl.style.display = 'block';
        this.scoreEl.style.display = 'none';
        this.livesEl.style.display = 'none';
        this.messageEl.style.display = 'none';
    }

    hideTitle() {
        this.titleEl.style.display = 'none';
        this.scoreEl.style.display = 'block';
        this.livesEl.style.display = 'block';
    }

    showGameOver() {
        this.showMessage('ゲームオーバー', `
            <button id="btn-restart" style="pointer-events:auto;padding:15px 40px;font-size:24px;background:#ff4444;color:#fff;border:none;border-radius:8px;cursor:pointer;margin:10px;">リスタート</button>
            <button id="btn-title" style="pointer-events:auto;padding:15px 40px;font-size:24px;background:#888;color:#fff;border:none;border-radius:8px;cursor:pointer;margin:10px;">タイトルへ</button>
        `);
        this.buttons.restart = this.messageEl.querySelector('#btn-restart');
        this.buttons.title = this.messageEl.querySelector('#btn-title');
    }

    showClear() {
        this.showMessage('ステージクリア！', `
            <div style="font-size:24px;margin-bottom:20px;">Score: ${this.scoreEl.textContent}</div>
            <button id="btn-restart" style="pointer-events:auto;padding:15px 40px;font-size:24px;background:#44ff44;color:#fff;border:none;border-radius:8px;cursor:pointer;margin:10px;">リスタート</button>
            <button id="btn-title" style="pointer-events:auto;padding:15px 40px;font-size:24px;background:#888;color:#fff;border:none;border-radius:8px;cursor:pointer;margin:10px;">タイトルへ</button>
        `);
        this.buttons.restart = this.messageEl.querySelector('#btn-restart');
        this.buttons.title = this.messageEl.querySelector('#btn-title');
    }

    reset() {
        this.hideMessage();
        this.hideTitle();
        this.setScore(0);
        this.setLives(3);
    }
}