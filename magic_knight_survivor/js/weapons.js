const WEAPON_CONFIG = {
    magic_bowl: {
        name: 'マジックボウル',
        damage: 15,
        cooldown: 0.8,
        bulletSpeed: 400,
        bulletSize: 6,
        color: '#4FC3F7'
    },
    spinning_sword: {
        name: '回転剣',
        damage: 20,
        cooldown: 0, // 常時回転
        rotationSpeed: 3,
        swordLength: 40,
        swordWidth: 8,
        color: '#FFD700'
    },
    holy_aura: {
        name: '聖光陣',
        damage: 10,
        cooldown: 2.0,
        radius: 80,
        color: '#FFF176'
    },
    thunder: {
        name: '雷撃',
        damage: 30,
        cooldown: 2.5,
        hitRadius: 40,
        color: '#FFEB3B'
    },
    poison_cloud: {
        name: 'ポイズンクラウド',
        damage: 5,
        cooldown: 0.5,
        cloudRadius: 30,
        cloudDuration: 3.0,
        color: '#9C27B0'
    },
    shower_of_arrows: {
        name: 'シャワーオブアロウ',
        damage: 12,
        cooldown: 1.5,
        arrowCount: 5,
        arrowSpeed: 300,
        color: '#8BC34A'
    },
    guardian: {
        name: 'ガーディアン',
        damage: 25,
        cooldown: 0, // 常時攻撃
        summonCount: 1,
        guardianSpeed: 150,
        color: '#795548'
    },
    holy_cross: {
        name: 'ホーリークロス',
        damage: 18,
        cooldown: 1.8,
        beamLength: 200,
        beamWidth: 12,
        color: '#FFFFFF'
    }
};

export class WeaponSystem {
    constructor(player, bullets, enemies) {
        this.player = player;
        this.bullets = bullets;
        this.enemies = enemies;
        this.cooldowns = {};
        this.poisonClouds = [];
        this.guardians = [];
        this.swordAngle = 0;
    }

    init() {
        this.cooldowns = {};
        this.poisonClouds = [];
        this.guardians = [];
        this.swordAngle = 0;
    }

    update(dt, player, enemies) {
        // クールダウン更新
        for (const key in this.cooldowns) {
            if (this.cooldowns[key] > 0) {
                this.cooldowns[key] -= dt;
            }
        }

        // 各武器の更新
        const weapons = player.getWeapons();
        for (const weapon of weapons) {
            const config = WEAPON_CONFIG[weapon.id];
            if (!config) continue;

            switch (weapon.id) {
                case 'magic_bowl':
                    this.updateMagicBowl(dt, weapon, config, player, enemies);
                    break;
                case 'spinning_sword':
                    this.updateSpinningSword(dt, weapon, config, player, enemies);
                    break;
                case 'holy_aura':
                    this.updateHolyAura(dt, weapon, config, player, enemies);
                    break;
                case 'thunder':
                    this.updateThunder(dt, weapon, config, player, enemies);
                    break;
                case 'poison_cloud':
                    this.updatePoisonCloud(dt, weapon, config, player, enemies);
                    break;
                case 'shower_of_arrows':
                    this.updateShowerOfArrows(dt, weapon, config, player, enemies);
                    break;
                case 'guardian':
                    this.updateGuardian(dt, weapon, config, player, enemies);
                    break;
                case 'holy_cross':
                    this.updateHolyCross(dt, weapon, config, player, enemies);
                    break;
            }
        }

        // 毒雲の更新
        for (let i = this.poisonClouds.length - 1; i >= 0; i--) {
            const cloud = this.poisonClouds[i];
            cloud.timer -= dt;
            cloud.damageTimer -= dt;
            
            if (cloud.damageTimer <= 0) {
                cloud.damageTimer = 0.5;
                // 範囲内の敵にダメージ
                for (const enemy of enemies.getEnemies()) {
                    const dx = enemy.x - cloud.x;
                    const dy = enemy.y - cloud.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < cloud.radius) {
                        // ダメージはbulletとして処理
                        this.bullets.add({
                            x: enemy.x,
                            y: enemy.y,
                            vx: 0, vy: 0,
                            damage: cloud.damage,
                            size: 0,
                            active: true,
                            isDamageOnly: true,
                            targetId: enemy.id
                        });
                    }
                }
            }
            
            if (cloud.timer <= 0) {
                this.poisonClouds.splice(i, 1);
            }
        }

        // ガーディアンの更新
        for (const guardian of this.guardians) {
            // 最も近い敵へ追従
            let nearestEnemy = null;
            let nearestDist = Infinity;
            for (const enemy of enemies.getEnemies()) {
                const dx = enemy.x - guardian.x;
                const dy = enemy.y - guardian.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestEnemy = enemy;
                }
            }

            if (nearestEnemy && nearestDist > 20) {
                const dx = nearestEnemy.x - guardian.x;
                const dy = nearestEnemy.y - guardian.y;
                guardian.x += (dx / nearestDist) * guardian.speed * dt;
                guardian.y += (dy / nearestDist) * guardian.speed * dt;
            }

            // 攻撃クールダウン
            guardian.attackCooldown -= dt;
            if (guardian.attackCooldown <= 0 && nearestEnemy) {
                guardian.attackCooldown = 1.0;
                // 近接攻撃
                if (nearestDist < 50) {
                    this.bullets.add({
                        x: nearestEnemy.x,
                        y: nearestEnemy.y,
                        vx: 0, vy: 0,
                        damage: guardian.damage,
                        size: 0,
                        active: true,
                        isDamageOnly: true,
                        targetId: nearestEnemy.id
                    });
                }
            }
        }
    }

    updateMagicBowl(dt, weapon, config, player, enemies) {
        if (!this.cooldowns['magic_bowl']) this.cooldowns['magic_bowl'] = 0;
        if (this.cooldowns['magic_bowl'] > 0) return;

        const cooldown = config.cooldown / (1 + (weapon.level - 1) * 0.15);
        this.cooldowns['magic_bowl'] = cooldown;

        // 最も近い敵を探す
        const enemyList = enemies.getEnemies();
        if (enemyList.length === 0) return;

        let nearest = null;
        let nearestDist = Infinity;
        for (const enemy of enemyList) {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }

        if (nearest) {
            const dx = nearest.x - player.x;
            const dy = nearest.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const speed = config.bulletSpeed * (1 + (weapon.level - 1) * 0.1);
            const damage = config.damage * weapon.level;
            const size = config.bulletSize + (weapon.level - 1) * 2;

            // 弾数をレベルで増加
            const bulletCount = Math.min(1 + Math.floor((weapon.level - 1) / 3), 5);
            
            for (let i = 0; i < bulletCount; i++) {
                const spread = (i - (bulletCount - 1) / 2) * 0.2;
                const angle = Math.atan2(dy, dx) + spread;
                
                this.bullets.add({
                    x: player.x,
                    y: player.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    damage: damage,
                    size: size,
                    active: true,
                    color: config.color,
                    type: 'magic_bowl'
                });
            }
        }
    }

    updateSpinningSword(dt, weapon, config, player, enemies) {
        const rotationSpeed = config.rotationSpeed * (1 + (weapon.level - 1) * 0.3);
        this.swordAngle += rotationSpeed * dt;

        const swordLength = config.swordLength + (weapon.level - 1) * 5;
        const swordCount = Math.min(1 + Math.floor((weapon.level - 1) / 2), 4);

        for (let s = 0; s < swordCount; s++) {
            const angle = this.swordAngle + (s * Math.PI * 2) / swordCount;
            const swordX = player.x + Math.cos(angle) * swordLength;
            const swordY = player.y + Math.sin(angle) * swordLength;

            // 範囲内の敵にダメージ
            for (const enemy of enemies.getEnemies()) {
                const dx = enemy.x - swordX;
                const dy = enemy.y - swordY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < config.swordWidth + enemy.size) {
                    // 1フレームに1回だけダメージ
                    if (!enemy.swordHitTimer || enemy.swordHitTimer <= 0) {
                        enemy.swordHitTimer = 0.3;
                        this.bullets.add({
                            x: enemy.x,
                            y: enemy.y,
                            vx: 0, vy: 0,
                            damage: config.damage * weapon.level,
                            size: 0,
                            active: true,
                            isDamageOnly: true,
                            targetId: enemy.id
                        });
                    }
                }
            }
            if (enemy.swordHitTimer) enemy.swordHitTimer -= dt;
        }
    }

    updateHolyAura(dt, weapon, config, player, enemies) {
        if (!this.cooldowns['holy_aura']) this.cooldowns['holy_aura'] = 0;
        if (this.cooldowns['holy_aura'] > 0) return;

        const cooldown = config.cooldown / (1 + (weapon.level - 1) * 0.1);
        this.cooldowns['holy_aura'] = cooldown;

        const radius = config.radius + (weapon.level - 1) * 10;
        const damage = config.damage * weapon.level;

        for (const enemy of enemies.getEnemies()) {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius + enemy.size) {
                this.bullets.add({
                    x: enemy.x,
                    y: enemy.y,
                    vx: 0, vy: 0,
                    damage: damage,
                    size: 0,
                    active: true,
                    isDamageOnly: true,
                    targetId: enemy.id
                });
            }
        }
    }

    updateThunder(dt, weapon, config, player, enemies) {
        if (!this.cooldowns['thunder']) this.cooldowns['thunder'] = 0;
        if (this.cooldowns['thunder'] > 0) return;

        const cooldown = config.cooldown / (1 + (weapon.level - 1) * 0.1);
        this.cooldowns['thunder'] = cooldown;

        const enemyList = enemies.getEnemies();
        if (enemyList.length === 0) return;

        // ランダムな敵を選択
        const target = enemyList[Math.floor(Math.random() * enemyList.length)];
        const damage = config.damage * weapon.level;

        this.bullets.add({
            x: target.x,
            y: target.y,
            vx: 0, vy: 0,
            damage: damage,
            size: config.hitRadius,
            active: true,
            isDamageOnly: true,
            targetId: target.id,
            color: config.color,
            type: 'thunder'
        });
    }

    updatePoisonCloud(dt, weapon, config, player, enemies) {
        if (!this.cooldowns['poison_cloud']) this.cooldowns['poison_cloud'] = 0;
        if (this.cooldowns['poison_cloud'] > 0) return;

        // 移動中は毒雲を残す
        const dir = player.input ? player.input.getMoveDirection() : { dx: 0, dy: 0 };
        if (dir.dx === 0 && dir.dy === 0 && !player.input?.isTouchActive()) return;

        this.cooldowns['poison_cloud'] = config.cooldown;
        const damage = config.damage * weapon.level;
        const radius = config.cloudRadius + (weapon.level - 1) * 5;

        this.poisonClouds.push({
            x: player.x,
            y: player.y,
            radius: radius,
            damage: damage,
            timer: config.cloudDuration,
            damageTimer: 0,
            color: config.color
        });
    }

    updateShowerOfArrows(dt, weapon, config, player, enemies) {
        if (!this.cooldowns['shower_of_arrows']) this.cooldowns['shower_of_arrows'] = 0;
        if (this.cooldowns['shower_of_arrows'] > 0) return;

        const cooldown = config.cooldown / (1 + (weapon.level - 1) * 0.1);
        this.cooldowns['shower_of_arrows'] = cooldown;

        const arrowCount = config.arrowCount + (weapon.level - 1) * 2;
        const damage = config.damage * weapon.level;

        for (let i = 0; i < arrowCount; i++) {
            const offsetX = (Math.random() - 0.5) * 200;
            const offsetY = (Math.random() - 0.5) * 200;
            
            this.bullets.add({
                x: player.x + offsetX,
                y: player.y + offsetY - 100,
                vx: (Math.random() - 0.5) * 50,
                vy: config.arrowSpeed,
                damage: damage,
                size: 4,
                active: true,
                color: config.color,
                type: 'arrow'
            });
        }
    }

    updateGuardian(dt, weapon, config, player, enemies) {
        // ガーディアンを召喚（レベルに応じて増やす）
        const summonCount = Math.min(config.summonCount + Math.floor((weapon.level - 1) / 2), 4);
        
        while (this.guardians.length < summonCount) {
            this.guardians.push({
                x: player.x + (Math.random() - 0.5) * 60,
                y: player.y + (Math.random() - 0.5) * 60,
                speed: config.guardianSpeed,
                damage: config.damage * weapon.level,
                attackCooldown: 0,
                color: config.color
            });
        }
    }

    updateHolyCross(dt, weapon, config, player, enemies) {
        if (!this.cooldowns['holy_cross']) this.cooldowns['holy_cross'] = 0;
        if (this.cooldowns['holy_cross'] > 0) return;

        const cooldown = config.cooldown / (1 + (weapon.level - 1) * 0.1);
        this.cooldowns['holy_cross'] = cooldown;

        const damage = config.damage * weapon.level;
        const beamLength = config.beamLength + (weapon.level - 1) * 20;
        const beamWidth = config.beamWidth;

        // 縦横のビーム
        const beams = [
            { x1: player.x - beamLength, y1: player.y, x2: player.x + beamLength, y2: player.y },
            { x1: player.x, y1: player.y - beamLength, x2: player.x, y2: player.y + beamLength }
        ];

        for (const beam of beams) {
            for (const enemy of enemies.getEnemies()) {
                // 敵がビーム範囲内か判定
                const minX = Math.min(beam.x1, beam.x2) - beamWidth / 2;
                const maxX = Math.max(beam.x1, beam.x2) + beamWidth / 2;
                const minY = Math.min(beam.y1, beam.y2) - beamWidth / 2;
                const maxY = Math.max(beam.y1, beam.y2) + beamWidth / 2;

                if (enemy.x > minX && enemy.x < maxX && enemy.y > minY && enemy.y < maxY) {
                    this.bullets.add({
                        x: enemy.x,
                        y: enemy.y,
                        vx: 0, vy: 0,
                        damage: damage,
                        size: 0,
                        active: true,
                        isDamageOnly: true,
                        targetId: enemy.id
                    });
                }
            }
        }
    }

    addWeapon(weaponId) {
        this.player.addWeapon(weaponId);
    }

    getWeaponLevel(weaponId) {
        const weapon = this.player.weapons.find(w => w.id === weaponId);
        return weapon ? weapon.level : 0;
    }

    draw(ctx, cameraX, cameraY, player) {
        // 毒雲
        for (const cloud of this.poisonClouds) {
            const screenX = cloud.x - cameraX;
            const screenY = cloud.y - cameraY;
            
            if (screenX < -50 || screenX > 850 || screenY < -50 || screenY > 650) continue;

            ctx.globalAlpha = 0.4 * (cloud.timer / 3.0);
            ctx.fillStyle = cloud.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, cloud.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // ガーディアン
        for (const guardian of this.guardians) {
            const screenX = guardian.x - cameraX;
            const screenY = guardian.y - cameraY;
            
            if (screenX < -50 || screenX > 850 || screenY < -50 || screenY > 650) continue;

            ctx.fillStyle = guardian.color;
            ctx.fillRect(screenX - 12, screenY - 12, 24, 24);
            
            // 目
            ctx.fillStyle = '#FF5722';
            ctx.fillRect(screenX - 6, screenY - 4, 4, 4);
            ctx.fillRect(screenX + 2, screenY - 4, 4, 4);
        }

        // 回転剣の視覚表現
        const weapons = player.getWeapons();
        const spinningSword = weapons.find(w => w.id === 'spinning_sword');
        if (spinningSword) {
            const config = WEAPON_CONFIG.spinning_sword;
            const swordLength = config.swordLength + (spinningSword.level - 1) * 5;
            const swordCount = Math.min(1 + Math.floor((spinningSword.level - 1) / 2), 4);

            for (let s = 0; s < swordCount; s++) {
                const angle = this.swordAngle + (s * Math.PI * 2) / swordCount;
                const swordX = player.x + Math.cos(angle) * swordLength;
                const swordY = player.y + Math.sin(angle) * swordLength;
                const screenX = swordX - cameraX;
                const screenY = swordY - cameraY;

                ctx.fillStyle = config.color;
                ctx.save();
                ctx.translate(screenX, screenY);
                ctx.rotate(angle + Math.PI / 2);
                ctx.fillRect(-config.swordWidth / 2, -15, config.swordWidth, 30);
                ctx.restore();
            }
        }
    }
}
