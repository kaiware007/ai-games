export class ItemManager {
    constructor() { this.items = []; }
    update(dt) {
        for(let i=this.items.length-1;i>=0;i--){
            this.items[i].y+=30*dt; this.items[i].pulse+=dt*3;
            if(this.items[i].y>700) this.items.splice(i,1);
        }
    }
    draw(ctx) {
        for(const item of this.items){
            const pulse=1+Math.sin(item.pulse)*0.2, size=6*pulse;
            ctx.fillStyle=item.color;ctx.shadowColor=item.color;ctx.shadowBlur=8;
            ctx.beginPath();ctx.arc(item.x,item.y,size,0,Math.PI*2);ctx.fill();
        }
        ctx.shadowBlur=0;
    }
    spawn(x,y,amount=1) {
        for(let i=0;i<amount;i++) this.items.push({x:x+(Math.random()-0.5)*30,y:y+(Math.random()-0.5)*20,value:1,color:'#44ffaa',pulse:Math.random()*Math.PI*2});
    }
    collect(player, buffs) {
        const px=player.x,py=player.y,range=25;
        const xpMult = buffs ? (buffs.getXpGainMultiplier ? buffs.getXpGainMultiplier() : 1) : 1;
        for(let i=this.items.length-1;i>=0;i--){
            const item=this.items[i];
            if(Math.hypot(item.x-px,item.y-py)<range){
                player.exp+=item.value*player.expMultiplier*xpMult;
                this.items.splice(i,1);
            }
        }
    }
    clear() { this.items=[]; }
    getItems() { return this.items; }
}
