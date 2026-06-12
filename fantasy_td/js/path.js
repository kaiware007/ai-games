export class PathManager {
    constructor(waypoints) {
        this.waypoints = waypoints;
        this.segments = [];
        this.totalLength = 0;

        for (let i = 0; i < waypoints.length - 1; i++) {
            const dx = waypoints[i + 1].x - waypoints[i].x;
            const dy = waypoints[i + 1].y - waypoints[i].y;
            const length = Math.sqrt(dx * dx + dy * dy);
            this.segments.push({
                start: waypoints[i],
                end: waypoints[i + 1],
                length: length,
                cumulativeLength: this.totalLength
            });
            this.totalLength += length;
        }
    }

    getPointAtDistance(distance) {
        if (distance <= 0) return { ...this.waypoints[0] };
        if (distance >= this.totalLength) return { ...this.waypoints[this.waypoints.length - 1] };

        for (const seg of this.segments) {
            const segEnd = seg.cumulativeLength + seg.length;
            if (distance <= segEnd) {
                const t = (distance - seg.cumulativeLength) / seg.length;
                return {
                    x: seg.start.x + (seg.end.x - seg.start.x) * t,
                    y: seg.start.y + (seg.end.y - seg.start.y) * t
                };
            }
        }
        return { ...this.waypoints[this.waypoints.length - 1] };
    }

    getTotalLength() {
        return this.totalLength;
    }

    draw(ctx) {
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 40;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(this.waypoints[0].x, this.waypoints[0].y);
        for (let i = 1; i < this.waypoints.length; i++) {
            ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#A0926B';
        ctx.lineWidth = 36;
        ctx.beginPath();
        ctx.moveTo(this.waypoints[0].x, this.waypoints[0].y);
        for (let i = 1; i < this.waypoints.length; i++) {
            ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
        }
        ctx.stroke();
    }
}
