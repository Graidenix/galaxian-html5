function PauseScreen() {
    this._init();
}

PauseScreen.prototype._init = function() {
    return;
};

PauseScreen.prototype.draw = function(){
    var text = window.game.text;
    var ctx = window.game.ctx;

    text.setColor(0x0);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 0, 640, 480);
    ctx.globalAlpha = 1.0;

    text.setColor(0x3);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PAUSE", 320, 240);
};

PauseScreen.prototype.send = function() {
    return;
};

module.exports = PauseScreen;