function Sprite(options) {
    var self = this;
    self.ctx = window.game.ctx;
    self.width = options.width;
    self.height = options.height;

    self.animate = options.animate === undefined ? true : options.animate;
    self.line = options.line || 0;
    self.frames = options.frames || 1;
    self.fps = options.fps || self.frames;
    self.frame = options.frame || 0;

    self.timeFrames = Math.floor(24 / this.fps * this.frame);
    self._init(options.src);
}

Sprite.prototype._init = function (src) {
    var image = new Image();
    image.src = src;
    this.spaceshipTx = image;
};

Sprite.prototype.next = function () {
    this.timeFrames++;

    this.frame = Math.floor(this.timeFrames * this.fps / 24) % this.frames;
    if (this.frame >= this.frames) {
        this.timeFrames = 0;
    }
};

Sprite.prototype.draw = function (x, y) {
    var self = this;
    if (self.animate) {
        self.next();
    }
    self.ctx.drawImage(
        self.spaceshipTx,
        self.frame * self.width,
        self.line * self.height,
        self.width,
        self.height,
        x,
        y,
        self.width,
        self.height);
};

module.exports = Sprite;