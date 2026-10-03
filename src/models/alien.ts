import { Sfx, Sprite } from '@game/commands';
import events from '@game/events.js';
import type { Point } from './point.js';

/** Alien lifecycle/animation states. */
export const AlienState = {
    DEAD: 0,
    INJURED: 1,
    ALIVE: 2,
    JUMP_L: 3,
    JUMP_R: 4,
} as const;
export type AlienState = typeof AlienState[keyof typeof AlienState];

const SIZE = 22;

/** Base class for swarm aliens. Subclasses in `aliens/` choose the sprite row and score. */
export default abstract class Alien {
    /** Top-left position. */
    pos: Point;
    state: AlienState = AlienState.ALIVE;

    private expPos: Point = {x: 0, y: 0};
    private readonly spaceshipTx: Sprite;
    private readonly jumpLTx: Sprite;
    private readonly jumpRTx: Sprite;
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

        this.spaceshipTx = new Sprite({
            width: 22,
            height: 22,
            frame: idx % 3,
            frames: 3,
            line: txId,
            src: './assets/img/aliens-state.gif'
        });

        this.jumpLTx = new Sprite({
            width: 24,
            height: 24,
            frames: 9,
            line: txId * 2,
            src: './assets/img/aliens-move.gif'
        });

        this.jumpRTx = new Sprite({
            width: 24,
            height: 24,
            frames: 9,
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

    private isHit(bullet: Point): boolean {
        return bullet.x > this.pos.x &&
            bullet.x < this.pos.x + SIZE &&
            bullet.y > this.pos.y &&
            bullet.y < this.pos.y + SIZE;
    }

    /**
     * Whether the alien should stay in the swarm (includes the explosion).
     * Also does hit detection: a hit starts the explosion and emits `alienKilled`.
     * @param bullet the ship's bullet position
     */
    isAlive(bullet: Point): boolean {
        if (this.state === AlienState.DEAD) {
            return false;
        }

        if (!this.isHit(bullet)) {
            return true;
        }

        this.explode();
        events.emit('alienKilled', this);
        return true;
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

    /** Starts the dive animation. Not wired up yet. */
    jump(): void {
        this.state = AlienState.JUMP_L;
    }

    draw(): void {
        switch (this.state) {
            case AlienState.INJURED:
                this.explosionTx.draw(this.expPos.x, this.expPos.y);
                break;
            case AlienState.ALIVE:
                this.spaceshipTx.draw(this.pos.x, this.pos.y);
                break;
            case AlienState.JUMP_L:
                this.jumpLTx.draw(this.pos.x - 1, this.pos.y - 1);
                break;
            case AlienState.JUMP_R:
                this.jumpRTx.draw(this.pos.x - 1, this.pos.y - 1);
                break;
        }
    }
}
