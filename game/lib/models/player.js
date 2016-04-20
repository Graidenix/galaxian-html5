function Player(id) {
    this.id = id;
    this.score = "00";
    this.stage = 1;
    this.lifes = 3;
}

Player.prototype.addPts = function (amount) {
    this.score = parseInt(this.score) + amount;
    if (this.score > window.game.hud.highScore) {
        window.game.hud.setHighScore(this.score);
    }
};

Player.prototype.draw = function () {
    var text = window.game.text;
    var ctx = window.game.ctx;
    var x = this.id === 1 ? 80 : 500;

    text.setColor(0x5);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(this.id + "UP", x, 80);

    text.setColor(0x3);
    ctx.textAlign = "right";
    ctx.fillText(this.score, x + 80, 94);
};

module.exports = Player;