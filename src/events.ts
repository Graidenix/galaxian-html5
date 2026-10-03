import mitt from 'mitt';

/** Payloads for each game event; `void` events carry no data. */
type Events = {
    alienKilled: { score: number };
    scoreChanged: number;
    shipDestroyed: void;
    stageCleared: void;
    pauseChanged: boolean;
    muteChanged: boolean;
};

/**
 * Game-wide event bus.
 *
 * - `alienKilled`: an alien was hit; carries its score.
 * - `scoreChanged`: the current player's new score.
 * - `shipDestroyed`: the ship's explosion finished.
 * - `stageCleared`: every alien in the swarm is dead.
 * - `pauseChanged`: the game paused (`true`) or resumed (`false`).
 * - `muteChanged`: the player toggled mute (M); pause muting doesn't emit this.
 */
export default mitt<Events>();
