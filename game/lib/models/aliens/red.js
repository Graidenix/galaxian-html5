var Alien = require('./../alien');

function AlienRed() {
    this.txId = 1;
    this.score = 100;
    Alien.apply(this, arguments);
}

AlienRed.prototype = Object.create(Alien.prototype);
AlienRed.prototype.constructor = AlienRed;

module.exports = AlienRed;
