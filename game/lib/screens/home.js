var Player = require('../models/player');
var Sprite = require('../commands/sprite');
var Sfx = require('../commands/sfx');

function HomeScreen() {
    this.option = 1;
    this._init();
}

HomeScreen.prototype._init = function () {
    this.mainSound = new Sfx('./assets/sfx/main.mp3');
    this.mainSound.play();
    this.logo = new Sprite({
        width: 288,
        height: 88,
        src: './assets/img/logo.gif'
    });

};

HomeScreen.prototype.select = function () {
    var text = window.game.text;
    var ctx = window.game.ctx;
    var y = this.option === 1 ? 262 : 286;

    text.setColor(0x6);
    text.setFont(14);
    ctx.textAlign = "left";
    ctx.fillText("1 PLAYER", 252, 262);
    ctx.fillText("2 PLAYERS", 252, 286);

    text.setColor(0xF);
    ctx.fillText("▶", 224, y);
};

HomeScreen.prototype.copyright = function () {
    var text = window.game.text;
    var ctx = window.game.ctx;

    text.setColor(0x5);
    text.setFont(13);
    ctx.textAlign = "center";
    ctx.fillText("NAMCO©", 320, 330);
};

HomeScreen.prototype.footer = function () {
    var text = window.game.text;
    var ctx = window.game.ctx;

    text.setColor(0x3);
    text.setFont(13);
    ctx.textAlign = "center";
    ctx.fillText("© 1979 1996 NAMCO LTD", 320, 360);
    ctx.fillText("ALL RIGHTS RESERVED", 320, 380);
};

HomeScreen.prototype.draw = function () {
    this.logo.draw(176, 128);
    this.select();
    this.copyright();
    this.footer();
};

HomeScreen.prototype.send = function (key) {
    if (key === 'UP' && this.option === 2) {
        this.option = 1;
    } else if (key === 'DOWN' && this.option === 1) {
        this.option = 2;
    } else if (key === 'START') {
        this.start();
    }
};

HomeScreen.prototype.start = function () {
    var game = window.game;
    this.mainSound.stop();
    game.players = [];
    for (var i = 0; i < this.option; i++) {
        game.players.push(new Player(i + 1));
    }
    game.player = game.players[0];
    game.screen = game.getScreen('ready');
};

module.exports = HomeScreen;