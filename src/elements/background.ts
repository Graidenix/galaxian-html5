import Star from './star.js';
import { TICK_RATE } from '@game/config.js';

/** Average star spawn rate. */
const STARS_PER_SECOND = 12;

/** Scrolling starfield. Owns clearing the canvas at the start of each tick. */
export default class Background {
    private stars: Star[] = [];
    private readonly ctx = window.game.ctx;

    /** Randomly spawns a star and drops ones that left the screen. */
    createStars(): void {
        if (Math.random() < STARS_PER_SECOND / TICK_RATE) {
            this.stars.push(Star.generate());
        }

        this.stars = this.stars.filter((star) => star.isLive());
    }

    draw(): void {
        window.game.text.setColor(0x0);
        this.ctx.fillRect(0, 0, 640, 480);
        this.stars.forEach((star) => star.draw());
    }

    /** Clears the canvas, moves stars, spawns new ones, and redraws. */
    next(): void {
        this.clean();
        this.stars.forEach((star) => star.next());
        this.createStars();
        this.draw();
    }

    /** Clears the whole canvas. */
    clean(): void {
        this.ctx.clearRect(0, 0, 640, 480);
    }
}
