export class Boss {
    constructor(canvas, player) {
        this.canvas = canvas;
        this.player = player;
        this.alive = false;
        this.x = canvas.width / 2;
        this.y = -60;
        this.targetY = 80;
        this.hp = 0;
        this.maxHp = 0;
        this.phase = 0;
        this.patternTimer = 0;
        this.attackTimer = 0;
        this.bullets = [];
        this.wave = 1;
        this.entering = true;
    }
    init(wave) {
        this.wave = wave; this.alive = true;
        this.x = this.canvas.width/2; this.y = -60; this.targetY = 120;
        this.maxHp = 50+wave*20; this.hp = this.maxHp;
        this.phase = 0; this.patternTimer = 0; this.attackTimer = 0;
        this.bullets = []; this.entering = true;
    }
    update(dt) {
        if(!this.alive) return;
        if(this.entering){this.y+=100*dt;if(this.y>=this.targetY){this.y=this.targetY;this.entering=false;}return;}
        this.x = this.canvas.width/2+Math.sin(this.patternTimer*0.8)*100;
        this.patternTimer+=dt; this.attackTimer-=dt;
        if(this.attackTimer<=0) this._choosePattern();
        for(let i=this.bullets.length-1;i>=0;i--){
            const b=this.bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
            if(b.y>660||b.y<-20||b.x<-20||b.x>380||b.life<=0){this.bullets.splice(i,1);continue;}
            if(this.player.alive&&Math.hypot(b.x-this.player.x,b.y-this.player.y)<10+b.size){this.player.takeDamage();this.bullets.splice(i,1);}
        }
    }
    draw(ctx) {
        if(!this.alive) return;
        ctx.save();ctx.translate(this.x,this.y);
        ctx.fillStyle='#cc0000';ctx.shadowColor='#ff0000';ctx.shadowBlur=15;
        ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(-25,10);ctx.lineTo(-15,25);ctx.lineTo(15,25);ctx.lineTo(25,10);ctx.closePath();ctx.fill();
        ctx.shadowBlur=0;ctx.fillStyle='#ffff00';
        ctx.beginPath();ctx.arc(-8,0,4,0,Math.PI*2);ctx.arc(8,0,4,0,Math.PI*2);ctx.fill();
        ctx.restore();
        for(const b of this.bullets){ctx.fillStyle=b.color||'#ff4444';ctx.shadowColor=b.color||'#ff4444';ctx.shadowBlur=6;ctx.beginPath();ctx.arc(b.x,b.y,b.size,0,Math.PI*2);ctx.fill();}
        ctx.shadowBlur=0;
    }
    isAlive() { return this.alive; }
    takeDamage(dmg) { if(!this.alive)return;this.hp-=dmg;if(this.hp<=0){this.hp=0;this.alive=false;} }
    getHpPercent() { return this.maxHp<=0?0:this.hp/this.maxHp; }
    _choosePattern() {
        const patterns=['spread','aimed','spiral','wave'];
        const n=Math.min(patterns.length,1+Math.floor(this.wave/2));
        const p=patterns[Math.floor(Math.random()*n)];
        const bs=120+this.wave*10, bc=Math.min(8,4+this.wave);
        if(p==='spread'){
            for(let i=0;i<bc;i++){const a=(Math.PI*i)/(bc-1)+Math.PI*0.3;this.bullets.push({x:this.x,y:this.y+20,vx:Math.cos(a)*bs,vy:Math.sin(a)*bs,size:5,life:3,color:'#ff4444'});}
            this.attackTimer=1.5-Math.min(0.8,this.wave*0.1);
        } else if(p==='aimed'&&this.player.alive){
            for(let i=-1;i<=1;i++){const dx=this.player.x-this.x,dy=this.player.y-this.y,d=Math.hypot(dx,dy);if(d>0){const a=Math.atan2(dy,dx)+i*0.15;this.bullets.push({x:this.x,y:this.y+20,vx:Math.cos(a)*bs*1.2,vy:Math.sin(a)*bs*1.2,size:5,life:3,color:'#ff8800'});}}
            this.attackTimer=1-Math.min(0.5,this.wave*0.08);
        } else if(p==='spiral'){
            for(let i=0;i<3;i++){const a=this.patternTimer*3+Math.PI*2*i/3;this.bullets.push({x:this.x,y:this.y+20,vx:Math.cos(a)*bs*0.7,vy:Math.sin(a)*bs*0.7,size:4,life:3,color:'#ff44aa'});}
            this.attackTimer=0.15;
        } else {
            for(let i=0;i<bc;i++) this.bullets.push({x:this.x-80+i*(160/(bc-1)),y:this.y+20,vx:0,vy:bs*0.6,size:4,life:3,color:'#44aaff'});
            this.attackTimer=2-Math.min(1,this.wave*0.15);
        }
    }
}
