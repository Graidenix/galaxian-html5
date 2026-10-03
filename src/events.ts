import mitt from 'mitt';

/** Payloads for each game event; `void` events carry no data. */
type Events = {
    alienKilled: { score: number };
    scoreChanged: number;
    shipDestroyed: void;
    stageCleared: void;
};

/**
 * Game-wide event bus.
 *
 * - `alienKilled`: an alien was hit; carries its score.
 * - `scoreChanged`: the current player's new score.
 * - `shipDestroyed`: the ship's explosion finished.
 * - `stageCleared`: every alien in the swarm is dead.
 */
export default mitt<Events>();
