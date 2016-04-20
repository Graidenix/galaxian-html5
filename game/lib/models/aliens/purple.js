var Alien = require('./../alien');

function AlienPurple() {
    this.txId = 2;
    this.score = 80;
    Alien.apply(this, arguments);
}

AlienPurple.prototype = Object.create(Alien.prototype);
AlienPurple.prototype.constructor = AlienPurple;

module.exports = AlienPurple;