var Alien = require('./../alien');

function Flagship() {
    this.txId = 3;
    this.score = 150;
    Alien.apply(this, arguments);
}

Flagship.prototype = Object.create(Alien.prototype);
Flagship.prototype.constructor = Flagship;

module.exports = Flagship;