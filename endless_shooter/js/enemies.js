export class EnemyManager {
    constructor(canvas, player, game) {
        this.canvas = canvas;
        this.player = player;
        this.game = game;
        this.enemies = [];
        this.enemyBullets = [];
        this.score = 0;
        this.spawnTimer = 0;
    }
    update(dt, wave, difficulty) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnWaveEnemies(wave);
            this.spawnTimer = Math.max(0.3, 1.5 - wave * 0.1);
        }
        for (let i = this.enemies.length-1; i>=0; i--) {
            const e = this.enemies[i];
            if (e.hp <= 0) { this.onEnemyKilled(e); this.enemies.splice(i,1); continue; }
            this._updateEnemy(e, dt);
            if (e.y>660||e.y<-50||e.x<-50||e.x>410) this.enemies.splice(i,1);
        }
        for (let i=this.enemyBullets.length-1;i>=0;i--) {
            const b=this.enemyBullets[i];
            b.x+=b.vx*dt; b.y+=b.vy*dt; b.life-=dt;
            if(b.y>660||b.y<-20||b.x<-20||b.x>380||b.life<=0){this.enemyBullets.splice(i,1);continue;}
            if(this.player.alive && Math.hypot(b.x-this.player.x,b.y-this.player.y)<10+b.size){this.player.takeDamage();this.enemyBullets.splice(i,1);}
        }
        if(this.player.alive){
            for(let i=this.enemies.length-1;i>=0;i--){
                const e=this.enemies[i];if(!e.alive)continue;
                if(Math.hypot(e.x-this.player.x,e.y-this.player.y)<e.hitRadius+10){
                    this.player.takeDamage();e.hp=0;this.addScore(e.scoreValue);
                    if(this.game&&this.game.particles)this.game.particles.explode(e.x,e.y,'#ff4444',8);
                    this.enemies.splice(i,1);
                }
            }
        }
    }
    draw(ctx) {
        for(const e of this.enemies){if(!e.alive)continue;this._drawEnemy(ctx,e);}
        for(const b of this.enemyBullets){ctx.fillStyle=b.color||'#ff4444';ctx.shadowColor=b.color||'#ff4444';ctx.shadowBlur=4;ctx.beginPath();ctx.arc(b.x,b.y,b.size,0,Math.PI*2);ctx.fill();}
        ctx.shadowBlur=0;
    }
    spawnWaveEnemies(wave) {
        const types=['straight','sine','shooter','rush','spread'];
        const weights=[0.35,0.25,0.15,0.15,0.1];
        let r=Math.random(),type='straight';
        for(let i=0;i<types.length;i++){r-=weights[i];if(r<=0){type=types[i];break;}}
        
        if(type==='straight') {
            // 直列陣: 3匹〜最大8匹、ウェーブ進行で増える
            const count = Math.min(8, 3 + Math.floor(wave / 2));
            const baseX = 30 + Math.random() * (this.canvas.width - 60);
            for(let i=0; i<count; i++) {
                this.enemies.push({id:Math.random(),type:'straight',x:baseX,y:-20-i*25,hp:this._hp('straight',wave),maxHp:this._hp('straight',wave),size:this._hr('straight'),hitRadius:this._hr('straight'),alive:true,timer:0,phase:Math.random()*Math.PI*2,speed:this._sp('straight',wave),scoreValue:this._sv('straight')});
            }
        } else if(type==='sine') {
            // 隊列: 2匹〜最大7匹、ウェーブ進行で増える
            const count = Math.min(7, 2 + Math.floor(wave / 2));
            const baseY = -20;
            const spacing = 30;
            const startX = (this.canvas.width - (count-1)*spacing) / 2;
            for(let i=0; i<count; i++) {
                this.enemies.push({id:Math.random(),type:'sine',x:startX+i*spacing,y:baseY,hp:this._hp('sine',wave),maxHp:this._hp('sine',wave),size:this._hr('sine'),hitRadius:this._hr('sine'),alive:true,timer:0,phase:i*0.5,speed:this._sp('sine',wave),scoreValue:this._sv('sine')});
            }
        } else {
            // shooter, rush, spread は従来通り単独
            this.enemies.push({id:Math.random(),type,x:30+Math.random()*(this.canvas.width-60),y:-20,hp:this._hp(type,wave),maxHp:this._hp(type,wave),size:this._hr(type),hitRadius:this._hr(type),alive:true,timer:0,phase:Math.random()*Math.PI*2,speed:this._sp(type,wave),scoreValue:this._sv(type)});
        }
    }
    clear() { this.enemies=[];this.enemyBullets=[]; }
    getEnemies() { return this.enemies; }
    getAliveEnemies() { return this.enemies.filter(e=>e.alive); }
    getEnemyBullets() { return this.enemyBullets; }
    killEnemy(enemy) {
        const idx = this.enemies.indexOf(enemy);
        if (idx >= 0) {
            this.onEnemyKilled(enemy);
            this.enemies.splice(idx, 1);
        }
    }
    addScore(p) { this.score+=p; }
    getScore() { return this.score; }
    onEnemyKilled(enemy) {
        this.addScore(enemy.scoreValue);
        if(this.game&&this.game.particles){const colors=['#ff4444','#ffaa00','#ffff00','#ff8844'];this.game.particles.explode(enemy.x,enemy.y,colors[Math.floor(Math.random()*4)],12);}
        if(this.game&&this.game.items)this.game.items.spawn(enemy.x,enemy.y,this._ev(enemy));
    }
    _updateEnemy(e,dt) {
        e.timer+=dt;
        if(e.type==='straight') e.y+=e.speed*dt;
        else if(e.type==='sine'){e.y+=e.speed*dt;e.x+=Math.sin(e.timer*3+e.phase)*80*dt;}
        else if(e.type==='shooter'){
            e.y+=e.speed*dt;
            if(e.timer>1&&e.timer%1.5<dt&&this.player.alive){
                const dx=this.player.x-e.x,dy=this.player.y-e.y,d=Math.hypot(dx,dy);
                if(d>0)this.enemyBullets.push({x:e.x,y:e.y,vx:dx/d*150,vy:dy/d*150,size:4,life:3,color:'#ff8844'});
            }
        }
        else if(e.type==='rush'){
            if(e.timer<3&&this.player.alive){
                // 3秒間追跡
                const dx=this.player.x-e.x,dy=this.player.y-e.y,d=Math.hypot(dx,dy);
                if(d>0){
                    // 進行方向を記録
                    if(!e._vx){e._vx=dx/d;e._vy=dy/d;}
                    e.x+=dx/d*e.speed*dt;
                    e.y+=dy/d*e.speed*dt;
                }
            } else if(!e._vx){
                // 追跡終了時、進行方向が未記録なら直下へ
                e._vx=0;
                e._vy=1;
            }
            // 追跡終了後は最後に進んでた方向を維持
            e.x+=e._vx*e.speed*dt;
            e.y+=e._vy*e.speed*dt;
        }
        else if(e.type==='spread'){
            e.y+=e.speed*dt;
            if(e.timer>0.8&&e.timer%2<dt){for(let a=0;a<Math.PI*2;a+=Math.PI/4)this.enemyBullets.push({x:e.x,y:e.y,vx:Math.cos(a)*100,vy:Math.sin(a)*100,size:3,life:2.5,color:'#ff44aa'});}
        }
    }
    _drawEnemy(ctx,e) {
        ctx.save();ctx.translate(e.x,e.y);
        if(e.type==='straight'){ctx.fillStyle='#ff6666';ctx.fillRect(-8,-8,16,16);}
        else if(e.type==='sine'){ctx.fillStyle='#ff8844';ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(-10,10);ctx.lineTo(10,10);ctx.closePath();ctx.fill();}
        else if(e.type==='shooter'){ctx.fillStyle='#cc44cc';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff88ff';ctx.fillRect(-3,0,6,10);}
        else if(e.type==='rush'){ctx.fillStyle='#ffaa00';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(-8,8);ctx.lineTo(8,8);ctx.closePath();ctx.fill();}
        else if(e.type==='spread'){ctx.fillStyle='#44aaff';ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#88ccff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.stroke();}
        ctx.restore();
    }
    _hp(t,w){const b={straight:1,sine:2,shooter:4,rush:1,spread:5};return(b[t]||1)+Math.floor(w*0.5);}
    _hr(t){return{straight:10,sine:10,shooter:14,rush:10,spread:16}[t]||10;}
    _sp(t,w){const b={straight:100,sine:80,shooter:50,rush:100,spread:40};return(b[t]||80)+w*5;}
    _sv(t){return{straight:10,sine:15,shooter:25,rush:15,spread:30}[t]||10;}
    _ev(e){return{straight:1,sine:1,shooter:2,rush:1,spread:3}[e.type]||1;}
}
