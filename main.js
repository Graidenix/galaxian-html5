(function (doc, Game) {
    "use strict";


    var screen = doc.getElementById('screen');
    var ctx = screen.getContext('2d');
    var game = new Game(ctx);
    game.defineGamepad();



})(document, Game);