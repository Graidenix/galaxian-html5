import type { Action } from '@game/commands';
import ReadyScreen from './ready.js';
import GameScreen from './game.js';
import GameOverScreen from './over.js';
import HomeScreen from './home.js';
import PauseScreen from './pause.js';

/** A game state: the current screen draws each tick and receives input. */
export interface Screen {
    /** Resets the screen on entry. Runs on every switch because `getScreen` caches instances. */
    init(): void;
    /** Draws (and usually advances) the screen; called once per tick. */
    draw(): void;
    /** Handles a discrete key press. */
    send(action: Action): void;
}

/** Screen name → screen class, used to type {@link buildScreen} and `Game.getScreen`. */
export interface ScreenMap {
    ready: ReadyScreen;
    game: GameScreen;
    over: GameOverScreen;
    home: HomeScreen;
    pause: PauseScreen;
}

export type ScreenName = keyof ScreenMap;

const factories: { [N in ScreenName]: () => ScreenMap[N] } = {
    ready: () => new ReadyScreen(),
    game: () => new GameScreen(),
    over: () => new GameOverScreen(),
    home: () => new HomeScreen(),
    pause: () => new PauseScreen(),
};

/** Creates a new screen instance. Use `Game.getScreen` for the cached one. */
export function buildScreen<N extends ScreenName>(name: N): ScreenMap[N] {
    return factories[name]();
}
