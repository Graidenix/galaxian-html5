/* global Audio */
function Sfx(src) {
    this.src = src;

    this._init();
    return this;
}

Sfx.prototype._init = function () {
    this.audio = new Audio();
    this.audio.src = this.src;
};

Sfx.prototype.play = function() {
    this.audio.loop = false;
    this.audio.play();
};

Sfx.prototype.loop = function() {
    this.audio.loop = true;
    this.audio.play();
}

Sfx.prototype.stop = function() {
    this.audio.pause();
    this.audio.currentTime = 0.0;
};


module.exports = Sfx;