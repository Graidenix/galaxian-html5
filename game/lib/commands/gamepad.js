function Gamepad() {
    "use strict";

}

Gamepad.prototype.up = function() {
    "use strict";

};

Gamepad.prototype.down = function() {
    "use strict";

};

Gamepad.prototype.right = function() {
    "use strict";

};

Gamepad.prototype.left = function() {
    "use strict";

};

Gamepad.prototype.start = function() {
    "use strict";

};

Gamepad.prototype.fire = function() {
    "use strict";

};

Gamepad.get = function(key) {
    "use strict";
    switch (key) {
        case 38:
        case 87: return 'UP';
        case 40:
        case 83: return 'DOWN';
        case 37:
        case 65: return 'LEFT';
        case 39:
        case 68: return 'RIGHT';
        case 32: return 'FIRE';
        case 13: return 'START';
        case 27: return 'PAUSE';
    }
};

module.exports = Gamepad;