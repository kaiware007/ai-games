export class WeaponSystem {
    constructor() {
        this.mainWeapon = { type: 'normalShot', level: 1 };
        this.subWeapons = new Map();
        this.bullets = [];
        this.lasers = [];
        this.cutters = [];
        this.barriers = [];
        this.fireTimer = 0;
        this.homingTimer = 0;
        this.sideWaveTimer = 0;
        this.getEnemies = null;
        this.onEnemyKilled = null;
        this.getEnemyBullets = null;
        this.buffs = null;
    }
    setEnemyRefs(gE, oEK, gEB) { this.getEnemies=gE; this.onEnemyKilled=oEK; this.getEnemyBullets=gEB; }
    setBuffs(ref) { this.buffs = ref; }
    reset() {
        this.mainWeapon = { type: 'normalShot', level: 1 };
        this.subWeapons.clear();
        this.bullets.length = 0; this.lasers.length = 0;
        this.cutters.length = 0; this.barriers.length = 0;
        this.fireTimer = 0;
        this.homingTimer = 0;
        this.sideWaveTimer = 0;
    }
    setMainWeapon(type) { this.mainWeapon = { type, level: 1 }; }
    upgradeMainWeapon() { this.mainWeapon.level++; }
    addSubWeapon(type) { if (this.subWeapons.size < 2) this.subWeapons.set(type, 1); }
    upgradeSubWeapon(type) { if (this.subWeapons.has(type)) this.subWeapons.set(type, this.subWeapons.get(type)+1); }
    getMainWeapon() { return this.mainWeapon; }
    getSubWeapons() { return new Map(this.subWeapons); }
    getSubWeaponCount() { return this.subWeapons.size; }
    _enemyBullets() { return this.getEnemyBullets ? this.getEnemyBullets() : []; }
    _getEnemies() { return this.getEnemies ? this.getEnemies() : []; }
    _weaponSize() { return this.buffs ? this.buffs.getWeaponSizeMultiplier() : 1; }
    update(dt) {
        for (let i=this.lasers.length-1;i>=0;i--) { this.lasers[i].life-=dt; if(this.lasers[i].life<=0) this.lasers.splice(i,1); }
        for (const c of this.cutters) { c.angle += c.rotSpeed*dt; }
        for (const bar of this.barriers) {
            const ebs = this._enemyBullets();
            for (let i=ebs.length-1;i>=0;i--) {
                const eb = ebs[i];
                if (Math.hypot(eb.x-bar.x, eb.y-bar.y) < bar.radius+eb.size) {
                    ebs.splice(i,1);
                }
            }
        }
    }
    fire(dt, player) {
        if (!player) return;
        const dmg = this.buffs ? this.buffs.getDamageMultiplier() : 1;
        const fr = this.buffs ? this.buffs.getFireRateMultiplier() : 1;
        const _ws = this.buffs ? this.buffs.getWeaponSizeMultiplier() : 1;
        this.fireTimer -= dt * fr;
        if (this.fireTimer <= 0) {
            this._fireMain(player, dmg);
            if (this.mainWeapon.type === 'laser') {
                this.fireTimer = 0.45;
            } else if (this.mainWeapon.type === 'yoyo') {
                this.fireTimer = 2.0;
            } else {
                this.fireTimer = this.mainWeapon.level >= 3 ? 0.12 : 0.18;
            }
        }
        this.homingTimer -= dt * (this.buffs ? this.buffs.getFireRateMultiplier() : 1);
        for (const [type, lvl] of this.subWeapons) {
            if (type === 'homing') {
                if (this.homingTimer <= 0) {
                    this._fireSub(type, lvl, player, dmg);
                    this.homingTimer = 1.5;
                }
            } else if (type === 'sideWave') {
                this.sideWaveTimer -= dt * (this.buffs ? this.buffs.getFireRateMultiplier() : 1);
                if (this.sideWaveTimer <= 0) {
                    this._fireSub(type, lvl, player, dmg);
                    this.sideWaveTimer = 0.5;
                }
            } else {
                this._fireSub(type, lvl, player, dmg);
            }
        }
        for (let i = this.bullets.length-1; i>=0; i--) {
            const b = this.bullets[i];
            if (!b) { this.bullets.splice(i,1); continue; }
            this._updateBullet(b, dt, player, fr);
            // ヨーヨーは画面外でも消滅させない（自機に戻ってきたらdead=trueになる）
            if (b.yoyo) {
                if (b.dead) this.bullets.splice(i,1);
            } else if (b.dead || b.y<-20||b.y>660||b.x<-20||b.x>380) {
                this.bullets.splice(i,1);
            }
        }
        for (let i=this.lasers.length-1;i>=0;i--) { this.lasers[i].life-=dt; if(this.lasers[i].life<=0) this.lasers.splice(i,1); }
        for (const c of this.cutters) {
            c.angle += c.rotSpeed*dt*fr;
            c.x = player.x+Math.cos(c.angle)*c.orbitRadius;
            c.y = player.y+Math.sin(c.angle)*c.orbitRadius;
        }
        if (this.barriers.length>0) {
            const eb=this._enemyBullets();
            for(let i=eb.length-1;i>=0;i--){const e=eb[i];for(const bar of this.barriers){if(Math.hypot(e.x-bar.x,e.y-bar.y)<bar.radius+e.size){eb.splice(i,1);break;}} }
        }
        this._checkHits(dmg);
    }
   _fireMain(p, dmg) {
        const t=this.mainWeapon.type, l=this.mainWeapon.level;
        const ws = this._weaponSize();
        if(t==='normalShot'){
            const n=l>=5?3:l>=3?2:1, sp=400+l*30;
            for(let i=0;i<n;i++) this.bullets.push({x:p.x+(i-(n-1)/2)*12,y:p.y-15,vx:0,vy:-sp,size:6*ws,damage:1*dmg,color:'#ffff00'});
        } else if(t==='laser'){
            this.lasers.push({x:p.x, playerY:p.y-15, width:(8+l*3)*ws, damage:2*dmg, life:0.3});
        } else if(t==='tripleShot'){
            const n=l>=4?5:3, sp=350+l*20;
            for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*0.2;this.bullets.push({x:p.x,y:p.y-15,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,size:5*ws,damage:0.8*dmg,color:'#00ffaa'});}
        } else if(t==='yoyo'){
            this.bullets.push({x:p.x,y:p.y-15,vx:0,vy:-(300+l*40),size:8*ws,damage:1.5*dmg,color:'#ff88ff',yoyo:true,yoyoPhase:'outgoing',yoyoMaxDist:400,piercing:true});
        }
    }
    _fireSub(type, lvl, p, dmg) {
        const ws = this._weaponSize();
        if(type==='sideWave'){
            // 左右に縦に長いバー状の貫通弾を発射
            const pairs = 1; // 発射数は常に1対（左右1発ずつ）
            const speed = 350;
            const bulletWidth = 8 * ws;
            const bulletHeight = (16 + lvl * 8) * ws; // Lv1=24, Lv2=32, Lv3=40（縦幅がレベルで広がる）
            const damage = 0.5 * dmg;
            const color = '#44aaff';
            // 左方向に発射
            this.bullets.push({
                x: p.x - 20,
                y: p.y,
                vx: -speed,
                vy: 0,
                width: bulletWidth,
                height: bulletHeight,
                size: bulletHeight / 2, // 互換性用
                damage: damage,
                color: color,
                piercing: true,
                sideWaveBullet: true
            });
            // 右方向に発射
            this.bullets.push({
                x: p.x + 20,
                y: p.y,
                vx: speed,
                vy: 0,
                width: bulletWidth,
                height: bulletHeight,
                size: bulletHeight / 2,
                damage: damage,
                color: color,
                piercing: true,
                sideWaveBullet: true
            });
        } else if(type==='homing'){
            const n=lvl+1;
            for(let i=0;i<n;i++) this.bullets.push({x:p.x+(i-(n-1)/2)*15,y:p.y+10,vx:0,vy:200,size:6*ws,damage:0.5*dmg,color:'#ff4444',homing:true});
        } else if(type==='cutter'&&this.cutters.length===0){
            const n=lvl+1, r=40+lvl*10;
            for(let i=0;i<n;i++) this.cutters.push({angle:Math.PI*2/n*i,orbitRadius:r,rotSpeed:3+lvl*0.5,damage:1*dmg,radius:10*ws});
        } else if(type==='sideBarrier'){
            const r=(6+lvl*1.25)*ws;
            if(this.barriers.length===0){this.barriers.push({x:p.x-35,y:p.y,radius:r},{x:p.x+35,y:p.y,radius:r});}
            else{this.barriers[0].x=p.x-35;this.barriers[0].y=p.y;this.barriers[0].radius=r;this.barriers[1].x=p.x+35;this.barriers[1].y=p.y;this.barriers[1].radius=r;}
        }
    }
    _updateBullet(b, dt, p, fr) {
        if(b.homing){
            // 敵をロックしたら離さない（targetIdで追跡）
            if (b.targetId === undefined) {
                // 最初のターゲット取得
                const target = this._findNearest(b);
                if (target) {
                    b.targetId = target.id;
                }
            }
            // ロックした敵を追跡、いなくなったら再取得
            let t = null;
            if (b.targetId !== undefined) {
                for (const e of this._getEnemies()) {
                    if (e && e.alive && e.id === b.targetId) { t = e; break; }
                }
                if (!t) {
                    // ロック対象が死んだら新しい敵を探す
                    b.targetId = undefined;
                    const fallback = this._findNearest(b);
                    if (fallback) {
                        b.targetId = fallback.id;
                        t = fallback;
                    }
                }
            } else {
                t = this._findNearest(b);
                if (t) b.targetId = t.id;
            }
            if(t){
                const a=Math.atan2(t.y-b.y,t.x-b.x);
                b.vx+=Math.cos(a)*4500*dt;
                b.vy+=Math.sin(a)*4500*dt;
                const s=Math.hypot(b.vx,b.vy);
                b.vx=b.vx/s*380;
                b.vy=b.vy/s*380;
            }
        }
        if(b.yoyo){
            b.x = p.x;
            if (b.yoyoPhase === 'outgoing') {
                b.y += b.vy * dt * fr;
                if (b.y <= p.y - b.yoyoMaxDist) {
                    b.yoyoPhase = 'returning';
                }
            } else if (b.yoyoPhase === 'returning') {
                b.y += Math.abs(b.vy) * dt * fr;
                if (b.y >= p.y - 15) {
                    b.dead = true;
                }
            }
        }
        else{b.x+=b.vx*dt;b.y+=b.vy*dt;}
    }
    _checkHits(dmg) {
        const enemies=this._getEnemies();
        for(let i=this.bullets.length-1;i>=0;i--){
            const b=this.bullets[i];let hit=false;
            for(let j=enemies.length-1;j>=0;j--){
                const e=enemies[j];if(!e||!e.alive)continue;
                let bulletRadius = b.size || 5;
                if (b.sideWaveBullet) {
                    // 矩形弾の当たり判定（円形近似）
                    bulletRadius = (b.height || 16) / 2;
                }
                if(Math.hypot(b.x-e.x,b.y-e.y)<(e.size||15)+bulletRadius){e.hp-=b.damage;if(!b.piercing)hit=true;if(e.hp<=0&&this.onEnemyKilled)this.onEnemyKilled(e,j);break;}
            }
            if(hit)this.bullets.splice(i,1);
        }
        for(const l of this.lasers){
            for(let j=enemies.length-1;j>=0;j--){
                const e=enemies[j];if(!e||!e.alive)continue;
                if(Math.abs(e.x-l.x)<(e.size||15)+l.width/2 && e.y < l.playerY && e.y > 0){
                    e.hp-=l.damage*0.1;
                    if(e.hp<=0&&this.onEnemyKilled)this.onEnemyKilled(e,j);
                }
            }
        }
        for(const c of this.cutters){
            for(let j=enemies.length-1;j>=0;j--){
                const e=enemies[j];if(!e||!e.alive)continue;
                if(Math.hypot(c.x-e.x,c.y-e.y)<(e.size||15)+c.radius){e.hp-=c.damage*0.15;if(e.hp<=0&&this.onEnemyKilled)this.onEnemyKilled(e,j);}
            }
        }
    }
    _findNearest(b){let n=null,d=1e9;for(const e of this._getEnemies()){if(!e||!e.alive)continue;const dist=Math.hypot(e.x-b.x,e.y-b.y);if(dist<d){d=dist;n=e;}}return n;}
    draw(ctx) {
        for(const b of this.bullets){
            ctx.fillStyle=b.color||'#ffff00';
            ctx.shadowColor=b.color||'#ffff00';
            ctx.shadowBlur=4;
            if(b.homing){
                ctx.beginPath();
                ctx.arc(b.x,b.y,b.size,0,Math.PI*2);
                ctx.fill();
            } else if(b.sideWaveBullet){
                // サイドウェーブは縦に長い矩形で描画
                const w = b.width || 8;
                const h = b.height || 16;
                ctx.fillRect(b.x - w/2, b.y - h/2, w, h);
            } else {
                ctx.fillRect(b.x-b.size/2,b.y-b.size,b.size,b.size*2);
            }
        }
        ctx.shadowBlur=0;
        for(const l of this.lasers){
            const a=Math.min(1,l.life*3);
            ctx.strokeStyle=`rgba(255,100,100,${a})`;
            ctx.lineWidth=l.width;
            ctx.shadowColor='#ff4444';
            ctx.shadowBlur=10;
            ctx.beginPath();
            ctx.moveTo(l.x, l.playerY);
            ctx.lineTo(l.x, 0);
            ctx.stroke();
        }
        ctx.shadowBlur=0;
        for(const c of this.cutters){ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.angle);ctx.fillStyle='#ffaa00';ctx.shadowColor='#ffaa00';ctx.shadowBlur=6;ctx.beginPath();ctx.ellipse(0,0,c.radius,4+(c.radius-10),0,0,Math.PI*2);ctx.fill();ctx.restore();}
        ctx.shadowBlur=0;
        for(const bar of this.barriers){ctx.strokeStyle='#44aaff';ctx.lineWidth=3;ctx.shadowColor='#44aaff';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(bar.x,bar.y,bar.radius,0,Math.PI*2);ctx.stroke();}
        ctx.shadowBlur=0;
    }
}