import { TICK_RATE } from '@game/config.js';

/** Options for {@link Sprite}. */
export interface SpriteOptions {
    src: string;
    width: number;
    height: number;
    animate?: boolean;
    line?: number;   // sprite-sheet row
    frames?: number;
    fps?: number;
    frame?: number;  // starting frame
}

/**
 * Animated sprite cropped from a sprite sheet: `frame` selects the
 * x offset (`frame * width`) and `line` the y offset (`line * height`).
 * Animation advances one tick per {@link Sprite.draw} call.
 */
export default class Sprite {
    readonly width: number;
    readonly height: number;
    /** Whether `draw()` advances the animation. */
    animate: boolean;
    /** Sprite-sheet row. */
    line: number;
    frames: number;
    /** Animation speed in frames per second. */
    fps: number;
    /** Current frame index; set it directly for manual (non-animated) sprites. */
    frame: number;

    private readonly ctx = window.game.ctx;
    private readonly image = new Image();
    private timeFrames: number;

    constructor(options: SpriteOptions) {
        this.width = options.width;
        this.height = options.height;
        this.animate = options.animate ?? true;
        this.line = options.line ?? 0;
        this.frames = options.frames ?? 1;
        this.fps = options.fps ?? this.frames;
        this.frame = options.frame ?? 0;

        this.timeFrames = Math.floor(TICK_RATE / this.fps * this.frame);
        this.image.src = options.src;
    }

    /** Advances the animation by one tick. */
    next(): void {
        this.timeFrames++;
        this.frame = Math.floor(this.timeFrames * this.fps / TICK_RATE) % this.frames;
    }

    /** Draws the current frame at (x, y), rounded to whole pixels; advances first if `animate`. */
    draw(x: number, y: number): void {
        if (this.animate) {
            this.next();
        }
        this.ctx.drawImage(
            this.image,
            this.frame * this.width,
            this.line * this.height,
            this.width,
            this.height,
            Math.round(x),
            Math.round(y),
            this.width,
            this.height);
    }
}
