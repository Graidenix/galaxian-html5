import { Background, Footer, Hud } from '@game/elements';
import { Gamepad, Sfx, Text } from '@game/commands';
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
    /** Mute toggled by the player (M); sound is also muted while paused. */
    private muted = false;
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
            this.player.lifes--;
            if (this.player.lifes <= 0) {
                this.getScreen('game').reset();
                this.switchScreen('over');
            } else {
                this.getScreen('game').resetShip();
                this.switchScreen('ready');
            }
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

    /** Toggles pause: stops the loop, mutes sound and shows the pause overlay, or resumes. */
    pause(): void {
        if (this.running) {
            cancelAnimationFrame(this.rafId);
            this.running = false;
            events.emit('pauseChanged', true);
            this.gamepad.reset();
            this.pauseState = this.screen;
            this.screen = this.getScreen('pause');
            this.screen.draw();
            this.applyMute();
        } else {
            this.start();
        }
    }

    /** Toggles the player's mute. */
    toggleMute(): void {
        this.muted = !this.muted;
        this.applyMute();
        events.emit('muteChanged', this.muted);
    }

    /** Sound plays only while running and not muted by the player. */
    private applyMute(): void {
        Sfx.setMuted(this.muted || !this.running);
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
        events.emit('pauseChanged', false);
        this.applyMute();

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

    /**
     * Handles a key going down, from the keyboard or the on-page legend.
     * @param code `KeyboardEvent.code` of the key
     * @param repeat auto-repeat: only updates held state, no discrete action
     * @returns whether the key is mapped to an action
     */
    pressKey(code: string, repeat = false): boolean {
        const action = Gamepad.get(code);
        if (!action) {
            return false;
        }

        this.gamepad.press(code);

        // Held keys are polled each tick; discrete actions fire once per press.
        if (repeat) {
            return true;
        }
        if (action === 'PAUSE' || (action === 'START' && this.isPausable())) {
            this.pause();
        } else if (action === 'MUTE') {
            this.toggleMute();
        } else if (action === 'CRT') {
            events.emit('crtToggled');
        } else if (action === 'ZOOM') {
            events.emit('zoomToggled');
        } else {
            this.screen.send(action);
        }
        return true;
    }

    /** Whether START should toggle pause: while paused, or during play (ready/game screens). */
    private isPausable(): boolean {
        return !this.running || this.screen === this.getScreen('game') || this.screen === this.getScreen('ready');
    }

    /** Handles a key going up. */
    releaseKey(code: string): void {
        this.gamepad.release(code);
    }

    /**
     * Attaches keyboard listeners: tracks held keys, handles PAUSE/MUTE/CRT/ZOOM
     * (START doubles as pause during play), and forwards
     * other presses to the current screen. Losing window focus or tab visibility pauses.
     */
    defineGamepad(): void {
        document.addEventListener('keydown', (ev) => {
            if (this.pressKey(ev.code, ev.repeat)) {
                ev.preventDefault();
            }
        });

        document.addEventListener('keyup', (ev) => {
            this.releaseKey(ev.code);
        });

        // Losing focus pauses (Esc resumes); held keys are released either way.
        const suspend = (): void => {
            this.gamepad.reset();
            if (this.running) {
                this.pause();
            }
        };
        window.addEventListener('blur', suspend);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                suspend();
            }
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
