import Alien from '../alien.js';

/** Purple alien (third row). 80 pts. */
export default class AlienPurple extends Alien {
    constructor(x: number, y: number, idx: number) {
        super(x, y, idx, 2, 80);
    }
}
