export class HUD {
    constructor(canvas) {
        this.canvas = canvas;
        this.wave = 1;
        this.showBossHp = false;
        this.bossHpPercent = 1;
        this.waveClearTimer = 0;
        this.waveClearText = '';
    }
    draw(ctx, game) {
        if(!game||!game.player) return;
        const p=game.player;
        const timeLeft = game.timeLeft || 60;
        ctx.fillStyle='#ffffff';ctx.font='bold 14px sans-serif';ctx.textAlign='left';
        ctx.fillText(`SCORE: ${game.enemies?game.enemies.getScore():0}`,10,25);
        ctx.textAlign='right';ctx.fillText(`WAVE ${this.wave}`,this.canvas.width-10,25);
        if(!this.showBossHp){ctx.textAlign='center';ctx.fillStyle='#88ff88';ctx.fillText(`${Math.ceil(timeLeft)}s`,this.canvas.width/2,25);}
        ctx.textAlign='left';ctx.fillStyle='#00ccff';ctx.font='12px sans-serif';
        let lives='';for(let i=0;i<p.hp;i++) lives+='✦ ';ctx.fillText(lives,10,45);
        const barW=this.canvas.width-20,barH=6,barY=52;
        ctx.fillStyle='#333333';ctx.fillRect(10,barY,barW,barH);
        ctx.fillStyle='#44ffaa';ctx.fillRect(10,barY,barW*(p.exp/p.expToNext),barH);
        ctx.strokeStyle='#555555';ctx.lineWidth=1;ctx.strokeRect(10,barY,barW,barH);
        ctx.fillStyle='#44ffaa';ctx.font='10px sans-serif';ctx.textAlign='left';
        ctx.fillText(`Lv.${p.level}`,10,barY+barH+12);
        if(game.weapons){
            let y=barY+barH+26;ctx.font='9px sans-serif';
            const main=game.weapons.getMainWeapon();
            if(main){const n={normalShot:'バルカン',laser:'レーザー',tripleShot:'トリプル',yoyo:'ヨーヨー'};ctx.fillStyle='#44aaff';ctx.fillText(`${n[main.type]||main.type} Lv.${main.level}`,10,y);y+=11;}
            const subs=game.weapons.getSubWeapons();
            if(subs){const n={sideWave:'サイドウェーブ',homing:'ホーミング',cutter:'カッター',sideBarrier:'バリア'};for(const[id,lvl]of subs){ctx.fillStyle='#44ff44';ctx.fillText(`${n[id]||id} Lv.${lvl}`,10,y);y+=11;}}
            if(game.buffs){const buffs=game.buffs.getEquippedBuffs();const n={fireRateUp:'射速',damageUp:'攻撃',speedUp:'速度',shield:'シールド'};for(const b of buffs){ctx.fillStyle='#ffcc00';ctx.fillText(`${n[b.type]||b.type} Lv.${b.level}`,10,y);y+=11;}}
        }
        if(this.showBossHp){
            const bw=this.canvas.width*0.5,bh=8,by=72;
            const bx=(this.canvas.width-bw)/2;
            ctx.fillStyle='#333333';ctx.fillRect(bx,by,bw,bh);
            ctx.fillStyle='#ff4444';ctx.fillRect(bx,by,bw*this.bossHpPercent,bh);
            ctx.strokeStyle='#880000';ctx.lineWidth=1;ctx.strokeRect(bx,by,bw,bh);
            ctx.fillStyle='#ff8888';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
            ctx.fillText('BOSS',this.canvas.width/2,by-3);
        }
        if(this.waveClearTimer>0){
            ctx.globalAlpha=Math.min(1,this.waveClearTimer);
            ctx.fillStyle='#ffff00';ctx.font='bold 24px sans-serif';ctx.textAlign='center';
            ctx.fillText(this.waveClearText,this.canvas.width/2,this.canvas.height/2);
            ctx.globalAlpha=1;
        }
    }
    update(dt) { if(this.waveClearTimer>0) this.waveClearTimer-=dt; }
}
