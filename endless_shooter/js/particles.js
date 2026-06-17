export class ParticleSystem {
    constructor() { this.particles = []; }
    update(dt) {
        for(let i=this.particles.length-1;i>=0;i--){
            const p=this.particles[i];
            p.x+=p.vx*dt; p.y+=p.vy*dt; p.life-=dt;
            p.alpha=Math.max(0,p.life/p.maxLife);
            if(p.life<=0) this.particles.splice(i,1);
        }
    }
    draw(ctx) {
        for(const p of this.particles){
            ctx.globalAlpha=p.alpha;ctx.fillStyle=p.color;
            ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.alpha,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
    }
    explode(x,y,color,count=10) {
        for(let i=0;i<count;i++){
            const angle=Math.PI*2*i/count+Math.random()*0.5, speed=50+Math.random()*100;
            this.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,size:2+Math.random()*3,color,life:0.3+Math.random()*0.4,maxLife:0.7,alpha:1});
        }
    }
    clear() { this.particles=[]; }
}
