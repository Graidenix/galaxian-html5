var Ship = require('../models/ship');
var Swarm = require('../models/swarm');

function GameScreen() {
    this._init();
}

GameScreen.prototype._init = function () {
    this.ship = this.ship || new Ship();
    this.swarm = this.swarm || new Swarm();
};

GameScreen.prototype.draw = function () {
    var game = window.game;

    this.swarm.draw();
    this.ship.draw();

    if (this.swarm.aliens.length === 0) {
        this.swarm = null;
        game.player.stage++;
        game.screen = game.getScreen('ready');
        game.screen._init();
    }
};

GameScreen.prototype.send = function (key) {
    if (key == 'LEFT') {
        this.ship.left();
    } else if (key == 'RIGHT') {
        this.ship.right();
    } else if (key === 'FIRE') {
        this.ship.fire();
    } else if (key === 'DOWN') {
        this.ship.explode();
    }
};

module.exports = GameScreen;