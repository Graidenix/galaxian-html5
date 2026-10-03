import Alien from '../alien.js';

/** Flagship (top row). 150 pts. */
export default class Flagship extends Alien {
    constructor(x: number, y: number, idx: number) {
        super(x, y, idx, 3, 150);
    }
}
