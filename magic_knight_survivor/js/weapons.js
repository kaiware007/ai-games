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

export class WeaponManager {
    constructor(player) {
        this.player = player;
        this.weapons = {}; // { weaponId: { level, cooldown, ... } }
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

    upgradeWeapon(weaponId) {
        if (this.weapons[weaponId]) {
            this.weapons[weaponId].level += 1;
        }
    }

    update(dt, enemies, game) {
        const px = this.player.getX();
        const py = this.player.getY();

        // マジックボウル
        if (this.weapons.magic_bowl) {
            const w = this.weapons.magic_bowl;
            w.cooldown -= dt;
            const fireRate = Math.max(0.3, 1.0 - w.level * 0.08);
            const bulletCount = Math.min(w.level, 5);
            if (w.cooldown <= 0 && enemies.length > 0) {
                w.cooldown = fireRate;
                // 最も近い敵をターゲット
                let closest = null, closestDist = Infinity;
                for (const e of enemies) {
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
                            damage: 10 + w.level * 5,
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
            const swordDamage = 15 + w.level * 5;

            for (let s = 0; s < swordCount; s++) {
                const a = this.swordAngle + (s * Math.PI * 2 / swordCount);
                const sx = px + Math.cos(a) * swordRange;
                const sy = py + Math.sin(a) * swordRange;

                for (let i = enemies.length - 1; i >= 0; i--) {
                    const e = enemies[i];
                    const d = Math.sqrt((e.x - sx) ** 2 + (e.y - sy) ** 2);
                    if (d < e.radius + 15) {
                        e.hp -= swordDamage * dt;
                        if (e.hp <= 0) {
                            game.onEnemyKilled(e);
                            enemies.splice(i, 1);
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
            const damage = 5 + w.level * 3;

            if (this.holyCircleTimer >= 1.0) {
                this.holyCircleTimer = 0;
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const e = enemies[i];
                    const d = Math.sqrt((e.x - px) ** 2 + (e.y - py) ** 2);
                    if (d < range) {
                        e.hp -= damage;
                        if (e.hp <= 0) {
                            game.onEnemyKilled(e);
                            enemies.splice(i, 1);
                        }
                    }
                }
            }
        }

        // 雷撃
        if (this.weapons.thunder) {
            const w = this.weapons.thunder;
            this.thunderTimer -= dt;
            const rate = Math.max(0.5, 2.0 - w.level * 0.15);
            const damage = 20 + w.level * 10;
            const strikeCount = Math.min(w.level, 5);

            if (this.thunderTimer <= 0 && enemies.length > 0) {
                this.thunderTimer = rate;
                for (let i = 0; i < strikeCount; i++) {
                    const target = enemies[Math.floor(Math.random() * enemies.length)];
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
                    w.cooldown = 0.5;
                    this.poisonClouds.push({
                        x: px, y: py,
                        radius: 20 + w.level * 5,
                        damage: 3 + w.level * 2,
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
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    const d = Math.sqrt((e.x - cloud.x) ** 2 + (e.y - cloud.y) ** 2);
                    if (d < cloud.radius + e.radius) {
                        e.hp -= cloud.damage * dt;
                        if (e.hp <= 0) {
                            game.onEnemyKilled(e);
                            enemies.splice(j, 1);
                        }
                    }
                }
            }
        }

        // シャワーオブアロウ
        if (this.weapons.arrow_shower) {
            const w = this.weapons.arrow_shower;
            this.arrowTimer -= dt;
            const rate = Math.max(0.2, 1.0 - w.level * 0.1);
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
                        damage: 8 + w.level * 3,
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
                    damage: 10 + w.level * 5,
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
                    g.cooldown = 0.8;
                    // 最も近い敵を攻撃
                    let closest = null, closestDist = Infinity;
                    for (const e of enemies) {
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
            const rate = Math.max(0.8, 2.5 - w.level * 0.15);
            const damage = 12 + w.level * 5;

            if (this.crossTimer <= 0 && enemies.length > 0) {
                this.crossTimer = rate;
                const crossSize = 100 + w.level * 20;
                // 縦線
                this.projectiles.push({
                    x: px, y: py,
                    width: 6, height: crossSize * 2,
                    damage: damage,
                    life: 0.4,
                    type: 'holy_cross',
                    color: WEAPON_DEFS.holy_cross.color
                });
                // 横線
                this.projectiles.push({
                    x: px, y: py,
                    width: crossSize * 2, height: 6,
                    damage: damage,
                    life: 0.4,
                    type: 'holy_cross',
                    color: WEAPON_DEFS.holy_cross.color
                });

                // 十字範囲内の敵をダメージ
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const e = enemies[i];
                    if (Math.abs(e.x - px) < crossSize && Math.abs(e.y - py) < crossSize) {
                        // 十字線上に近い敵だけ
                        const onVertical = Math.abs(e.x - px) < 10;
                        const onHorizontal = Math.abs(e.y - py) < 10;
                        if (onVertical || onHorizontal) {
                            e.hp -= damage;
                            if (e.hp <= 0) {
                                game.onEnemyKilled(e);
                                enemies.splice(i, 1);
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

            // 敵との衝突（雷撃とホーリークロスは既に対処済み）
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
        // プロジェクタイル描画
        for (const p of this.projectiles) {
            ctx.fillStyle = p.color || '#fff';

            if (p.type === 'thunder') {
                // 雷の描画
                ctx.strokeStyle = '#f1c40f';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.targetX, p.targetY);
                ctx.stroke();
                ctx.lineWidth = 1;
            } else if (p.type === 'holy_cross') {
                // 十字の描画
                ctx.globalAlpha = 0.7;
                ctx.fillRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);
                ctx.globalAlpha = 1;
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius || 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 回転剣の描画
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

        // 聖光陣の描画
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
            level: this.weapons[id].level,
            ...WEAPON_DEFS[id]
        }));
    }
}