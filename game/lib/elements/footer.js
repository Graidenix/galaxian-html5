var HomeScreen = require('../screens/home');
var Sprite = require('../commands/sprite');

function Footer() {
    this.lifeSprite = new Sprite({
        width: 22,
        height: 28,
        src: './assets/img/footer.gif'
    });

    this.stageSprite = new Sprite({
        width: 16,
        height: 28,
        line:1,
        src: './assets/img/footer.gif'
    });
}

Footer.prototype.lifes = function () {
    var player = window.game.player;
    for(var i = 1; i < player.lifes; i++) {
        var offset = 8 + i * 32;
        this.lifeSprite.draw(offset, 430);
    }
};

Footer.prototype.stage = function () {
    var player = window.game.player;
    for(var i = 0; i < player.stage; i++) {
        var offset = 584 - i * 16;
        this.stageSprite.draw(offset, 430);
    }
};

Footer.prototype.draw = function() {
    if (window.game.screen instanceof HomeScreen) {
        return;
    }

    this.lifes();
    this.stage();
};

module.exports = Footer;