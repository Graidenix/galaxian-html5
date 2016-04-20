var Sfx = require('../commands/sfx');

function ReadyScreen() {
    this._init();
}

ReadyScreen.prototype._init = function () {
    var intro = new Sfx('./assets/sfx/intro.wav');
    setTimeout(function () {
        intro.play();
        window.game.screen = window.game.getScreen('game');
        window.game.screen._init();
    }, 1500);
};

ReadyScreen.prototype.draw = function () {
    var text = window.game.text;
    var ctx = window.game.ctx;
    var player = window.game.player;

    text.setColor(0x5);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PLAYER " + player.id, 320, 240);
    ctx.fillText("READY", 320, 260);
};

ReadyScreen.prototype.send = function () {};

module.exports = ReadyScreen;