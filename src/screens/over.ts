import type { Action } from '@game/commands';
import type { Screen } from './screen.js';

/** Game over. START returns to the home screen. */
export default class GameOverScreen implements Screen {
    init(): void {}

    draw(): void {
        const text = window.game.text;
        const ctx = window.game.ctx;

        text.setColor(0x5);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GAME OVER", 320, 240);
    }

    send(action: Action): void {
        if (action === 'START') {
            window.game.screen = window.game.getScreen('home');
        }
    }
}
