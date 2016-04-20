var Sprite = require('../commands/sprite');
var Sfx = require('../commands/sfx');

function Alien(x, y, idx) {
    if (this.constructor === Alien) {
        throw new Error("Can't instantiate abstract class!");
    }

    this.pos = {
        x: x,
        y: y
    };

    this.state = 2;

    this.spaceshipTx = new Sprite({
        width: 22,
        height: 22,
        frame: idx % 3,
        frames: 3,
        line: this.txId,
        src: './assets/img/aliens-state.gif'
    });

    this.jumpLTx = new Sprite({
        width: 24,
        height: 24,
        frames: 9,
        line: this.txId * 2,
        src: './assets/img/aliens-move.gif'
    });

    this.jumpRTx = new Sprite({
        width: 24,
        height: 24,
        frames: 9,
        line: this.txId * 2 + 1,
        src: './assets/img/aliens-move.gif'
    });

    this.explosionTx = new Sprite({
        width: 32,
        height: 32,
        frames: 4,
        fps: 8,
        src: './assets/img/aliens-die.gif'
    });

    this.explodeSfx = new Sfx('./assets/sfx/explode.wav');
}

Alien.DEAD = 0;
Alien.INJURED = 1;
Alien.ALIVE = 2;
Alien.JUMP_L = 3;
Alien.JUMP_R = 4;

Alien.prototype._isInjured = function() {
    var bulletPos = window.game.screen.ship.bullet;
    var alienPos = this.pos;

    return bulletPos.x > alienPos.x &&
        bulletPos.x < alienPos.x + 22 &&
        bulletPos.y > alienPos.y &&
        bulletPos.y < alienPos.y + 22;
};

Alien.prototype.isAlive = function () {
    if (this.state === Alien.DEAD) {
        return false;
    }

    if (!this._isInjured()) {
        return true;
    }

    this.explode();

    var ship = window.game.screen.ship;

    ship.readyState = true;
    ship.bullet = {x: 0, y: 0};

    window.game.player.addPts(this.score);
    return true;
};

Alien.prototype.explode = function () {
    var self = this;

    this.state = Alien.INJURED;
    this.explodeSfx.play();
    this.expPos = {
        x: this.pos.x - 5,
        y: this.pos.y - 5
    };

    setTimeout(function () {
        self.state = Alien.DEAD;
    }, 500);
};

Alien.prototype.jump = function () {
    self.state = Alien.JUMP_L;
};

Alien.prototype.draw = function () {
    switch (this.state) {
        case Alien.DEAD:
            console.log('Alien dead');
            break;
        case Alien.INJURED:
            this.explosionTx.draw(this.expPos.x, this.expPos.y);
            break;
        case Alien.ALIVE:
            this.spaceshipTx.draw(this.pos.x, this.pos.y);
            break;
        case Alien.JUMP_L:
            this.jumpLTx.draw(this.pos.x - 1, this.pos.y - 1);
            break;
        case Alien.JUMP_R:
            this.jumpRTx.draw(this.pos.x - 1, this.pos.y - 1);
            break;
    }
};

module.exports = Alien;