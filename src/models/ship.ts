import { Sfx, Sprite } from '@game/commands';
import events from '@game/events.js';
import { TICK_RATE } from '@game/config.js';
import type { Point } from './point.js';

const SPEED = 192;        // px/s
const BULLET_SPEED = 360; // px/s
const EXPLODE_TIME = 1;   // s before shipDestroyed

/** Ship states. */
export const ShipState = {
    /** Explosion finished; `shipDestroyed` has been emitted. */
    DESTROYED: 0,
    EXPLODING: 1,
    ALIVE: 2,
} as const;
export type ShipState = typeof ShipState[keyof typeof ShipState];

/** The player's ship. Only one bullet can be in flight at a time. */
export default class Ship {
    pos: Point = {x: 320, y: 384};
    /** Bullet position; meaningful only while `readyState` is false. */
    bullet: Point = {x: 320, y: 384};
    /** Whether the ship can fire (no bullet in flight). */
    readyState = true;
    state: ShipState = ShipState.ALIVE;

    private readonly shipImg = new Sprite({
        width: 26,
        height: 39,
        frames: 2,
        animate: false,
        src: './assets/img/ship.gif'
    });

    private readonly shipExplode = new Sprite({
        width: 64,
        height: 64,
        frames: 4,
        fps: 4,
        src: './assets/img/ship-explode.gif'
    });

    private readonly fireSfx = new Sfx('./assets/sfx/fire.wav');
    // Counted in ticks (not setTimeout) so it freezes while paused.
    private explodeTimer = 0;

    draw(): void {
        if (this.state === ShipState.ALIVE) {
            if (!this.readyState) {
                this.drawBullet();
            }
            this.shipImg.draw(this.pos.x, this.pos.y);
        } else if (this.state === ShipState.EXPLODING) {
            this.shipExplode.draw(this.pos.x - 18, this.pos.y - 19);
            this.explodeTimer -= 1 / TICK_RATE;
            if (this.explodeTimer <= 0) {
                this.state = ShipState.DESTROYED;
                events.emit('shipDestroyed');
            }
        }
    }

    /** The bullet's position while in flight, otherwise `null`. */
    get activeBullet(): Point | null {
        return this.readyState ? null : this.bullet;
    }

    /**
     * Whether a `width`×`height` box at `pos` (top-left) overlaps the ship's hull.
     * The hitbox is inset from the 26×39 sprite to its visible body.
     */
    overlaps(pos: Point, width: number, height = width): boolean {
        return pos.x < this.pos.x + 22 &&
            pos.x + width > this.pos.x + 4 &&
            pos.y < this.pos.y + 39 &&
            pos.y + height > this.pos.y + 8;
    }

    /** Moves left one tick's worth, clamped to the playfield. */
    left(): void {
        this.pos.x = Math.max(40, this.pos.x - SPEED / TICK_RATE);
    }

    /** Moves right one tick's worth, clamped to the playfield. */
    right(): void {
        this.pos.x = Math.min(574, this.pos.x + SPEED / TICK_RATE);
    }

    /** Fires a bullet if none is in flight. */
    fire(): void {
        if (!this.readyState) {
            return;
        }

        this.fireSfx.play();
        this.shipImg.frame = 1;
        this.readyState = false;
        this.bullet = {
            x: this.pos.x + 13,
            y: this.pos.y
        };
    }

    private drawBullet(): void {
        const ctx = window.game.ctx;

        this.bullet.y -= BULLET_SPEED / TICK_RATE;
        if (this.bullet.y < 0) {
            this.fireSfx.stop();
            this.reload();
        }

        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.bullet.x, this.bullet.y);
        ctx.lineTo(this.bullet.x, this.bullet.y - 7);
        ctx.stroke();
    }

    /** Clears the bullet and allows firing again. */
    reload(): void {
        this.shipImg.frame = 0;
        this.readyState = true;
        this.bullet = {x: 0, y: 0};
    }

    /** Plays the explosion and emits `shipDestroyed` after EXPLODE_TIME of game time. */
    explode(): void {
        if (this.state !== ShipState.ALIVE) {
            return;
        }
        this.state = ShipState.EXPLODING;
        this.explodeTimer = EXPLODE_TIME;
    }
}
