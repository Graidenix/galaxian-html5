var ReadyScreen = require('./ready');
var GameScreen = require('./game');
var GameOverScreen = require('./over');
var HomeScreen = require('./home');
var PauseScreen = require('./pause');


function Screen() {

}

Screen.build = function(name) {
    switch (name) {
        case 'ready': return new ReadyScreen;
        case 'game': return new GameScreen;
        case 'over': return new GameOverScreen;
        case 'home': return new HomeScreen;
        case 'pause': return new PauseScreen;
    }
}

module.exports = Screen;