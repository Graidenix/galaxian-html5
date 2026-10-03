import { Sfx } from '@game/commands';
import type { Screen } from './screen.js';

/**
 * "PLAYER n READY" interstitial; switches to the game screen after 1.5 s.
 * Entered via `game.switchScreen('ready')`, which calls `init()`.
 */
export default class ReadyScreen implements Screen {
    private readonly intro = new Sfx('./assets/sfx/intro.wav');

    init(): void {
        setTimeout(() => {
            this.intro.play();
            window.game.switchScreen('game');
        }, 1500);
    }

    draw(): void {
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
