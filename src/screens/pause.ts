import type { Screen } from './screen.js';

/** Overlay drawn once when the game pauses. */
export default class PauseScreen implements Screen {
    init(): void {}

    draw(): void {
        const text = window.game.text;
        const ctx = window.game.ctx;

        text.setColor(0x0);
        ctx.globalAlpha = 0.5;
        ctx.fillRect(0, 0, 640, 480);
        ctx.globalAlpha = 1.0;

        text.setColor(0x3);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("PAUSE", 320, 240);
    }

    send(): void {}
}
