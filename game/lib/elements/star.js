function Star(x, y, speed, size) {
    this.x = x;
    this.y = y || 0;
    this.speed = speed || 1;
    this.size = size || 1;
}

Star.prototype.next = function () {
    this.y += this.speed;
};

Star.prototype.isLive = function () {
    return this.y < 480;
};

Star.prototype.draw = function () {
    window.game.text.setColor(0x3);
    window.game.ctx.fillRect(this.x, this.y, this.size, this.size);
};

Star.generate = function () {
    var pos = Math.ceil(Math.random() * 640);
    var speed = Math.ceil(Math.random() * 8);
    var size = Math.random() * 2;

    return new Star(pos, 0, speed, size);
};

module.exports = Star;