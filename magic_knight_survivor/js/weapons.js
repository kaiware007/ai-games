// 武器定義 — 攻撃力・クールタイム・レベルアップ成長要素付き
export const WEAPON_DEFS = {
    magic_bowl: {
        name: 'マジックボウル',
        desc: '最も近い敵に魔法弾を発射',
        color: '#9b59b6',
        baseDamage: 15,
        cooldown: 1.2,
        bulletCount: 1,
        // レベルアップ効果: Lv2:弾数+1, Lv3:攻撃力+5, Lv4:弾数+1, Lv5:攻撃力+10
        levelEffects: {
            2: { bulletCount: 1 },
            3: { damage: 5 },
            4: { bulletCount: 1 },
            5: { damage: 10 }
        }
    },
    spinning_sword: {
        name: '回転剣',
        desc: '周囲を剣が回転して近接攻撃',
        color: '#e74c3c',
        baseDamage: 12,
        cooldown: 0, // 連続攻撃
        rotationSpeed: 3,
        rotationRadius: 40,
        swordCount: 1,
        // レベルアップ効果: Lv2:回転半径+20%, Lv3:攻撃力+5, Lv4:剣数+1, Lv5:攻撃力+10
        levelEffects: {
            2: { rotationRadius: 0.20 },
            3: { damage: 5 },
            4: { swordCount: 1 },
            5: { damage: 10 }
        }
    },
    holy_circle: {
        name: '聖光陣',
        desc: '周囲に光の陣を張り範囲ダメージ',
        color: '#f39c12',
        baseDamage: 8, // 秒あたり
        cooldown: 0, // 常時発動
        radius: 80,
        // レベルアップ効果: Lv2:範囲半径+15%, Lv3:攻撃力+3/秒, Lv4:範囲半径+15%, Lv5:攻撃力+5/秒
        levelEffects: {
            2: { radius: 0.15 },
            3: { damage: 3 },
            4: { radius: 0.15 },
            5: { damage: 5 }
        }
    },
    thunder: {
        name: '雷撃',
        desc: 'ランダムな敵に雷を落とす',
        color: '#3498db',
        baseDamage: 35,
        cooldown: 3.0,
        // レベルアップ効果: Lv2:攻撃力+10, Lv3:クールタイム-0.3s, Lv4:攻撃力+15, Lv5:クールタイム-0.5s
        levelEffects: {
            2: { damage: 10 },
            3: { cooldown: -0.3 },
            4: { damage: 15 },
            5: { cooldown: -0.5 }
        }
    },
    poison_cloud: {
        name: 'ポイズンクラウド',
        desc: '歩いた跡に残る毒雲',
        color: '#2ecc71',
        baseDamage: 5, // 秒あたり
        cooldown: 2.0,
        duration: 3, // 秒
        radius: 20,
        // レベルアップ効果: Lv2:毒持続+1秒, Lv3:攻撃力+2/秒, Lv4:毒持続+1秒, Lv5:攻撃力+3/秒
        levelEffects: {
            2: { duration: 1 },
            3: { damage: 2 },
            4: { duration: 1 },
            5: { damage: 3 }
        }
    },
    arrow_shower: {
        name: 'シャワーオブアロウ',
        desc: '上空から矢が降る',
        color: '#1abc9c',
        baseDamage: 12,
        cooldown: 1.5,
        arrowCount: 3,
        // レベルアップ効果: Lv2:矢数+2, Lv3:攻撃力+5, Lv4:矢数+2, Lv5:攻撃力+8
        levelEffects: {
            2: { arrowCount: 2 },
            3: { damage: 5 },
            4: { arrowCount: 2 },
            5: { damage: 8 }
        }
    },
    guardian: {
        name: 'ガーディアン',
        desc: '味方ゴーレムを召喚',
        color: '#95a5a6',
        baseDamage: 25,
        cooldown: 2.0,
        guardianCount: 1,
        // レベルアップ効果: Lv2:攻撃力+8, Lv3:ゴーレム数+1, Lv4:攻撃力+12, Lv5:ゴーレム数+1
        levelEffects: {
            2: { damage: 8 },
            3: { guardianCount: 1 },
            4: { damage: 12 },
            5: { guardianCount: 1 }
        }
    },
    holy_cross: {
        name: 'ホーリークロス',
        desc: '縦横に光の十字架を放つ',
        color: '#f1c40f',
        baseDamage: 18,
        cooldown: 2.5,
        crossSize: 100,
        // レベルアップ効果: Lv2:攻撃力+5, Lv3:範囲+15%, Lv4:攻撃力+8, Lv5:範囲+15%
        levelEffects: {
            2: { damage: 5 },
            3: { crossSize: 0.15 },
            4: { damage: 8 },
            5: { crossSize: 0.15 }
        }
    }
};

// バフ定義
export const BUFF_DEFS = {
    max_hp_up: { name: 'マックスHPアップ', desc: '最大HPを15増加', color: '#e74c3c', icon: '🔴' },
    heal_up: { name: '回復量アップ', desc: 'ハート回復量を+10増加', color: '#2ecc71', icon: '💚' },
    atk_up: { name: '攻撃力アップ', desc: '全武器ダメージ+10%', color: '#f1c40f', icon: '🟡' },
    atk_speed_up: { name: '攻撃速度アップ', desc: 'クールダウン-8%', color: '#3498db', icon: '🔵' },
    exp_bonus: { name: '経験値ボーナス', desc: '経験値獲得量+15%', color: '#9b59b6', icon: '🟣' },
    pickup_range: { name: 'アイテム取得範囲アップ', desc: '取得範囲+20%', color: '#e67e22', icon: '🟠' },
    move_speed_up: { name: '移動速度アップ', desc: '移動速度+8%', color: '#ecf0f1', icon: '⚪' }
};

/**
 * 武器の現在のステータスを計算する
 * base + levelEffects の累積を計算
 */
function getWeaponStats(def, level) {
    let damage = def.baseDamage;
    let cooldown = def.cooldown;
    let bulletCount = def.bulletCount || 1;
    let rotationSpeed = def.rotationSpeed || 3;
    let rotationRadius = def.rotationRadius || 40;
    let swordCount = def.swordCount || 1;
    let radius = def.radius || 80;
    let duration = def.duration || 3;
    let arrowCount = def.arrowCount || 3;
    let guardianCount = def.guardianCount || 1;
    let crossSize = def.crossSize || 100;

    const effects = def.levelEffects || {};
    for (let lv = 1; lv <= level; lv++) {
        if (effects[lv]) {
            const eff = effects[lv];
            if (eff.damage) damage += eff.damage;
            if (eff.cooldown) cooldown += eff.cooldown;
            if (eff.bulletCount) bulletCount += eff.bulletCount;
            if (eff.rotationRadius) rotationRadius *= (1 + eff.rotationRadius);
            if (eff.swordCount) swordCount += eff.swordCount;
            if (eff.radius) radius *= (1 + eff.radius);
            if (eff.duration) duration += eff.duration;
            if (eff.arrowCount) arrowCount += eff.arrowCount;
            if (eff.guardianCount) guardianCount += eff.guardianCount;
            if (eff.crossSize) crossSize *= (1 + eff.crossSize);
        }
    }

    return {
        damage,
        cooldown: Math.max(0.1, cooldown),
        bulletCount,
        rotationSpeed,
        rotationRadius,
        swordCount,
        radius,
        duration,
        arrowCount,
        guardianCount,
        crossSize
    };
}

export class WeaponManager {
    constructor(player) {
        this.player = player;
        this.weapons = {}; // { weaponId: { level, cooldown, ... } }
        this.buffs = {}; // { buffId: level }
        this.projectiles = [];
        this.swordAngle = 0;
        this.poisonClouds = [];
        this.guardians = [];
        this.holyCircleTimer = 0;
        this.thunderTimer = 0;
        this.arrowTimer = 0;
        this.crossTimer = 0;
    }

    init() {
        this.weapons = {};
        this.buffs = {};
        this.projectiles = [];
        this.swordAngle = 0;
        this.poisonClouds = [];
        this.guardians = [];
        this.holyCircleTimer = 0;
        this.thunderTimer = 0;
        this.arrowTimer = 0;
        this.crossTimer = 0;
    }

    addWeapon(weaponId) {
        if (this.weapons[weaponId]) {
            this.weapons[weaponId].level += 1;
        } else {
            this.weapons[weaponId] = { level: 1, cooldown: 0 };
        }
    }

    addBuff(buffId) {
        if (this.buffs[buffId]) {
            this.buffs[buffId] += 1;
        } else {
            this.buffs[buffId] = 1;
        }
        this.applyBuff(buffId);
    }

    applyBuff(buffId) {
        const level = this.buffs[buffId];
        switch (buffId) {
            case 'max_hp_up':
                this.player.maxHp += 15;
                this.player.hp = Math.min(this.player.hp + 15, this.player.maxHp);
                break;
            case 'heal_up':
                this.player.healBonus = (this.player.healBonus || 0) + 10;
                break;
            case 'atk_up':
                break;
            case 'atk_speed_up':
                break;
            case 'exp_bonus':
                break;
            case 'pickup_range':
                this.player.pickupRangeBonus = (this.player.pickupRangeBonus || 0) + 20;
                break;
            case 'move_speed_up':
                this.player.speedBonus = (this.player.speedBonus || 0) + 8;
                break;
        }
    }

    getAttackMultiplier() {
        const level = this.buffs.atk_up || 0;
        return 1 + level * 0.10;
    }

    getAttackSpeedMultiplier() {
        const level = this.buffs.atk_speed_up || 0;
        return Math.max(0.2, 1 - level * 0.08);
    }

    getExpMultiplier() {
        const level = this.buffs.exp_bonus || 0;
        return 1 + level * 0.15;
    }

    getPickupRangeMultiplier() {
        const level = this.buffs.pickup_range || 0;
        return 1 + level * 0.20;
    }

    getEnemiesOnScreen(enemies, camera) {
        const margin = 50;
        return enemies.filter(e => {
            const sx = e.x - camera.getX();
            const sy = e.y - camera.getY();
            return sx >= -margin && sx <= camera.getWidth() + margin &&
                   sy >= -margin && sy <= camera.getHeight() + margin;
        });
    }

    update(dt, enemies, game) {
        const px = this.player.getX();
        const py = this.player.getY();
        const atkMult = this.getAttackMultiplier();
        const atkSpeedMult = this.getAttackSpeedMultiplier();

        const onScreenEnemies = this.getEnemiesOnScreen(enemies, game.camera);

        // マジックボウル — 弾数成長タイプ
        if (this.weapons.magic_bowl) {
            const w = this.weapons.magic_bowl;
            w.cooldown -= dt;
            const def = WEAPON_DEFS.magic_bowl;
            const stats = getWeaponStats(def, w.level);

            const fireRate = Math.max(0.3, stats.cooldown * atkSpeedMult);
            if (w.cooldown <= 0 && onScreenEnemies.length > 0) {
                w.cooldown = fireRate;
                let closest = null, closestDist = Infinity;
                for (const e of onScreenEnemies) {
                    const d = Math.sqrt((e.x - px) ** 2 + (e.y - py) ** 2);
                    if (d < closestDist) { closestDist = d; closest = e; }
                }
                if (closest) {
                    const angle = Math.atan2(closest.y - py, closest.x - px);
                    const bulletCount = Math.min(stats.bulletCount, 5);
                    for (let i = 0; i < bulletCount; i++) {
                        const spread = (i - (bulletCount - 1) / 2) * 0.15;
                        this.projectiles.push({
                            x: px, y: py,
                            vx: Math.cos(angle + spread) * 300,
                            vy: Math.sin(angle + spread) * 300,
                            damage: stats.damage * atkMult,
                            radius: 5,
                            color: def.color,
                            life: 2,
                            type: 'magic_bowl'
                        });
                    }
                }
            }
        }

        // 回転剣 — 半径・剣数成長タイプ
        if (this.weapons.spinning_sword) {
            const w = this.weapons.spinning_sword;
            const def = WEAPON_DEFS.spinning_sword;
            const stats = getWeaponStats(def, w.level);

            // atk_speed_up は回転速度に適用
            const rotationMult = this.buffs.atk_speed_up ? (1 + this.buffs.atk_speed_up * 0.08) : 1;
            this.swordAngle += dt * stats.rotationSpeed * rotationMult;

            const swordRange = stats.rotationRadius;
            const swordDamage = stats.damage * atkMult;
            const swordCount = stats.swordCount;

            for (let s = 0; s < swordCount; s++) {
                const a = this.swordAngle + (s * Math.PI * 2 / swordCount);
                const sx = px + Math.cos(a) * swordRange;
                const sy = py + Math.sin(a) * swordRange;

                for (let i = onScreenEnemies.length - 1; i >= 0; i--) {
                    const e = onScreenEnemies[i];
                    const d = Math.sqrt((e.x - sx) ** 2 + (e.y - sy) ** 2);
                    if (d < e.radius + 15) {
                        e.hp -= swordDamage * dt;
                        if (e.hp <= 0) {
                            game.onEnemyKilled(e);
                            const idx = enemies.indexOf(e);
                            if (idx >= 0) enemies.splice(idx, 1);
                        }
                    }
                }
            }
        }

        // 聖光陣 — 範囲・ダメージ成長タイプ
        if (this.weapons.holy_circle) {
            const w = this.weapons.holy_circle;
            const def = WEAPON_DEFS.holy_circle;
            const stats = getWeaponStats(def, w.level);

            this.holyCircleTimer += dt;
            const range = stats.radius;
            const damage = stats.damage * atkMult;

            if (this.holyCircleTimer >= 1.0 * atkSpeedMult) {
                this.holyCircleTimer = 0;
                for (let i = onScreenEnemies.length - 1; i >= 0; i--) {
                    const e = onScreenEnemies[i];
                    const d = Math.sqrt((e.x - px) ** 2 + (e.y - py) ** 2);
                    if (d < range) {
                        e.hp -= damage;
                        if (e.hp <= 0) {
                            game.onEnemyKilled(e);
                            const idx = enemies.indexOf(e);
                            if (idx >= 0) enemies.splice(idx, 1);
                        }
                    }
                }
            }
        }

        // 雷撃 — ダメージ・クールタイム成長タイプ
        if (this.weapons.thunder) {
            const w = this.weapons.thunder;
            const def = WEAPON_DEFS.thunder;
            const stats = getWeaponStats(def, w.level);

            this.thunderTimer -= dt;
            const damage = stats.damage * atkMult;

            if (this.thunderTimer <= 0 && onScreenEnemies.length > 0) {
                this.thunderTimer = stats.cooldown * atkSpeedMult;
                const strikeCount = Math.min(w.level, 5);
                for (let i = 0; i < strikeCount; i++) {
                    const target = onScreenEnemies[Math.floor(Math.random() * onScreenEnemies.length)];
                    if (target) {
                        this.projectiles.push({
                            x: target.x, y: target.y - 50,
                            targetX: target.x, targetY: target.y,
                            damage: damage,
                            life: 0.3,
                            type: 'thunder',
                            color: def.color
                        });
                        target.hp -= damage;
                        if (target.hp <= 0) {
                            game.onEnemyKilled(target);
                            const idx = enemies.indexOf(target);
                            if (idx >= 0) enemies.splice(idx, 1);
                        }
                    }
                }
            }
        }

        // ポイズンクラウド — 持続時間・ダメージ成長タイプ
        if (this.weapons.poison_cloud) {
            const w = this.weapons.poison_cloud;
            const def = WEAPON_DEFS.poison_cloud;
            const stats = getWeaponStats(def, w.level);

            const dir = game.input.getMoveDirection();
            if (Math.abs(dir.x) > 0.1 || Math.abs(dir.y) > 0.1) {
                w.cooldown = (w.cooldown || 0) - dt;
                if (w.cooldown <= 0) {
                    w.cooldown = stats.cooldown * atkSpeedMult;
                    this.poisonClouds.push({
                        x: px, y: py,
                        radius: stats.radius,
                        damage: stats.damage * atkMult,
                        life: stats.duration,
                        maxLife: stats.duration
                    });
                }
            }

            for (let i = this.poisonClouds.length - 1; i >= 0; i--) {
                const cloud = this.poisonClouds[i];
                cloud.life -= dt;
                if (cloud.life <= 0) {
                    this.poisonClouds.splice(i, 1);
                    continue;
                }
                for (let j = onScreenEnemies.length - 1; j >= 0; j--) {
                    const e = onScreenEnemies[j];
                    const d = Math.sqrt((e.x - cloud.x) ** 2 + (e.y - cloud.y) ** 2);
                    if (d < cloud.radius + e.radius) {
                        e.hp -= cloud.damage * dt;
                        if (e.hp <= 0) {
                            game.onEnemyKilled(e);
                            const idx = enemies.indexOf(e);
                            if (idx >= 0) enemies.splice(idx, 1);
                        }
                    }
                }
            }
        }

        // シャワーオブアロウ — 矢数・ダメージ成長タイプ
        if (this.weapons.arrow_shower) {
            const w = this.weapons.arrow_shower;
            const def = WEAPON_DEFS.arrow_shower;
            const stats = getWeaponStats(def, w.level);

            this.arrowTimer -= dt;

            if (this.arrowTimer <= 0) {
                this.arrowTimer = stats.cooldown * atkSpeedMult;
                for (let i = 0; i < stats.arrowCount; i++) {
                    const ax = px + (Math.random() - 0.5) * 200;
                    const ay = py + (Math.random() - 0.5) * 200;
                    this.projectiles.push({
                        x: ax, y: ay - 100,
                        vx: (Math.random() - 0.5) * 30,
                        vy: 250 + Math.random() * 100,
                        damage: stats.damage * atkMult,
                        radius: 3,
                        life: 2,
                        type: 'arrow',
                        color: def.color
                    });
                }
            }
        }

        // ガーディアン — ゴーレム数・ダメージ成長タイプ
        if (this.weapons.guardian) {
            const w = this.weapons.guardian;
            const def = WEAPON_DEFS.guardian;
            const stats = getWeaponStats(def, w.level);

            const guardianCount = stats.guardianCount;
            while (this.guardians.length < guardianCount) {
                const angle = Math.random() * Math.PI * 2;
                this.guardians.push({
                    x: px + Math.cos(angle) * 60,
                    y: py + Math.sin(angle) * 60,
                    damage: stats.damage * atkMult,
                    radius: 12,
                    cooldown: 0,
                    angle: Math.random() * Math.PI * 2
                });
            }

            for (const g of this.guardians) {
                g.cooldown -= dt;
                g.angle += dt * 2;
                g.x = px + Math.cos(g.angle) * 60;
                g.y = py + Math.sin(g.angle) * 60;

                if (g.cooldown <= 0) {
                    g.cooldown = stats.cooldown * atkSpeedMult;
                    let closest = null, closestDist = Infinity;
                    for (const e of onScreenEnemies) {
                        const d = Math.sqrt((e.x - g.x) ** 2 + (e.y - g.y) ** 2);
                        if (d < closestDist) { closestDist = d; closest = e; }
                    }
                    if (closest && closestDist < 150) {
                        this.projectiles.push({
                            x: g.x, y: g.y,
                            vx: (closest.x - g.x) / closestDist * 200,
                            vy: (closest.y - g.y) / closestDist * 200,
                            damage: g.damage,
                            radius: 6,
                            life: 1.5,
                            type: 'guardian_attack',
                            color: def.color
                        });
                    }
                }
            }
        }

        // ホーリークロス — ダメージ・範囲成長タイプ
        if (this.weapons.holy_cross) {
            const w = this.weapons.holy_cross;
            const def = WEAPON_DEFS.holy_cross;
            const stats = getWeaponStats(def, w.level);

            this.crossTimer -= dt;
            const damage = stats.damage * atkMult;
            const crossSize = stats.crossSize;

            if (this.crossTimer <= 0 && onScreenEnemies.length > 0) {
                this.crossTimer = stats.cooldown * atkSpeedMult;
                this.projectiles.push({
                    x: px, y: py,
                    width: 6, height: crossSize * 2,
                    damage: damage,
                    life: 0.4,
                    type: 'holy_cross',
                    color: def.color
                });
                this.projectiles.push({
                    x: px, y: py,
                    width: crossSize * 2, height: 6,
                    damage: damage,
                    life: 0.4,
                    type: 'holy_cross',
                    color: def.color
                });

                for (let i = onScreenEnemies.length - 1; i >= 0; i--) {
                    const e = onScreenEnemies[i];
                    if (Math.abs(e.x - px) < crossSize && Math.abs(e.y - py) < crossSize) {
                        const onVertical = Math.abs(e.x - px) < 10;
                        const onHorizontal = Math.abs(e.y - py) < 10;
                        if (onVertical || onHorizontal) {
                            e.hp -= damage;
                            if (e.hp <= 0) {
                                game.onEnemyKilled(e);
                                const idx = enemies.indexOf(e);
                                if (idx >= 0) enemies.splice(idx, 1);
                            }
                        }
                    }
                }
            }
        }

        // プロジェクタイル更新
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.life -= dt;

            if (p.vx !== undefined) {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
            }

            if (p.life <= 0) {
                this.projectiles.splice(i, 1);
                continue;
            }

            if (p.type !== 'thunder' && p.type !== 'holy_cross') {
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    const d = Math.sqrt((e.x - p.x) ** 2 + (e.y - p.y) ** 2);
                    if (d < e.radius + (p.radius || 5)) {
                        e.hp -= p.damage;
                        this.projectiles.splice(i, 1);
                        if (e.hp <= 0) {
                            game.onEnemyKilled(e);
                            enemies.splice(j, 1);
                        }
                        break;
                    }
                }
            }
        }
    }

    draw(ctx, camera) {
        for (const p of this.projectiles) {
            ctx.fillStyle = p.color || '#fff';

            if (p.type === 'thunder') {
                ctx.strokeStyle = '#f1c40f';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.targetX, p.targetY);
                ctx.stroke();
                ctx.lineWidth = 1;
            } else if (p.type === 'holy_cross') {
                ctx.globalAlpha = 0.7;
                ctx.fillRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);
                ctx.globalAlpha = 1;
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius || 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 回転剣描画
        if (this.weapons.spinning_sword) {
            const w = this.weapons.spinning_sword;
            const def = WEAPON_DEFS.spinning_sword;
            const stats = getWeaponStats(def, w.level);
            const px = this.player.getX();
            const py = this.player.getY();

            for (let s = 0; s < stats.swordCount; s++) {
                const a = this.swordAngle + (s * Math.PI * 2 / stats.swordCount);
                const sx = px + Math.cos(a) * stats.rotationRadius;
                const sy = py + Math.sin(a) * stats.rotationRadius;

                ctx.fillStyle = def.color;
                ctx.beginPath();
                ctx.arc(sx, sy, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#c0392b';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.lineWidth = 1;
            }
        }

        // 聖光陣描画
        if (this.weapons.holy_circle) {
            const w = this.weapons.holy_circle;
            const def = WEAPON_DEFS.holy_circle;
            const stats = getWeaponStats(def, w.level);
            const px = this.player.getX();
            const py = this.player.getY();

            ctx.strokeStyle = 'rgba(243, 156, 18, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, stats.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.lineWidth = 1;
        }

        // ポイズンクラウド描画
        for (const cloud of this.poisonClouds) {
            const alpha = cloud.life / cloud.maxLife;
            ctx.fillStyle = `rgba(46, 204, 113, ${alpha * 0.4})`;
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // ガーディアン描画
        for (const g of this.guardians) {
            ctx.fillStyle = '#95a5a6';
            ctx.beginPath();
            ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#7f8c8d';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.lineWidth = 1;
        }
    }

    getWeapons() {
        return Object.keys(this.weapons).map(id => ({
            id,
            type: 'weapon',
            level: this.weapons[id].level,
            ...WEAPON_DEFS[id]
        }));
    }

    getBuffs() {
        return Object.keys(this.buffs).map(id => ({
            id,
            type: 'buff',
            level: this.buffs[id],
            ...BUFF_DEFS[id]
        }));
    }
}