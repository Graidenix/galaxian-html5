function GameOverScreen() {
    this._init();
}

GameOverScreen.prototype._init = function() {
    return;
};

GameOverScreen.prototype.draw = function(){
    var text = window.game.text;
    var ctx = window.game.ctx;

    text.setColor(0x5);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", 320, 240);
};

GameOverScreen.prototype.send = function(key) {
    if (key === 'START') {
        window.game.screen = window.game.getScreen('home');
    }
};

module.exports = GameOverScreen;