import { TICK_RATE } from '@game/config.js';
import type { Point } from './point.js';

const SPEED = 240;          // px/s, vertical
const MAX_DRIFT = 60;       // px/s, horizontal aim limit
const PLAYFIELD_BOTTOM = 480;

/** A missile dropped by a diving alien. Falls straight, drifting toward where the ship was when fired. */
export default class Bomb {
    static readonly WIDTH = 2;
    static readonly HEIGHT = 8;

    /** Top-left position. */
    readonly pos: Point;
    private readonly drift: number;

    /**
     * @param origin top-left spawn position
     * @param target point to aim at (horizontal drift is clamped)
     */
    constructor(origin: Point, target: Point) {
        this.pos = {...origin};
        const flightTime = Math.max(0.1, (target.y - origin.y) / SPEED);
        this.drift = Math.max(-MAX_DRIFT, Math.min(MAX_DRIFT, (target.x - origin.x) / flightTime));
    }

    /** Whether the bomb has fallen off the bottom of the playfield. */
    get isGone(): boolean {
        return this.pos.y > PLAYFIELD_BOTTOM;
    }

    /** Moves one tick. */
    update(): void {
        this.pos.x += this.drift / TICK_RATE;
        this.pos.y += SPEED / TICK_RATE;
    }

    draw(): void {
        window.game.text.setColor(0x3);
        window.game.ctx.fillRect(Math.round(this.pos.x), Math.round(this.pos.y), Bomb.WIDTH, Bomb.HEIGHT);
    }
}
