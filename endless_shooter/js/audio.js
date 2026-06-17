export class AudioManager {
    constructor() { this.ctx = null; this.enabled = true; }
    init() {
        if(typeof Howler!=='undefined'&&Howler.ctx) this.ctx=Howler.ctx;
        else try{this.ctx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){this.enabled=false;}
        const resume=()=>{if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume();};
        document.addEventListener('touchstart',resume,{once:true});
        document.addEventListener('mousedown',resume,{once:true});
    }
    _play(freq,dur,type='square',vol=0.1) {
        if(!this.ctx||!this.enabled)return;
        const play=()=>{
            const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();
            osc.type=type;osc.frequency.setValueAtTime(freq,this.ctx.currentTime);
            gain.gain.setValueAtTime(vol,this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+dur);
            osc.connect(gain);gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime);osc.stop(this.ctx.currentTime+dur);
        };
        if(this.ctx.state==='running')play();else this.ctx.resume().then(play).catch(()=>{});
    }
    playExplosion() { this._play(150,0.2,'sawtooth',0.1); }
    playBossAppear() { this._play(100,0.3,'sawtooth',0.12);setTimeout(()=>this._play(80,0.4,'sawtooth',0.12),200); }
    playWaveClear() { this._play(440,0.1,'sine',0.1);setTimeout(()=>this._play(554,0.1,'sine',0.1),100);setTimeout(()=>this._play(659,0.1,'sine',0.1),200);setTimeout(()=>this._play(880,0.2,'sine',0.1),300); }
    playGameOver() { this._play(400,0.2,'square',0.1);setTimeout(()=>this._play(300,0.2,'square',0.1),200);setTimeout(()=>this._play(200,0.4,'square',0.1),400); }
    playSelect() { this._play(600,0.08,'sine',0.08); }
}
