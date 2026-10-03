import Game from './game.js';
import bindLegend from './legend.js';

const canvas = document.getElementById('screen') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
}

const game = new Game(ctx);
game.defineGamepad();

const legend = document.getElementById('legend');
if (legend) {
    bindLegend(legend, game);
}
