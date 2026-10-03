import events from '@game/events.js';

/** Top-center high score. Persists to `localStorage` and updates on `scoreChanged`. */
export default class Hud {
    /** Best score so far; defaults to 5000. */
    highScore = Number(localStorage.getItem("highscore")) || 5000;

    constructor() {
        events.on('scoreChanged', (score) => {
            if (score > this.highScore) {
                this.setHighScore(score);
            }
        });
    }

    /** Updates and persists the high score. */
    setHighScore(highScore: number): void {
        this.highScore = highScore;
        localStorage.setItem("highscore", String(highScore));
    }

    draw(): void {
        const text = window.game.text;
        const ctx = window.game.ctx;

        text.setColor(0x5);
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("HI-SCORE", 320, 80);

        text.setColor(0xD);
        ctx.fillText(String(this.highScore), 320, 94);
    }
}
