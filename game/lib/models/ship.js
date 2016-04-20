var Sprite = require('../commands/sprite');
var Sfx = require('../commands/sfx');

function Ship() {
    this.pos = {x: 320, y: 384};
    this.bullet = {x: 320, y: 384};
    this.readyState = true;
    this.state = 2;
    this.shipImg = new Sprite({
        width: 26,
        height: 39,
        frames: 2,
        animate: false,
        src: './assets/img/ship.gif'
    });

    this.shipExplode = new Sprite({
        width: 64,
        height: 64,
        frames: 4,
        fps: 4,
        src: './assets/img/ship-explode.gif'
    });

    this.fireSfx = new Sfx('./assets/sfx/fire.wav');
}

Ship.prototype.draw = function () {
    if (this.state == 2) {
        if (!this.readyState) {
            this.drawBullet();
        }
        this.shipImg.draw(this.pos.x, this.pos.y);
    } else if(this.state == 1) {
        this.shipExplode.draw(this.pos.x - 18, this.pos.y - 19);
    }
};

Ship.prototype.left = function () {
    this.pos.x -= 8;
    if (this.pos.x < 40) {
        this.pos.x = 40;
    }
};

Ship.prototype.right = function () {
    this.pos.x += 8;
    if (this.pos.x > 574) {
        this.pos.x = 574;
    }
};

Ship.prototype.fire = function () {
    if (!this.readyState) {
        return;
    }

    var self = this;
    self.fireSfx.play();
    self.shipImg.frame = 1;
    self.readyState = false;
    self.bullet = {
        x: self.pos.x + 13,
        y: self.pos.y
    };
};

Ship.prototype.drawBullet = function () {
    var self = this;
    var ctx = window.game.ctx;

    self.bullet.y -= 15;
    if (self.bullet.y < 0) {
        self.fireSfx.stop();
        self.shipImg.frame = 0;
        self.readyState = true;
    }

    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(self.bullet.x, self.bullet.y);
    ctx.lineTo(self.bullet.x, self.bullet.y - 7);
    ctx.stroke();
};

Ship.prototype.explode = function() {
    var self = this;
    self.state = 1;
    setTimeout(function() {
        window.game.screen.ship = false;
        var player = window.game.player;
        player.lifes--;
        var screenName = player.lifes <= 0 ? 'over' : 'ready';
        window.game.screen = window.game.getScreen(screenName);
        window.game.screen._init();
    }, 1000);
};

module.exports = Ship;



