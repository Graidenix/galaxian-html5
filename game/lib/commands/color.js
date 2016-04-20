const colors = [
    "black",    // 0x0
    "silver",   // 0x1
    "gray",     // 0x2
    "white",    // 0x3
    "maroon",   // 0x4
    "red",      // 0x5
    "purple",   // 0x6
    "fuchsia",  // 0x7
    "green",    // 0x8
    "lime",     // 0x9
    "olive",    // 0xA
    "yellow",   // 0xB
    "navy",     // 0xC
    "blue",     // 0xD
    "teal",     // 0xE
    "aqua"      // 0xF
];

function Text() {
    this.ctx = window.game.ctx;
}

Text.prototype.setColor = function(idx) {
    this.ctx.fillStyle = colors[idx];
};

Text.prototype.setFont = function(size) {
    this.ctx.font = size + "px NES, sans-serif";
};

module.exports = Text;