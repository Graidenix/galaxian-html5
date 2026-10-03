import { Background, Footer, Hud } from '@game/elements';
import { Gamepad, Text } from '@game/commands';
import type { Player } from '@game/models';
import { buildScreen, type Screen, type ScreenMap, type ScreenName } from '@game/screens';
import events from './events.js';
import { TICK_RATE } from './config.js';

/** Duration of one simulation tick in ms. */
const STEP = 1000 / TICK_RATE;
/** Max ticks per frame. Caps catch-up after a stall (e.g. background tab) instead of fast-forwarding. */
const MAX_STEPS = 5;

/**
 * Root of the game: owns the canvas, screens, players and the fixed-timestep loop.
 * The constructor registers the instance as `window.game`, which most modules read.
 */
export default class Game {
    readonly ctx: CanvasRenderingContext2D;
    /** Held-key state, polled by screens. */
    readonly gamepad = new Gamepad();
    /** Screen that draws and receives input. */
    screen!: Screen;
    players: Player[] = [];
    /** Player currently in play; set when a game starts on the home screen. */
    player!: Player;

    // Assigned inside the constructor after `window.game = this`: their
    // constructors read window.game.ctx, and field initializers run first.
    readonly text: Text;
    private readonly background: Background;
    private readonly hud: Hud;
    private readonly footer: Footer;

    private readonly screens: Partial<ScreenMap> = {};
    private pauseState: Screen | null;
    private running = false;
    private rafId = 0;

    /** Registers `window.game`, builds the shared parts and starts the loop on the home screen. */
    constructor(ctx: CanvasRenderingContext2D) {
        window.game = this;
        ctx.font = "12px NES, sans-serif";
        this.ctx = ctx;

        this.text = new Text();
        this.background = new Background();
        this.hud = new Hud();
        this.footer = new Footer();
        this.pauseState = this.getScreen('home');

        this.bindEvents();
        this.start();
    }

    private bindEvents(): void {
        events.on('alienKilled', (alien) => {
            this.player.addPts(alien.score);
        });

        events.on('shipDestroyed', () => {
            this.getScreen('game').resetShip();
            this.player.lifes--;
            this.switchScreen(this.player.lifes <= 0 ? 'over' : 'ready');
        });

        events.on('stageCleared', () => {
            this.player.stage++;
            this.switchScreen('ready');
        });
    }

    /** Makes a screen current and runs its `init()`. */
    switchScreen(name: ScreenName): void {
        this.screen = this.getScreen(name);
        this.screen.init();
    }

    /** Returns the cached screen instance, creating it on first use. */
    getScreen<N extends ScreenName>(name: N): ScreenMap[N] {
        return (this.screens[name] ??= buildScreen(name)) as ScreenMap[N];
    }

    /** Toggles pause: stops the loop and shows the pause overlay, or resumes. */
    pause(): void {
        if (this.running) {
            cancelAnimationFrame(this.rafId);
            this.running = false;
            this.gamepad.reset();
            this.pauseState = this.screen;
            this.screen = this.getScreen('pause');
            this.screen.draw();
        } else {
            this.start();
        }
    }

    /** Starts the requestAnimationFrame loop at `TICK_RATE`. No-op if already running. */
    start(): void {
        if (this.running) {
            return;
        }

        if (this.pauseState) {
            this.screen = this.pauseState;
            this.pauseState = null;
        }
        this.running = true;

        let accumulator = 0;
        let lastTime = performance.now();

        const frame = (now: number): void => {
            accumulator += Math.max(0, now - lastTime);
            lastTime = now;

            let steps = 0;
            while (accumulator >= STEP && steps < MAX_STEPS) {
                this.next();
                this.draw();
                accumulator -= STEP;
                steps++;
            }
            if (steps === MAX_STEPS) {
                accumulator = 0;
            }

            this.rafId = requestAnimationFrame(frame);
        };

        this.rafId = requestAnimationFrame(frame);
    }

    /** Attaches keyboard listeners: tracks held keys and forwards presses to the current screen. */
    defineGamepad(): void {
        document.addEventListener('keydown', (ev) => {
            const action = Gamepad.get(ev.code);
            if (!action) {
                return;
            }

            ev.preventDefault();
            this.gamepad.press(ev.code);

            // Held keys are polled each tick; discrete actions fire once per press.
            if (ev.repeat) {
                return;
            }
            if (action === 'PAUSE') {
                this.pause();
                return;
            }
            this.screen.send(action);
        });

        document.addEventListener('keyup', (ev) => {
            this.gamepad.release(ev.code);
        });

        window.addEventListener('blur', () => {
            this.gamepad.reset();
        });
    }

    private draw(): void {
        this.players.forEach((player) => player.draw());
        this.hud.draw();
        this.screen.draw();
        this.footer.draw();
    }

    private next(): void {
        this.background.next();
    }
}
