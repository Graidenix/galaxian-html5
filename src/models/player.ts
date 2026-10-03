import events from '@game/events.js';

/** A player's score, lives and stage; draws their score in the top HUD. */
export default class Player {
    score = 0;
    stage = 1;
    /** Lives left, including the one in play. */
    lifes = 3;

    /** @param id player number (1 or 2) */
    constructor(readonly id: number) {}

    /** Adds points and emits `scoreChanged`. */
    addPts(amount: number): void {
        this.score += amount;
        events.emit('scoreChanged', this.score);
    }

    draw(): void {
        const text = window.game.text;
        const ctx = window.game.ctx;
        const x = this.id === 1 ? 80 : 500;

        text.setColor(0x5);
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(this.id + "UP", x, 80);

        text.setColor(0x3);
        ctx.textAlign = "right";
        ctx.fillText(this.score === 0 ? "00" : String(this.score), x + 80, 94);
    }
}
