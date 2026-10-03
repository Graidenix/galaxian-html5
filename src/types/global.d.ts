import type Game from '@game/game.js';

declare global {
    interface Window {
        // Singleton set by the Game constructor.
        game: Game;
    }
}
