var AlienGreen = require('./aliens/green');
var AlienPurple = require('./aliens/purple');
var AlienRed = require('./aliens/red');
var Flagship = require('./aliens/flagship');
var Sfx = require('../commands/sfx');

function Swarm() {
    this.aliens = [];
    this.grid = [];
    this.dir = 1;  // 1 - to left | -1 - to right
    this.velocity = 2;
    this.waveSfx = new Sfx('./assets/sfx/wave.mp3');

    this._init();
}

Swarm.prototype._init = function () {
    var i, j, x, y, alien, line,
        top = 120;

    // Flagship
    line = [];
    for (i = 0; i < 2; i++) {
        x = 142 + i * 102;
        alien = new Flagship(x, top, 0);
        this.aliens.push(alien);
        line.push(alien);
    }
    this.grid.push(line);

    // Red SpaceShip
    line = [];
    for (i = 0; i < 6; i++) {
        x = 108 + i * 34;
        alien = new AlienRed(x, top + 28, i);
        this.aliens.push(alien);
        line.push(alien);
    }
    this.grid.push(line);

    // Purple SpaceShip
    line = [];
    for (i = 0; i < 8; i++) {
        x = 74 + i * 34;
        alien = new AlienPurple(x, top + 56, i + 1);
        this.aliens.push(alien);
        line.push(alien);
    }
    this.grid.push(line);

    // Green SpaceShip
    for (j = 0; j < 3; j++) {
        line = [];
        for (i = 0; i < 10; i++) {
            x = 40 + i * 34;
            y = top + (j + 3) * 28;
            alien = new AlienGreen(x, y, i + 2);
            this.aliens.push(alien);
            line.push(alien);
        }
        this.grid.push(line);
    }

    this.waveSfx.loop();

};

Swarm.prototype.next = function () {
    var self = this;
    var isRight = self.aliens.every(function (alien) {
        var posX = alien.pos.x + self.dir * self.velocity;
        return posX < 578 && posX > 40;
    });

    if (!isRight) {
        self.dir *= (-1);
    }

    self.aliens = self.aliens.map(function (alien) {
        alien.pos.x = alien.pos.x + self.dir * self.velocity;
        return alien;
    })
};

Swarm.prototype.draw = function () {
    var self = this;
    self.aliens = self.aliens.filter(function(alien) {
        return alien.isAlive();
    });

    self.aliens.forEach(function (alien) {
        alien.draw();
    });

    self.next();
};

module.exports = Swarm;