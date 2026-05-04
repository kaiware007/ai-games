// 武器定義
export const WEAPON_DEFS = {
    magic_bowl: { name: 'マジックボウル', desc: '最も近い敵に魔法弾を発射', color: '#9b59b6' },
    spinning_sword: { name: '回転剣', desc: '周囲を剣が回転して近接攻撃', color: '#e74c3c' },
    holy_circle: { name: '聖光陣', desc: '周囲に光の陣を張り範囲ダメージ', color: '#f39c12' },
    thunder: { name: '雷撃', desc: 'ランダムな敵に雷を落とす', color: '#3498db' },
    poison_cloud: { name: 'ポイズンクラウド', desc: '歩いた跡に残る毒雲', color: '#2ecc71' },
    arrow_shower: { name: 'シャワーオブアロウ', desc: '上空から矢が降る', color: '#1abc9c' },
    guardian: { name: 'ガーディアン', desc: '味方ゴーレムを召喚', color: '#95a5a6' },
    holy_cross: { name: 'ホーリークロス', desc: '縦横に光の十字架を放つ', color: '#f1c40f' }
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
                // ハートアイテムの回復量ボーナス（playerに保存）
                this.player.healBonus = (this.player.healBonus || 0) + 10;
                break;
            case 'atk_up':
                // ダメージ倍率（後で計算時に使う）
                break;
            case 'atk_speed_up':
                // クールダウン短縮倍率
                break;
            case 'exp_bonus':
                // 経験値ボーナス倍率
                break;
            case 'pickup_range':
                // 取得範囲拡大（playerに保存）
                this.player.pickupRangeBonus = (this.player.pickupRangeBonus || 0) + 20;
                break;
            case 'move_speed_up':
                this.player.speedBonus = (this.player.speedBonus || 0) + 8;
                break;
        }
    }

    // バフのダメージ倍率
    getAttackMultiplier() {
        const level = this.buffs.atk_up || 0;
        return 1 + level * 0.10;
    }

    // バフの攻撃速度倍率（小さいほど速い）
    getAttackSpeedMultiplier() {
        const level = this.buffs.atk_speed_up || 0;
        return Math.max(0.2, 1 - level * 0.08);
    }

    // バフの経験値倍率
    getExpMultiplier() {
        const level = this.buffs.exp_bonus || 0;
        return 1 + level * 0.15;
    }

    // バフの取得範囲倍率
    getPickupRangeMultiplier() {
        const level = this.buffs.pickup_range || 0;
        return 1 + level * 0.20;
    }

    // 画面内の敵のみをフィルタリング
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

        // 画面内の敵のみを取得
        const onScreenEnemies = this.getEnemiesOnScreen(enemies, game.camera);

        // マジックボウル
        if (this.weapons.magic_bowl) {
            const w = this.weapons.magic_bowl;
            w.cooldown -= dt;
            const fireRate = Math.max(0.3, (1.0 - w.level * 0.08) * atkSpeedMult);
            const bulletCount = Math.min(w.level, 5);
            if (w.cooldown <= 0 && onScreenEnemies.length > 0) {
                w.cooldown = fireRate;
                let closest = null, closestDist = Infinity;
                for (const e of onScreenEnemies) {
                    const d = Math.sqrt((e.x - px) ** 2 + (e.y - py) ** 2);
                    if (d < closestDist) { closestDist = d; closest = e; }
                }
                if (closest) {
                    const angle = Math.atan2(closest.y - py, closest.x - px);
                    for (let i = 0; i < bulletCount; i++) {
                        const spread = (i - (bulletCount - 1) / 2) * 0.15;
                        this.projectiles.push({
                            x: px, y: py,
                            vx: Math.cos(angle + spread) * 300,
                            vy: Math.sin(angle + spread) * 300,
                            damage: (10 + w.level * 5) * atkMult,
                            radius: 5,
                            color: WEAPON_DEFS.magic_bowl.color,
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
            this.swordAngle += dt * (3 + w.level * 0.5);
            const swordCount = Math.min(1 + Math.floor(w.level / 2), 4);
            const swordRange = 40 + w.level * 5;
            const swordDamage = (15 + w.level * 5) * atkMult;

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

        // 聖光陣
        if (this.weapons.holy_circle) {
            const w = this.weapons.holy_circle;
            this.holyCircleTimer += dt;
            const range = 80 + w.level * 15;
            const damage = (5 + w.level * 3) * atkMult;

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

        // 雷撃
        if (this.weapons.thunder) {
            const w = this.weapons.thunder;
            this.thunderTimer -= dt;
            const rate = Math.max(0.5, (2.0 - w.level * 0.15) * atkSpeedMult);
            const damage = (20 + w.level * 10) * atkMult;
            const strikeCount = Math.min(w.level, 5);

            if (this.thunderTimer <= 0 && onScreenEnemies.length > 0) {
                this.thunderTimer = rate;
                for (let i = 0; i < strikeCount; i++) {
                    const target = onScreenEnemies[Math.floor(Math.random() * onScreenEnemies.length)];
                    if (target) {
                        this.projectiles.push({
                            x: target.x, y: target.y - 50,
                            targetX: target.x, targetY: target.y,
                            damage: damage,
                            life: 0.3,
                            type: 'thunder',
                            color: WEAPON_DEFS.thunder.color
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

        // ポイズンクラウド
        if (this.weapons.poison_cloud) {
            const w = this.weapons.poison_cloud;
            const dir = game.input.getMoveDirection();
            if (Math.abs(dir.x) > 0.1 || Math.abs(dir.y) > 0.1) {
                w.cooldown = (w.cooldown || 0) - dt;
                if (w.cooldown <= 0) {
                    w.cooldown = 0.5 * atkSpeedMult;
                    this.poisonClouds.push({
                        x: px, y: py,
                        radius: 20 + w.level * 5,
                        damage: (3 + w.level * 2) * atkMult,
                        life: 3,
                        maxLife: 3
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

        // シャワーオブアロウ
        if (this.weapons.arrow_shower) {
            const w = this.weapons.arrow_shower;
            this.arrowTimer -= dt;
            const rate = Math.max(0.2, (1.0 - w.level * 0.1) * atkSpeedMult);
            const arrowCount = Math.min(w.level, 8);

            if (this.arrowTimer <= 0) {
                this.arrowTimer = rate;
                for (let i = 0; i < arrowCount; i++) {
                    const ax = px + (Math.random() - 0.5) * 200;
                    const ay = py + (Math.random() - 0.5) * 200;
                    this.projectiles.push({
                        x: ax, y: ay - 100,
                        vx: (Math.random() - 0.5) * 30,
                        vy: 250 + Math.random() * 100,
                        damage: (8 + w.level * 3) * atkMult,
                        radius: 3,
                        life: 2,
                        type: 'arrow',
                        color: WEAPON_DEFS.arrow_shower.color
                    });
                }
            }
        }

        // ガーディアン
        if (this.weapons.guardian) {
            const w = this.weapons.guardian;
            const guardianCount = Math.min(w.level, 3);

            while (this.guardians.length < guardianCount) {
                const angle = Math.random() * Math.PI * 2;
                this.guardians.push({
                    x: px + Math.cos(angle) * 60,
                    y: py + Math.sin(angle) * 60,
                    damage: (10 + w.level * 5) * atkMult,
                    radius: 12,
                    cooldown: 0,
                    angle: 0
                });
            }

            for (const g of this.guardians) {
                g.cooldown -= dt;
                g.angle += dt * 2;
                g.x = px + Math.cos(g.angle) * 60;
                g.y = py + Math.sin(g.angle) * 60;

                if (g.cooldown <= 0) {
                    g.cooldown = 0.8 * atkSpeedMult;
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
                            color: WEAPON_DEFS.guardian.color
                        });
                    }
                }
            }
        }

        // ホーリークロス
        if (this.weapons.holy_cross) {
            const w = this.weapons.holy_cross;
            this.crossTimer -= dt;
            const rate = Math.max(0.8, (2.5 - w.level * 0.15) * atkSpeedMult);
            const damage = (12 + w.level * 5) * atkMult;

            if (this.crossTimer <= 0 && onScreenEnemies.length > 0) {
                this.crossTimer = rate;
                const crossSize = 100 + w.level * 20;
                this.projectiles.push({
                    x: px, y: py,
                    width: 6, height: crossSize * 2,
                    damage: damage,
                    life: 0.4,
                    type: 'holy_cross',
                    color: WEAPON_DEFS.holy_cross.color
                });
                this.projectiles.push({
                    x: px, y: py,
                    width: crossSize * 2, height: 6,
                    damage: damage,
                    life: 0.4,
                    type: 'holy_cross',
                    color: WEAPON_DEFS.holy_cross.color
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

        if (this.weapons.spinning_sword) {
            const w = this.weapons.spinning_sword;
            const swordCount = Math.min(1 + Math.floor(w.level / 2), 4);
            const swordRange = 40 + w.level * 5;
            const px = this.player.getX();
            const py = this.player.getY();

            for (let s = 0; s < swordCount; s++) {
                const a = this.swordAngle + (s * Math.PI * 2 / swordCount);
                const sx = px + Math.cos(a) * swordRange;
                const sy = py + Math.sin(a) * swordRange;

                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.arc(sx, sy, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#c0392b';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.lineWidth = 1;
            }
        }

        if (this.weapons.holy_circle) {
            const w = this.weapons.holy_circle;
            const range = 80 + w.level * 15;
            const px = this.player.getX();
            const py = this.player.getY();

            ctx.strokeStyle = 'rgba(243, 156, 18, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, range, 0, Math.PI * 2);
            ctx.stroke();
            ctx.lineWidth = 1;
        }

        for (const cloud of this.poisonClouds) {
            const alpha = cloud.life / cloud.maxLife;
            ctx.fillStyle = `rgba(46, 204, 113, ${alpha * 0.4})`;
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            ctx.fill();
        }

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