import { Sfx, Sprite } from '@game/commands';
import events from '@game/events.js';
import { TICK_RATE } from '@game/config.js';
import Bomb from './bomb.js';
import type { Point } from './point.js';

/** Alien lifecycle states. */
export const AlienState = {
    DEAD: 0,
    INJURED: 1,
    /** In formation. */
    ALIVE: 2,
    /** Looping out of formation and attacking. */
    DIVING: 3,
    /** Re-entered from the top, flying back to its slot. */
    RETURNING: 4,
} as const;
export type AlienState = typeof AlienState[keyof typeof AlienState];

/** Direction a diver loops out of formation: -1 = left, 1 = right. */
export type DiveSide = -1 | 1;

const SIZE = 22;
/** Alien types with rotation frames in aliens-move.gif (green, red, purple). Others rotate the idle sprite. */
const MOVE_SHEET_TYPES = 3;
/** aliens-move.gif frames span 0 (facing down) to 8 (facing up) in 22.5° steps. */
const MOVE_FRAMES = 9;

const LOOP_RADIUS = 28;      // px
const LOOP_TIME = 0.7;       // s, for the 180° peel-off
const DIVE_SPEED = 150;      // px/s, vertical
const MAX_STEER_SPEED = 130; // px/s, horizontal
const STEER_ACCEL = 260;     // px/s²
const STEER_GAIN = 1.5;      // 1/s, horizontal speed per px of offset from the target
const COMMIT_DISTANCE = 90;  // px above the target where steering stops, so the player can dodge
const RETURN_SPEED = 120;    // px/s
const PLAYFIELD_BOTTOM = 480;

const MAX_BOMBS = 3;           // per dive; each dive drops 1..MAX_BOMBS
const BOMB_INTERVAL = 0.35;    // s between bombs
const FIRST_BOMB_DELAY = [0.1, 0.6] as const; // s after the loop ends
const BOMB_MIN_GAP = 100;      // px; stops firing once this close above the target

/** Base class for swarm aliens. Subclasses in `aliens/` choose the sprite row and score. */
export default abstract class Alien {
    /** Top-left position. */
    pos: Point;
    /** Formation position before the swarm's sway offset. */
    readonly slot: Point;
    state: AlienState = AlienState.ALIVE;
    /** Travel direction in radians: 0 = down, positive = turning right. */
    heading = 0;

    private expPos: Point = {x: 0, y: 0};
    private loop = {side: 1 as DiveSide, center: {x: 0, y: 0}, t: 0, done: false};
    private steerSpeed = 0;
    private bombsLeft = 0;
    private bombCooldown = 0;
    private readonly spaceshipTx: Sprite;
    private readonly turnRightTx: Sprite;
    private readonly turnLeftTx: Sprite;
    private readonly explosionTx: Sprite;
    private readonly explodeSfx = new Sfx('./assets/sfx/explode.wav');

    /**
     * @param x left edge
     * @param y top edge
     * @param idx column index; staggers the idle animation
     * @param txId sprite-sheet row for this alien type
     * @param score points awarded when killed
     */
    protected constructor(x: number, y: number, idx: number, readonly txId: number, readonly score: number) {
        this.pos = {x, y};
        this.slot = {x, y};

        this.spaceshipTx = new Sprite({
            width: 22,
            height: 22,
            frame: idx % 3,
            frames: 3,
            line: txId,
            src: './assets/img/aliens-state.gif'
        });

        this.turnRightTx = new Sprite({
            width: 24,
            height: 24,
            frames: MOVE_FRAMES,
            animate: false,
            line: txId * 2,
            src: './assets/img/aliens-move.gif'
        });

        this.turnLeftTx = new Sprite({
            width: 24,
            height: 24,
            frames: MOVE_FRAMES,
            animate: false,
            line: txId * 2 + 1,
            src: './assets/img/aliens-move.gif'
        });

        this.explosionTx = new Sprite({
            width: 32,
            height: 32,
            frames: 4,
            fps: 8,
            src: './assets/img/aliens-die.gif'
        });
    }

    /** Whether the alien is out of formation (diving or returning). */
    get isFlying(): boolean {
        return this.state === AlienState.DIVING || this.state === AlienState.RETURNING;
    }

    private isHit(bullet: Point | null): boolean {
        return bullet !== null &&
            bullet.x > this.pos.x &&
            bullet.x < this.pos.x + SIZE &&
            bullet.y > this.pos.y &&
            bullet.y < this.pos.y + SIZE;
    }

    /**
     * Whether the alien should stay in the swarm (includes the explosion).
     * Also does hit detection: a hit starts the explosion and emits `alienKilled`.
     * @param bullet the ship's bullet in flight, or `null` if none
     */
    isAlive(bullet: Point | null): boolean {
        if (this.state === AlienState.DEAD) {
            return false;
        }

        if (this.state === AlienState.INJURED || !this.isHit(bullet)) {
            return true;
        }

        this.kill();
        return true;
    }

    /** Explodes the alien and emits `alienKilled`. */
    kill(): void {
        this.explode();
        events.emit('alienKilled', this);
    }

    /** Plays the explosion; the alien becomes `DEAD` 500 ms later. */
    explode(): void {
        this.state = AlienState.INJURED;
        this.explodeSfx.play();
        this.expPos = {
            x: this.pos.x - 5,
            y: this.pos.y - 5
        };

        setTimeout(() => {
            this.state = AlienState.DEAD;
        }, 500);
    }

    /**
     * Leaves the formation: loops up and outward, then dives at the ship.
     * @param side which way to loop out
     */
    dive(side: DiveSide): void {
        this.state = AlienState.DIVING;
        this.loop = {
            side,
            center: {x: this.pos.x + side * LOOP_RADIUS, y: this.pos.y},
            t: 0,
            done: false,
        };
        this.steerSpeed = 0;
        this.bombsLeft = 1 + Math.floor(Math.random() * MAX_BOMBS);
        const [min, max] = FIRST_BOMB_DELAY;
        this.bombCooldown = min + Math.random() * (max - min);
    }

    /**
     * Drops a bomb if this alien is attacking, has bombs left, its cooldown has
     * elapsed, and it's still far enough above the target. Call once per tick.
     * @param target point to aim at
     */
    tryBomb(target: Point): Bomb | null {
        if (this.state !== AlienState.DIVING || !this.loop.done || this.bombsLeft === 0) {
            return null;
        }

        this.bombCooldown -= 1 / TICK_RATE;
        if (this.bombCooldown > 0 || this.pos.y > target.y - BOMB_MIN_GAP) {
            return null;
        }

        this.bombsLeft--;
        this.bombCooldown = BOMB_INTERVAL;
        return new Bomb({x: this.pos.x + SIZE / 2, y: this.pos.y + SIZE}, target);
    }

    /** Abandons an attack: re-enters from the top and flies back to its slot. */
    recall(): void {
        if (this.isFlying) {
            this.pos.y = -SIZE;
            this.state = AlienState.RETURNING;
        }
    }

    /**
     * Advances one tick of movement.
     * @param offsetX the swarm's current sway offset
     * @param target top-left position to aim at while diving
     */
    update(offsetX: number, target: Point): void {
        switch (this.state) {
            case AlienState.ALIVE:
                this.pos.x = this.slot.x + offsetX;
                this.pos.y = this.slot.y;
                break;
            case AlienState.DIVING:
                if (this.loop.done) {
                    this.attack(target);
                } else {
                    this.peelOff();
                }
                break;
            case AlienState.RETURNING:
                this.flyHome(offsetX);
                break;
        }
    }

    /** Half-circle up and outward around the loop center; ends heading straight down. */
    private peelOff(): void {
        const {side, center} = this.loop;
        this.loop.t += 1 / TICK_RATE;
        const phi = Math.min(Math.PI, this.loop.t / LOOP_TIME * Math.PI);

        this.pos.x = center.x - side * LOOP_RADIUS * Math.cos(phi);
        this.pos.y = center.y - LOOP_RADIUS * Math.sin(phi);
        this.heading = Math.atan2(side * Math.sin(phi), -Math.cos(phi));

        if (phi >= Math.PI) {
            this.loop.done = true;
        }
    }

    /** Falls at DIVE_SPEED while steering toward the target, until it's too close to correct. */
    private attack(target: Point): void {
        const dt = 1 / TICK_RATE;

        if (this.pos.y < target.y - COMMIT_DISTANCE) {
            const desired = clamp((target.x - this.pos.x) * STEER_GAIN, MAX_STEER_SPEED);
            this.steerSpeed += clamp(desired - this.steerSpeed, STEER_ACCEL * dt);
        }

        this.pos.x += this.steerSpeed * dt;
        this.pos.y += DIVE_SPEED * dt;
        this.heading = Math.atan2(this.steerSpeed, DIVE_SPEED);

        if (this.pos.y > PLAYFIELD_BOTTOM) {
            this.recall();
        }
    }

    /** Flies straight to the slot; rejoins the formation on arrival. */
    private flyHome(offsetX: number): void {
        const dx = this.slot.x + offsetX - this.pos.x;
        const dy = this.slot.y - this.pos.y;
        const dist = Math.hypot(dx, dy);
        const step = RETURN_SPEED / TICK_RATE;

        if (dist <= step) {
            this.state = AlienState.ALIVE;
            this.heading = 0;
            this.update(offsetX, this.pos);
            return;
        }

        this.pos.x += dx / dist * step;
        this.pos.y += dy / dist * step;
        this.heading = Math.atan2(dx, dy);
    }

    draw(): void {
        switch (this.state) {
            case AlienState.INJURED:
                this.explosionTx.draw(this.expPos.x, this.expPos.y);
                break;
            case AlienState.ALIVE:
                this.spaceshipTx.draw(this.pos.x, this.pos.y);
                break;
            case AlienState.DIVING:
            case AlienState.RETURNING:
                this.drawFlying();
                break;
        }
    }

    /** Picks the rotation frame closest to the heading; types without one rotate the idle sprite. */
    private drawFlying(): void {
        if (this.txId >= MOVE_SHEET_TYPES) {
            this.spaceshipTx.drawRotated(this.pos.x, this.pos.y, -this.heading);
            return;
        }

        const sprite = this.heading >= 0 ? this.turnRightTx : this.turnLeftTx;
        sprite.frame = Math.min(MOVE_FRAMES - 1, Math.round(Math.abs(this.heading) / (Math.PI / 8)));
        sprite.draw(this.pos.x - 1, this.pos.y - 1);
    }
}

/** Clamps `value` to [-limit, limit]. */
function clamp(value: number, limit: number): number {
    return Math.max(-limit, Math.min(limit, value));
}
