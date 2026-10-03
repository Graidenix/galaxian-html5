import { TICK_RATE } from '@game/config.js';

/** A single background star falling down the screen. */
export default class Star {
    /**
     * @param x horizontal position
     * @param y vertical position
     * @param speed fall speed in px/s
     * @param size square side in px
     */
    constructor(
        public x: number,
        public y = 0,
        public speed = 24, // px/s
        public size = 1,
    ) {}

    /** Creates a star at a random x on the top edge with random speed and size. */
    static generate(): Star {
        const pos = Math.ceil(Math.random() * 640);
        const speed = Math.ceil(Math.random() * 8) * 24;
        const size = Math.random() * 2;

        return new Star(pos, 0, speed, size);
    }

    next(): void {
        this.y += this.speed / TICK_RATE;
    }

    /** Whether the star is still on screen. */
    isLive(): boolean {
        return this.y < 480;
    }

    draw(): void {
        window.game.text.setColor(0x3);
        window.game.ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}
