import Alien from '../alien.js';

/** Red escort (second row). 100 pts. */
export default class AlienRed extends Alien {
    constructor(x: number, y: number, idx: number) {
        super(x, y, idx, 1, 100);
    }
}
