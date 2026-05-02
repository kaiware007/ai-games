export class HitEffect {
  constructor(x, y, points) {
    this.x = x;
    this.y = y;
    this.points = points;
    this.life = 1.0; // 秒
    this.maxLife = 1.0;
    this.particles = [];

    // パーティクル生成
    const count = points >= 100 ? 12 : points >= 30 ? 8 : 5;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 40 + Math.random() * 60;
      this.particles.push({
        x: 0, y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 0.5 + Math.random() * 0.5,
        size: 2 + Math.random() * 4,
        color: points >= 100 ? `hsl(${Math.random() * 360}, 100%, 70%)` :
               points >= 30 ? '#FFD700' : '#FFFFFF'
      });
    }
  }

  update(dt) {
    this.life -= dt;
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 100 * dt; // gravity
      p.life -= dt;
    }
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);

    // 数字表示
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${this.points >= 100 ? 36 : 28}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = this.points >= 100 ? '#FF69B4' :
                    this.points >= 30 ? '#FFD700' : '#FFFFFF';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    const text = `+${this.points}`;
    ctx.strokeText(text, this.x, this.y - (1 - alpha) * 40);
    ctx.fillText(text, this.x, this.y - (1 - alpha) * 40);
    ctx.restore();

    // パーティクル
    for (const p of this.particles) {
      if (p.life <= 0) continue;
      const pAlpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = pAlpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(this.x + p.x, this.y + p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  isAlive() {
    return this.life > 0;
  }
}