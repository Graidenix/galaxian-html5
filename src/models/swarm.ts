import type Alien from './alien.js';
import AlienGreen from './aliens/green.js';
import AlienPurple from './aliens/purple.js';
import AlienRed from './aliens/red.js';
import Flagship from './aliens/flagship.js';
import { Sfx } from '@game/commands';
import { TICK_RATE } from '@game/config.js';
import type { Point } from './point.js';

const TOP = 120;

/**
 * The alien formation: flagships, red, purple, then three green rows.
 * Sways side to side and loops the wave sound while alive.
 */
export default class Swarm {
    /** Aliens still in play, flat. */
    aliens: Alien[] = [];
    /** Formation rows, top to bottom (includes dead aliens). */
    grid: Alien[][] = [];
    /** Horizontal direction: 1 = right, -1 = left. */
    dir = 1;
    /** Sway speed in px/s. */
    velocity = 48;
    readonly waveSfx = new Sfx('./assets/sfx/wave.mp3');

    constructor() {
        // Flagships
        this.addRow(2, (i) => new Flagship(142 + i * 102, TOP, 0));
        // Red
        this.addRow(6, (i) => new AlienRed(108 + i * 34, TOP + 28, i));
        // Purple
        this.addRow(8, (i) => new AlienPurple(74 + i * 34, TOP + 56, i + 1));
        // Green
        for (let j = 0; j < 3; j++) {
            this.addRow(10, (i) => new AlienGreen(40 + i * 34, TOP + (j + 3) * 28, i + 2));
        }

        this.waveSfx.loop();
    }

    private addRow(count: number, build: (i: number) => Alien): void {
        const line: Alien[] = [];
        for (let i = 0; i < count; i++) {
            line.push(build(i));
        }
        this.aliens.push(...line);
        this.grid.push(line);
    }

    /** Moves the formation, reversing at the playfield edges. */
    next(): void {
        const step = this.velocity / TICK_RATE;
        const fits = this.aliens.every((alien) => {
            const posX = alien.pos.x + this.dir * step;
            return posX < 578 && posX > 40;
        });

        if (!fits) {
            this.dir *= -1;
        }

        this.aliens.forEach((alien) => {
            alien.pos.x += this.dir * step;
        });
    }

    /** Drops dead aliens (running hit detection against `bullet`), draws, then moves. */
    draw(bullet: Point): void {
        this.aliens = this.aliens.filter((alien) => alien.isAlive(bullet));
        this.aliens.forEach((alien) => alien.draw());
        this.next();
    }
}
