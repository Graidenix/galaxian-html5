var Background = require('./elements/background');
var Hud = require('./elements/hud');
var Footer = require('./elements/footer');
var Text = require('./commands/color');
var Gamepad = require('./commands/gamepad');
var Screen = require('./screens/screen');

function Game(ctx) {
    window.game = this;
    ctx.font = "12px NES, sans-serif";

    this.ctx = ctx;
    this.screen = null;
    this.screens = {};
    this.text = new Text();
    this.background = new Background();
    this.hud = new Hud();
    this.footer = new Footer();
    this.pauseState = this.getScreen('home');
    this.players = [];

    this.start();
}

Game.prototype.getScreen = function(screen) {
    if (!this.screens[screen]) {
        this.screens[screen] = Screen.build(screen);
    }

    return this.screens[screen];
};

Game.prototype.pause = function () {
    if (this.interval) {
        clearInterval(this.interval);
        this.pauseState = this.screen;
        this.screen = this.getScreen('pause');
        this.screen.draw();
        this.interval = null;
    } else {
        this.start();
    }
};

Game.prototype.start = function () {
    if (this.interval) {
        return;
    }

    this.screen = this.pauseState;
    this.pauseState = null;

    var self = this;
    this.interval = setInterval(function () {
        self.next();
        self.draw();
    }, 1000 / 24);
};

Game.prototype.over = function() {
    this.screen = this.getScreen('over');
};

Game.prototype.defineGamepad = function() {
    document.addEventListener('keydown', function (ev) {
        if ([37, 38, 39, 40, 87, 83, 65, 86, 32, 13, 27].indexOf(ev.which) !== -1) {
            var keyCode = Gamepad.get(ev.which);
            if (keyCode === 'PAUSE') {
                return window.game.pause();
            }
            return window.game.screen.send(keyCode);
        }
    });
};

Game.prototype.draw = function() {
    this.players.forEach(function (player) {
        player.draw();
    });
    this.hud.draw();
    this.screen.draw();
    this.footer.draw();
};

Game.prototype.next = function () {
    this.background.next();
};

module.exports = Game;