function Hud() {
    this.highScore = localStorage.getItem("highscore") || 5000;
}

Hud.prototype.setHighScore = function (highScore) {
    this.highScore = highScore;
    localStorage.setItem("highscore", highScore);
};

Hud.prototype.draw = function() {
    var text = window.game.text;
    var ctx = window.game.ctx;

    text.setColor(0x5);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("HI-SCORE", 320, 80);

    text.setColor(0xD);
    ctx.fillText(this.highScore, 320, 94);
};

module.exports = Hud;
