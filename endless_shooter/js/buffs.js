export class Buffs {
    constructor() {
        this.buffLevels = {};
        this.maxLevel = 5;
        this.maxEquippedTypes = 3;
    }

    applyBuff(type) {
        if (!this.buffLevels[type]) {
            this.buffLevels[type] = 1;
        } else {
            this.buffLevels[type] = Math.min(this.maxLevel, this.buffLevels[type] + 1);
        }
    }

    getEquippedBuffCount() {
        return Object.keys(this.buffLevels).length;
    }

    getFireRateMultiplier() {
        const level = this.buffLevels['fireRateUp'] || 0;
        return 1 + level * 0.15;
    }

    getDamageMultiplier() {
        const level = this.buffLevels['damageUp'] || 0;
        return 1 + level * 0.2;
    }

    getSpeedMultiplier() {
        const level = this.buffLevels['speedUp'] || 0;
        return 1 + level * 0.15;
    }

    getXpGainMultiplier() {
        const level = this.buffLevels['xpGainUp'] || 0;
        return 1 + level * 0.15;
    }

    getWeaponSizeMultiplier() {
        const level = this.buffLevels['weaponSizeUp'] || 0;
        return 1 + level * 0.25;
    }

    getEquippedBuffs() {
        const result = [];
        for (const [type, level] of Object.entries(this.buffLevels)) {
            result.push({ type, level });
        }
        return result;
    }

    reset() {
        this.buffLevels = {};
    }

    update(dt) {
        // 将来の時間制限バフ用
    }
}
