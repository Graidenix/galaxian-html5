import Alien from '../alien.js';

/** Green drone (bottom three rows). 60 pts. */
export default class AlienGreen extends Alien {
    constructor(x: number, y: number, idx: number) {
        super(x, y, idx, 0, 60);
    }
}
