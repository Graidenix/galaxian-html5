import { Sfx } from '@game/commands';
import { TICK_RATE } from '@game/config.js';

const READY_TIME = 1.5; // s
import type { Screen } from './screen.js';

/**
 * "PLAYER n READY" interstitial; switches to the game screen after 1.5 s.
 * Entered via `game.switchScreen('ready')`, which calls `init()`.
 */
export default class ReadyScreen implements Screen {
    private readonly intro = new Sfx('./assets/sfx/intro.wav');
    // Counted in ticks (not setTimeout) so it freezes while paused.
    private remaining = 0;

    init(): void {
        this.remaining = READY_TIME;
    }

    draw(): void {
        this.remaining -= 1 / TICK_RATE;
        if (this.remaining <= 0) {
            this.intro.play();
            window.game.switchScreen('game');
            return;
        }

        const text = window.game.text;
        const ctx = window.game.ctx;
        const player = window.game.player;

        text.setColor(0x5);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("PLAYER " + player.id, 320, 240);
        ctx.fillText("READY", 320, 260);
    }

    send(): void {}
}
