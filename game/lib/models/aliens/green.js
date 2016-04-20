var Alien = require('./../alien');

function AlienGreen() {
    this.txId = 0;
    this.score = 60;
    Alien.apply(this, arguments);
}

AlienGreen.prototype = Object.create(Alien.prototype);
AlienGreen.prototype.constructor = AlienGreen;

module.exports = AlienGreen;