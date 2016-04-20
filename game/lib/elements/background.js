var Star = require("./star");

function Background() {
    this.stars = [];
    this.ctx = window.game.ctx;
}

Background.prototype.createStars = function () {
    var count = Math.round(Math.random());
    for (var i = 0; i < count; i++) {
        this.stars.push(Star.generate());
    }

    this.stars = this.stars.filter(function (star) {
        return star.isLive();
    });
};

Background.prototype.draw = function() {

    window.game.text.setColor(0x0);
    this.ctx.fillRect(0, 0, 640, 480);
    this.stars.forEach(function(star){
        star.draw();
    });
};

Background.prototype.next = function() {
    this.clean();
    this.stars.forEach(function(star){
        star.next();
    });
    this.createStars();
    this.draw();
};

Background.prototype.clean = function() {
    this.ctx.clearRect(0, 0, 640, 480);
};



module.exports = Background;