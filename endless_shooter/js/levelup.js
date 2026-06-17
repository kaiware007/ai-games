const MAIN_WEAPONS = [
    {id:'normalShot',name:'バルカン',desc:'前方に弾を連射',icon:'🔫'},
    {id:'laser',name:'レーザー',desc:'貫通レーザー',icon:'⚡'},
    {id:'tripleShot',name:'トリプルショット',desc:'3方向に弾を発射',icon:'🔱'},
    {id:'yoyo',name:'ヨーヨー',desc:'往復する弾',icon:'🌀'}
];
const SUB_WEAPONS = [
    {id:'sideWave',name:'サイドウェーブ',desc:'広範囲の波状弾',icon:'🌊'},
    {id:'homing',name:'ホーミング',desc:'敵を追跡する弾',icon:'🎯'},
    {id:'cutter',name:'カッター',desc:'回転するカッター',icon:'🔪'},
    {id:'sideBarrier',name:'サイドバリア',desc:'敵弾を消すシールド',icon:'🛡️'}
];
const BUFFS = [
    {id:'fireRateUp',name:'射速アップ',desc:'発射速度が上がる',icon:'🔥'},
    {id:'damageUp',name:'ダメージアップ',desc:'攻撃力が上がる',icon:'💥'},
    {id:'speedUp',name:'移動速度アップ',desc:'移動が速くなる',icon:'💨'},
    {id:'xpGainUp',name:'経験値アップ',desc:'獲得経験値が増える',icon:'✨'},
    {id:'weaponSizeUp',name:'武器サイズアップ',desc:'武器の弾が大きくなる',icon:'📏'}
];
export class LevelUpSystem {
    constructor(canvas, player, weapons, buffs) {
        this.canvas = canvas;
        this.player = player;
        this.weapons = weapons;
        this.buffs = buffs;
        this.availableUpgrades = [];
        this.selected = null;
        this.showing = false;
        this.cards = [];
    }
    isShowing() { return this.showing; }
    show() { this.showing=true;this._layoutCards(); }
    hide() { this.showing=false;this.cards=[]; }
    _layoutCards() {
        this.cards=[];
        const cw=90,ch=100,tw=cw*3+20*2,sx=(320-tw)/2,sy=200;
        for(let i=0;i<this.availableUpgrades.length;i++) this.cards.push({x:sx+i*(cw+20),y:sy,w:cw,h:ch,upgrade:this.availableUpgrades[i]});
    }
    draw(ctx) {
        if(!this.showing) return;
        ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,320,640);
        ctx.fillStyle='#ffff00';ctx.font='bold 20px sans-serif';ctx.textAlign='center';
        ctx.fillText('LEVEL UP!',160,160);
        for(const card of this.cards){
            const u=card.upgrade;
            // カテゴリごとに枠線の色を変える
            let borderColor='#44aaff';
            if(u.type==='mainNew'||u.type==='mainUpgrade') borderColor='#44aaff';      // メイン武器=青
            else if(u.type==='subNew'||u.type==='subUpgrade') borderColor='#44ff44';   // サブ武器=緑
            else if(u.type==='buff') borderColor='#ffcc00';                             // バフ=黄色
            ctx.fillStyle='#222244';ctx.strokeStyle=borderColor;ctx.lineWidth=2;
            ctx.fillRect(card.x,card.y,card.w,card.h);ctx.strokeRect(card.x,card.y,card.w,card.h);
            ctx.font='24px sans-serif';ctx.fillText(u.icon||'⭐',card.x+card.w/2,card.y+30);
            // 名前の色もカテゴリごとに
            ctx.font='bold 10px sans-serif';
            if(u.type==='mainNew'||u.type==='mainUpgrade') ctx.fillStyle='#44aaff';
            else if(u.type==='subNew'||u.type==='subUpgrade') ctx.fillStyle='#44ff44';
            else if(u.type==='buff') ctx.fillStyle='#ffcc00';
            else ctx.fillStyle='#ffffff';
            ctx.fillText(u.name,card.x+card.w/2,card.y+55);
            ctx.fillStyle='#aaaaaa';ctx.font='8px sans-serif';ctx.fillText(u.desc,card.x+card.w/2,card.y+75);
        }
    }
    generateUpgrades(ws, buffs) {
        this.availableUpgrades=[];
        const main=ws.getMainWeapon(), subs=ws.getSubWeapons();
        // メイン武器：現在のLvアップ
        if(main.level<5){const w=MAIN_WEAPONS.find(w=>w.id===main.type);this.availableUpgrades.push({type:'mainUpgrade',weaponId:main.type,name:`${w.name} Lv.${main.level}→${main.level+1}`,desc:w.desc,icon:w.icon});}
        // メイン武器：新しい武器
        for(const w of MAIN_WEAPONS){if(w.id!==main.type)this.availableUpgrades.push({type:'mainNew',weaponId:w.id,name:w.name,desc:w.desc,icon:w.icon});}
        // サブ武器：新しい武器追加（2種未満の場合）
        if(subs.size<2){for(const w of SUB_WEAPONS){if(!subs.has(w.id))this.availableUpgrades.push({type:'subNew',weaponId:w.id,name:w.name,desc:w.desc,icon:w.icon});}}
        // サブ武器：Lvアップ
        for(const[id,lvl]of subs){if(lvl<5){const w=SUB_WEAPONS.find(w=>w.id===id);this.availableUpgrades.push({type:'subUpgrade',weaponId:id,name:`${w.name} Lv.${lvl}→${lvl+1}`,desc:w.desc,icon:w.icon});}}
        // バフ：装備枠制限（最大3種）
        const equippedCount = buffs.getEquippedBuffCount ? buffs.getEquippedBuffCount() : Object.keys(buffs.buffLevels || {}).length;
        const maxEquipped = buffs.maxEquippedTypes || 3;
        const maxLevel = buffs.maxLevel || 5;
        for(const b of BUFFS){
            const bl=buffs.buffLevels||{};
            const cl=bl[b.id]||0;
            if(cl > 0) {
                // 既に装備しているバフはLvアップ（最大Lvまで）
                if(cl < maxLevel) {
                    this.availableUpgrades.push({type:'buff',buffId:b.id,name:`${b.name} Lv.${cl+1}`,desc:b.desc,icon:b.icon});
                }
            } else if(equippedCount < maxEquipped) {
                // 未装備のバフは装備枠に余裕があれば選択肢に出る
                this.availableUpgrades.push({type:'buff',buffId:b.id,name:`${b.name} Lv.1`,desc:b.desc,icon:b.icon});
            }
        }
        this.availableUpgrades.sort(()=>Math.random()-0.5);
        this.availableUpgrades=this.availableUpgrades.slice(0,3);
        this.selected=null;
    }
    select(index) { if(index>=0&&index<this.availableUpgrades.length)this.selected=this.availableUpgrades[index];return this.selected; }
    apply(upgrade, ws, buffs) {
        if(!upgrade) return;
        if(upgrade.type==='mainNew') ws.setMainWeapon(upgrade.weaponId);
        else if(upgrade.type==='mainUpgrade') ws.upgradeMainWeapon();
        else if(upgrade.type==='subNew') ws.addSubWeapon(upgrade.weaponId);
        else if(upgrade.type==='subUpgrade') ws.upgradeSubWeapon(upgrade.weaponId);
        else if(upgrade.type==='buff') buffs.applyBuff(upgrade.buffId);
    }
}
