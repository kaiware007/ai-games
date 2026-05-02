// モグラの種類定義
export const MOLE_TYPES = {
  NORMAL: { name: 'normal', points: 10, duration: 2.0, emoji: '🐹', color: '#8B4513' },
  RARE: { name: 'rare', points: 30, duration: 1.5, emoji: '👑', color: '#FFD700' },
  ULTRA_RARE: { name: 'ultra_rare', points: 100, duration: 2.0, emoji: '✨', color: '#FF69B4' }
};

export class Mole {
  constructor(type) {
    this.type = type;
  }

  getTypeName() {
    return this.type.name;
  }

  getPoints() {
    return this.type.points;
  }

  getDuration() {
    return this.type.duration;
  }

  getEmoji() {
    return this.type.emoji;
  }
}
