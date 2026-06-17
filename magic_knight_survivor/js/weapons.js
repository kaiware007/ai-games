/**
 * 敵にダメージを与えて、死亡したらマークする（即座に削除しない）
 * 戻り値: true=敵が死亡した, false=生存
 */
function damageEnemy(enemy, damage, game) {
    if (enemy._markedForDeath) return false; // 既に死亡フラグ立ってるならスキップ
    enemy.hp -= damage;
    if (enemy.hp <= 0) {
        enemy._markedForDeath = true; // 死亡フラグを立てる
        game.onEnemyKilled(enemy);
        return true;
    }
    return false;
}

/**
 * 死亡フラグ立った敵を全て削除する（update()の最後に1回だけ呼ぶ）
 */
export function cleanupDeadEnemies(enemies) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i]._markedForDeath) {
            enemies.splice(i, 1);
        }
    }
}

export class WeaponManager {
    constructor(player) {
        this.player = player;
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
        switch (buffId) {
            case 'max_hp_up':
                this.player.maxHp += 15;
                this.player.hp = Math.min(this.player.hp + 15, this.player.maxHp);
                break;
            case 'heal_up':
                this.player.healBonus = (this.player.healBonus || 0) + 10;
                break;
            case 'pickup_range':
                this.player.pickupRangeBonus = (this.player.pickupRangeBonus || 0) + 20;
                break;
            case 'move_speed_up':
                this.player.speedBonus = (this.player.speedBonus || 0) + 8;
                break;
            // atk_up / atk_speed_up / attack_range_up / exp_bonus は getXxxMultiplier() で参照
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

    getPickupRange() {
        return 40 * this.getPickupRangeMultiplier();
    }

    getEnemiesOnScreen(enemies, camera) {
        const margin = 50;
        return enemies.filter(e => {
            if (e._markedForDeath) return false;
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

        // マジックボウル
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

        // 回転剣
        if (this.weapons.spinning_sword) {
            const w = this.weapons.spinning_sword;
            const def = WEAPON_DEFS.spinning_sword;
            const stats = getWeaponStats(def, w.level);
            const rotationMult = this.buffs.atk_speed_up ? (1 + this.buffs.atk_speed_up * 0.08) : 1;
            this.swordAngle += dt * stats.rotationSpeed * rotationMult;
            const rangeMult = 1 + (this.buffs.attack_range_up || 0) * 0.15;
            const swordRange = stats.rotationRadius * rangeMult;
            const swordDamage = stats.damage * atkMult;
            const swordCount = stats.swordCount;

            for (let s = 0; s < swordCount; s++) {
                const a = this.swordAngle + (s * Math.PI * 2 / swordCount);
                const sx = px + Math.cos(a) * swordRange;
                const sy = py + Math.sin(a) * swordRange;
                for (const e of onScreenEnemies) {
                    const d = Math.sqrt((e.x - sx) ** 2 + (e.y - sy) ** 2);
                    if (d < e.radius + 15) {
                        damageEnemy(e, swordDamage * dt, game);
                    }
                }
            }
        }

        // 聖光陣（常時発動・範囲ダメージ）
        if (this.weapons.holy_circle) {
            const w = this.weapons.holy_circle;
            const def = WEAPON_DEFS.holy_circle;
            const stats = getWeaponStats(def, w.level);
            const rangeMult = 1 + (this.buffs.attack_range_up || 0) * 0.15;
            const circleRadius = stats.radius * rangeMult;
            for (const e of onScreenEnemies) {
                const d = Math.sqrt((e.x - px) ** 2 + (e.y - py) ** 2);
                if (d < circleRadius + e.radius) {
                    damageEnemy(e, stats.damage * atkMult * dt, game);
                }
            }
        }

        // 雷撃
        if (this.weapons.thunder) {
            const w = this.weapons.thunder;
            w.cooldown -= dt;
            const def = WEAPON_DEFS.thunder;
            const stats = getWeaponStats(def, w.level);
            const fireRate = Math.max(0.5, stats.cooldown * atkSpeedMult);
            if (w.cooldown <= 0 && onScreenEnemies.length > 0) {
                w.cooldown = fireRate;
                const target = onScreenEnemies[Math.floor(Math.random() * onScreenEnemies.length)];
                damageEnemy(target, stats.damage * atkMult, game);
                this.projectiles.push({
                    x: target.x, y: target.y,
                    vx: 0, vy: 0,
                    damage: 0, radius: 20,
                    color: '#FFD700', life: 0.3, type: 'thunder'
                });
            }
        }

        // ポイズンクラウド
        if (this.weapons.poison_cloud) {
            const w = this.weapons.poison_cloud;
            w.cooldown -= dt;
            const def = WEAPON_DEFS.poison_cloud;
            const stats = getWeaponStats(def, w.level);
            if (w.cooldown <= 0) {
                w.cooldown = stats.cooldown * atkSpeedMult;
                this.poisonClouds.push({
                    x: px, y: py,
                    radius: 40,
                    damage: stats.damage * atkMult,
                    duration: stats.duration,
                    life: stats.duration,
                    tickTimer: 0
                });
            }
            for (let i = this.poisonClouds.length - 1; i >= 0; i--) {
                const cloud = this.poisonClouds[i];
                cloud.life -= dt;
                cloud.tickTimer -= dt;
                if (cloud.life <= 0) {
                    this.poisonClouds.splice(i, 1);
                    continue;
                }
                if (cloud.tickTimer <= 0) {
                    cloud.tickTimer = 0.5;
                    for (const e of onScreenEnemies) {
                        const d = Math.sqrt((e.x - cloud.x) ** 2 + (e.y - cloud.y) ** 2);
                        if (d < cloud.radius + e.radius) {
                            damageEnemy(e, cloud.damage * 0.5, game);
                        }
                    }
                }
            }
        }

        // シャワーオブアロウ
        if (this.weapons.arrow_shower) {
            const w = this.weapons.arrow_shower;
            w.cooldown -= dt;
            const def = WEAPON_DEFS.arrow_shower;
            const stats = getWeaponStats(def, w.level);
            const fireRate = Math.max(0.3, stats.cooldown * atkSpeedMult);
            if (w.cooldown <= 0) {
                w.cooldown = fireRate;
                const rangeMult = 1 + (this.buffs.attack_range_up || 0) * 0.15;
                const spread = 200 * rangeMult;
                for (let i = 0; i < stats.arrowCount; i++) {
                    this.projectiles.push({
                        x: px + (Math.random() - 0.5) * spread,
                        y: py - 300,
                        vx: 0, vy: 400,
                        damage: stats.damage * atkMult,
                        radius: 4,
                        color: def.color,
                        life: 1.5,
                        type: 'arrow'
                    });
                }
            }
        }

        // ガーディアン
        if (this.weapons.guardian) {
            const def = WEAPON_DEFS.guardian;
            const stats = getWeaponStats(def, this.weapons.guardian.level);
            while (this.guardians.length < stats.golemCount) {
                const angle = (this.guardians.length / stats.golemCount) * Math.PI * 2;
                this.guardians.push({ x: px, y: py, attackTimer: 0 });
            }
            while (this.guardians.length > stats.golemCount) {
                this.guardians.pop();
            }
            for (let g = 0; g < this.guardians.length; g++) {
                const guardian = this.guardians[g];
                const orbitAngle = this.swordAngle * 0.5 + (g / this.guardians.length) * Math.PI * 2;
                const tx = px + Math.cos(orbitAngle) * 90;
                const ty = py + Math.sin(orbitAngle) * 90;
                guardian.x += (tx - guardian.x) * dt * 5;
                guardian.y += (ty - guardian.y) * dt * 5;
                guardian.attackTimer -= dt;
                if (guardian.attackTimer <= 0) {
                    guardian.attackTimer = 1.0 * atkSpeedMult;
                    let closest = null, closestDist = 130;
                    for (const e of onScreenEnemies) {
                        const d = Math.sqrt((e.x - guardian.x) ** 2 + (e.y - guardian.y) ** 2);
                        if (d < closestDist) { closestDist = d; closest = e; }
                    }
                    if (closest) {
                        damageEnemy(closest, stats.damage * atkMult, game);
                        this.projectiles.push({
                            x: guardian.x, y: guardian.y,
                            vx: 0, vy: 0,
                            damage: 0, radius: 8,
                            color: '#C0C0C0', life: 0.15, type: 'guardian_hit'
                        });
                    }
                }
            }
        }

        // ホーリークロス
        if (this.weapons.holy_cross) {
            const w = this.weapons.holy_cross;
            w.cooldown -= dt;
            const def = WEAPON_DEFS.holy_cross;
            const stats = getWeaponStats(def, w.level);
            const fireRate = Math.max(0.5, stats.cooldown * atkSpeedMult);
            if (w.cooldown <= 0) {
                w.cooldown = fireRate;
                const rangeMult = 1 + (this.buffs.attack_range_up || 0) * 0.15;
                const speed = 280;
                const travelTime = (stats.range * rangeMult) / speed;
                for (const dir of [{vx:1,vy:0},{vx:-1,vy:0},{vx:0,vy:1},{vx:0,vy:-1}]) {
                    this.projectiles.push({
                        x: px, y: py,
                        vx: dir.vx * speed, vy: dir.vy * speed,
                        damage: stats.damage * atkMult,
                        radius: 8,
                        color: def.color,
                        life: travelTime,
                        type: 'holy_cross',
                        piercing: true
                    });
                }
            }
        }

        // プロジェクタイル更新（移動・衝突・寿命）
        const rangeMult = 1 + (this.buffs.attack_range_up || 0) * 0.15;
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.projectiles.splice(i, 1);
                continue;
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.damage <= 0) continue; // エフェクト専用弾は衝突判定なし

            const hitRadius = p.radius * rangeMult;
            for (const e of onScreenEnemies) {
                const d = Math.sqrt((e.x - p.x) ** 2 + (e.y - p.y) ** 2);
                if (d < e.radius + hitRadius) {
                    const killed = damageEnemy(e, p.damage, game);
                    if (!p.piercing) {
                        this.projectiles.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }

    getWeapons() {
        return Object.entries(this.weapons).map(([id, w]) => ({ id, level: w.level }));
    }

    getBuffs() {
        return Object.entries(this.buffs).map(([id, level]) => ({ id, level }));
    }

    draw(ctx, camera) {
        const px = this.player.getX();
        const py = this.player.getY();

        // 聖光陣オーラ
        if (this.weapons.holy_circle) {
            const stats = getWeaponStats(WEAPON_DEFS.holy_circle, this.weapons.holy_circle.level);
            const rm = 1 + (this.buffs.attack_range_up || 0) * 0.15;
            ctx.save();
            ctx.globalAlpha = 0.18;
            ctx.fillStyle = WEAPON_DEFS.holy_circle.color;
            ctx.beginPath();
            ctx.arc(px, py, stats.radius * rm, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = WEAPON_DEFS.holy_circle.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }

        // 毒雲
        for (const cloud of this.poisonClouds) {
            ctx.save();
            ctx.globalAlpha = 0.4 * (cloud.life / cloud.duration);
            ctx.fillStyle = '#7CFC00';
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 回転剣
        if (this.weapons.spinning_sword) {
            const stats = getWeaponStats(WEAPON_DEFS.spinning_sword, this.weapons.spinning_sword.level);
            const rm = 1 + (this.buffs.attack_range_up || 0) * 0.15;
            const swordRange = stats.rotationRadius * rm;
            for (let s = 0; s < stats.swordCount; s++) {
                const a = this.swordAngle + (s * Math.PI * 2 / stats.swordCount);
                const sx = px + Math.cos(a) * swordRange;
                const sy = py + Math.sin(a) * swordRange;
                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(a + Math.PI / 4);
                ctx.fillStyle = WEAPON_DEFS.spinning_sword.color;
                ctx.fillRect(-12, -3, 24, 6);
                ctx.restore();
            }
        }

        // ガーディアン
        for (const g of this.guardians) {
            ctx.save();
            ctx.fillStyle = '#808080';
            ctx.strokeStyle = '#C0C0C0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(g.x, g.y, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        // プロジェクタイル
        for (const p of this.projectiles) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, p.life * 4);
            if (p.type === 'thunder') {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y - 120);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
                ctx.fillStyle = '#FFF8DC';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = p.color || '#fff';
                ctx.shadowColor = p.color || '#fff';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }
}

// ── 武器定義 ──────────────────────────────────────────────────
export const WEAPON_DEFS = {
    magic_bowl: {
        name: 'マジックボウル', desc: '最も近い敵に魔法弾を発射',
        color: '#00BFFF',
        damage: 15, cooldown: 1.2, bulletCount: 1,
        levelEffects: [
            { bulletCount: 1 },
            { damage: 5 },
            { bulletCount: 1 },
            { damage: 10 }
        ]
    },
    spinning_sword: {
        name: '回転剣', desc: '周囲を剣が回転して近接攻撃',
        color: '#C0C0C0',
        damage: 12, rotationRadius: 80, rotationSpeed: 2.5, swordCount: 1,
        levelEffects: [
            { rotationRadius: 16 },
            { damage: 5 },
            { swordCount: 1 },
            { damage: 10 }
        ]
    },
    holy_circle: {
        name: '聖光陣', desc: '周囲に光の陣を張り範囲ダメージ',
        color: '#FFD700',
        damage: 8, radius: 100,
        levelEffects: [
            { radius: 15 },
            { damage: 3 },
            { radius: 15 },
            { damage: 5 }
        ]
    },
    thunder: {
        name: '雷撃', desc: 'ランダムな敵に雷を落とす',
        color: '#FFD700',
        damage: 35, cooldown: 3.0,
        levelEffects: [
            { damage: 10 },
            { cooldown: -0.3 },
            { damage: 15 },
            { cooldown: -0.5 }
        ]
    },
    poison_cloud: {
        name: 'ポイズンクラウド', desc: '歩いた跡に残る毒雲',
        color: '#7CFC00',
        damage: 5, cooldown: 2.0, duration: 3,
        levelEffects: [
            { duration: 1 },
            { damage: 2 },
            { duration: 1 },
            { damage: 3 }
        ]
    },
    arrow_shower: {
        name: 'シャワーオブアロウ', desc: '上空から矢が降る',
        color: '#8B4513',
        damage: 12, cooldown: 1.5, arrowCount: 3,
        levelEffects: [
            { arrowCount: 2 },
            { damage: 5 },
            { arrowCount: 2 },
            { damage: 8 }
        ]
    },
    guardian: {
        name: 'ガーディアン', desc: '味方ゴーレムを召喚',
        color: '#808080',
        damage: 25, cooldown: 2.0, golemCount: 1,
        levelEffects: [
            { damage: 8 },
            { golemCount: 1 },
            { damage: 12 },
            { golemCount: 1 }
        ]
    },
    holy_cross: {
        name: 'ホーリークロス', desc: '縦横に光の十字架を放つ',
        color: '#FFFFFF',
        damage: 18, cooldown: 2.5, range: 250,
        levelEffects: [
            { damage: 5 },
            { range: 38 },
            { damage: 8 },
            { range: 38 }
        ]
    }
};

export const BUFF_DEFS = {
    max_hp_up:      { name: 'マックスHPアップ',     desc: '最大HP +15',              color: '#FF6B6B', icon: '❤️' },
    heal_up:        { name: '回復量アップ',         desc: 'ハート回復量 +10',          color: '#FF69B4', icon: '💊' },
    atk_up:         { name: '攻撃力アップ',         desc: '全武器ダメージ +10%',        color: '#FF4500', icon: '⚔️' },
    atk_speed_up:   { name: '攻撃速度アップ',       desc: 'クールダウン -8%',           color: '#FFA500', icon: '⚡' },
    attack_range_up:{ name: '攻撃範囲拡大',         desc: '武器の弾・判定サイズ +15%',  color: '#9B59B6', icon: '🔮' },
    exp_bonus:      { name: '経験値ボーナス',       desc: '経験値獲得量 +15%',          color: '#2ECC71', icon: '✨' },
    pickup_range:   { name: 'アイテム取得範囲アップ', desc: '取得範囲 +20%',            color: '#3498DB', icon: '🧲' },
    move_speed_up:  { name: '移動速度アップ',       desc: '移動速度 +8%',               color: '#1ABC9C', icon: '👟' }
};

export function getWeaponStats(def, level) {
    const stats = { ...def };
    const effects = def.levelEffects || [];
    for (let i = 0; i < level - 1 && i < effects.length; i++) {
        for (const [key, val] of Object.entries(effects[i])) {
            stats[key] = (stats[key] || 0) + val;
        }
    }
    return stats;
}
