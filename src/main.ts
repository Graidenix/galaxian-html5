import Game from './game.js';
import bindDisplay from './display.js';
import bindLegend from './legend.js';

const canvas = document.getElementById('screen') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
}

const game = new Game(ctx);
game.defineGamepad();

const screen = document.getElementById('screen-frame');
if (screen) {
    bindDisplay(screen);
}

const controls = document.getElementById('controls');
if (controls) {
    bindLegend(controls, game);
}
