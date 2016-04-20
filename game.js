/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Game = __webpack_require__(1);

	window.Game = Game;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Background = __webpack_require__(2);
	var Hud = __webpack_require__(4);
	var Footer = __webpack_require__(5);
	var Text = __webpack_require__(10);
	var Gamepad = __webpack_require__(11);
	var Screen = __webpack_require__(12);

	function Game(ctx) {
	    window.game = this;
	    ctx.font = "12px NES, sans-serif";

	    this.ctx = ctx;
	    this.screen = null;
	    this.screens = {};
	    this.text = new Text();
	    this.background = new Background();
	    this.hud = new Hud();
	    this.footer = new Footer();
	    this.pauseState = this.getScreen('home');
	    this.players = [];

	    this.start();
	}

	Game.prototype.getScreen = function(screen) {
	    if (!this.screens[screen]) {
	        this.screens[screen] = Screen.build(screen);
	    }

	    return this.screens[screen];
	};

	Game.prototype.pause = function () {
	    if (this.interval) {
	        clearInterval(this.interval);
	        this.pauseState = this.screen;
	        this.screen = this.getScreen('pause');
	        this.screen.draw();
	        this.interval = null;
	    } else {
	        this.start();
	    }
	};

	Game.prototype.start = function () {
	    if (this.interval) {
	        return;
	    }

	    this.screen = this.pauseState;
	    this.pauseState = null;

	    var self = this;
	    this.interval = setInterval(function () {
	        self.next();
	        self.draw();
	    }, 1000 / 24);
	};

	Game.prototype.over = function() {
	    this.screen = this.getScreen('over');
	};

	Game.prototype.defineGamepad = function() {
	    document.addEventListener('keydown', function (ev) {
	        if ([37, 38, 39, 40, 87, 83, 65, 86, 32, 13, 27].indexOf(ev.which) !== -1) {
	            var keyCode = Gamepad.get(ev.which);
	            if (keyCode === 'PAUSE') {
	                return window.game.pause();
	            }
	            return window.game.screen.send(keyCode);
	        }
	    });
	};

	Game.prototype.draw = function() {
	    this.players.forEach(function (player) {
	        player.draw();
	    });
	    this.hud.draw();
	    this.screen.draw();
	    this.footer.draw();
	};

	Game.prototype.next = function () {
	    this.background.next();
	};

	module.exports = Game;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Star = __webpack_require__(3);

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

/***/ },
/* 3 */
/***/ function(module, exports) {

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

/***/ },
/* 4 */
/***/ function(module, exports) {

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


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var HomeScreen = __webpack_require__(6);
	var Sprite = __webpack_require__(8);

	function Footer() {
	    this.lifeSprite = new Sprite({
	        width: 22,
	        height: 28,
	        src: './assets/img/footer.gif'
	    });

	    this.stageSprite = new Sprite({
	        width: 16,
	        height: 28,
	        line:1,
	        src: './assets/img/footer.gif'
	    });
	}

	Footer.prototype.lifes = function () {
	    var player = window.game.player;
	    for(var i = 1; i < player.lifes; i++) {
	        var offset = 8 + i * 32;
	        this.lifeSprite.draw(offset, 430);
	    }
	};

	Footer.prototype.stage = function () {
	    var player = window.game.player;
	    for(var i = 0; i < player.stage; i++) {
	        var offset = 584 - i * 16;
	        this.stageSprite.draw(offset, 430);
	    }
	};

	Footer.prototype.draw = function() {
	    if (window.game.screen instanceof HomeScreen) {
	        return;
	    }

	    this.lifes();
	    this.stage();
	};

	module.exports = Footer;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Player = __webpack_require__(7);
	var Sprite = __webpack_require__(8);
	var Sfx = __webpack_require__(9);

	function HomeScreen() {
	    this.option = 1;
	    this._init();
	}

	HomeScreen.prototype._init = function () {
	    this.mainSound = new Sfx('./assets/sfx/main.mp3');
	    this.mainSound.play();
	    this.logo = new Sprite({
	        width: 288,
	        height: 88,
	        src: './assets/img/logo.gif'
	    });

	};

	HomeScreen.prototype.select = function () {
	    var text = window.game.text;
	    var ctx = window.game.ctx;
	    var y = this.option === 1 ? 262 : 286;

	    text.setColor(0x6);
	    text.setFont(14);
	    ctx.textAlign = "left";
	    ctx.fillText("1 PLAYER", 252, 262);
	    ctx.fillText("2 PLAYERS", 252, 286);

	    text.setColor(0xF);
	    ctx.fillText("▶", 224, y);
	};

	HomeScreen.prototype.copyright = function () {
	    var text = window.game.text;
	    var ctx = window.game.ctx;

	    text.setColor(0x5);
	    text.setFont(13);
	    ctx.textAlign = "center";
	    ctx.fillText("NAMCO©", 320, 330);
	};

	HomeScreen.prototype.footer = function () {
	    var text = window.game.text;
	    var ctx = window.game.ctx;

	    text.setColor(0x3);
	    text.setFont(13);
	    ctx.textAlign = "center";
	    ctx.fillText("© 1979 1996 NAMCO LTD", 320, 360);
	    ctx.fillText("ALL RIGHTS RESERVED", 320, 380);
	};

	HomeScreen.prototype.draw = function () {
	    this.logo.draw(176, 128);
	    this.select();
	    this.copyright();
	    this.footer();
	};

	HomeScreen.prototype.send = function (key) {
	    if (key === 'UP' && this.option === 2) {
	        this.option = 1;
	    } else if (key === 'DOWN' && this.option === 1) {
	        this.option = 2;
	    } else if (key === 'START') {
	        this.start();
	    }
	};

	HomeScreen.prototype.start = function () {
	    var game = window.game;
	    this.mainSound.stop();
	    game.players = [];
	    for (var i = 0; i < this.option; i++) {
	        game.players.push(new Player(i + 1));
	    }
	    game.player = game.players[0];
	    game.screen = game.getScreen('ready');
	};

	module.exports = HomeScreen;

/***/ },
/* 7 */
/***/ function(module, exports) {

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

/***/ },
/* 8 */
/***/ function(module, exports) {

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

/***/ },
/* 9 */
/***/ function(module, exports) {

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

/***/ },
/* 10 */
/***/ function(module, exports) {

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

/***/ },
/* 11 */
/***/ function(module, exports) {

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

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var ReadyScreen = __webpack_require__(13);
	var GameScreen = __webpack_require__(14);
	var GameOverScreen = __webpack_require__(22);
	var HomeScreen = __webpack_require__(6);
	var PauseScreen = __webpack_require__(23);


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

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var Sfx = __webpack_require__(9);

	function ReadyScreen() {
	    this._init();
	}

	ReadyScreen.prototype._init = function () {
	    var intro = new Sfx('./assets/sfx/intro.wav');
	    setTimeout(function () {
	        intro.play();
	        window.game.screen = window.game.getScreen('game');
	        window.game.screen._init();
	    }, 1500);
	};

	ReadyScreen.prototype.draw = function () {
	    var text = window.game.text;
	    var ctx = window.game.ctx;
	    var player = window.game.player;

	    text.setColor(0x5);
	    ctx.textAlign = "center";
	    ctx.textBaseline = "middle";
	    ctx.fillText("PLAYER " + player.id, 320, 240);
	    ctx.fillText("READY", 320, 260);
	};

	ReadyScreen.prototype.send = function () {};

	module.exports = ReadyScreen;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var Ship = __webpack_require__(15);
	var Swarm = __webpack_require__(16);

	function GameScreen() {
	    this._init();
	}

	GameScreen.prototype._init = function () {
	    this.ship = this.ship || new Ship();
	    this.swarm = this.swarm || new Swarm();
	};

	GameScreen.prototype.draw = function () {
	    var game = window.game;

	    this.swarm.draw();
	    this.ship.draw();

	    if (this.swarm.aliens.length === 0) {
	        this.swarm = null;
	        game.player.stage++;
	        game.screen = game.getScreen('ready');
	        game.screen._init();
	    }
	};

	GameScreen.prototype.send = function (key) {
	    if (key == 'LEFT') {
	        this.ship.left();
	    } else if (key == 'RIGHT') {
	        this.ship.right();
	    } else if (key === 'FIRE') {
	        this.ship.fire();
	    } else if (key === 'DOWN') {
	        this.ship.explode();
	    }
	};

	module.exports = GameScreen;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var Sprite = __webpack_require__(8);
	var Sfx = __webpack_require__(9);

	function Ship() {
	    this.pos = {x: 320, y: 384};
	    this.bullet = {x: 320, y: 384};
	    this.readyState = true;
	    this.state = 2;
	    this.shipImg = new Sprite({
	        width: 26,
	        height: 39,
	        frames: 2,
	        animate: false,
	        src: './assets/img/ship.gif'
	    });

	    this.shipExplode = new Sprite({
	        width: 64,
	        height: 64,
	        frames: 4,
	        fps: 4,
	        src: './assets/img/ship-explode.gif'
	    });

	    this.fireSfx = new Sfx('./assets/sfx/fire.wav');
	}

	Ship.prototype.draw = function () {
	    if (this.state == 2) {
	        if (!this.readyState) {
	            this.drawBullet();
	        }
	        this.shipImg.draw(this.pos.x, this.pos.y);
	    } else if(this.state == 1) {
	        this.shipExplode.draw(this.pos.x - 18, this.pos.y - 19);
	    }
	};

	Ship.prototype.left = function () {
	    this.pos.x -= 8;
	    if (this.pos.x < 40) {
	        this.pos.x = 40;
	    }
	};

	Ship.prototype.right = function () {
	    this.pos.x += 8;
	    if (this.pos.x > 574) {
	        this.pos.x = 574;
	    }
	};

	Ship.prototype.fire = function () {
	    if (!this.readyState) {
	        return;
	    }

	    var self = this;
	    self.fireSfx.play();
	    self.shipImg.frame = 1;
	    self.readyState = false;
	    self.bullet = {
	        x: self.pos.x + 13,
	        y: self.pos.y
	    };
	};

	Ship.prototype.drawBullet = function () {
	    var self = this;
	    var ctx = window.game.ctx;

	    self.bullet.y -= 15;
	    if (self.bullet.y < 0) {
	        self.fireSfx.stop();
	        self.shipImg.frame = 0;
	        self.readyState = true;
	    }

	    ctx.strokeStyle = "yellow";
	    ctx.lineWidth = 2;
	    ctx.beginPath();
	    ctx.moveTo(self.bullet.x, self.bullet.y);
	    ctx.lineTo(self.bullet.x, self.bullet.y - 7);
	    ctx.stroke();
	};

	Ship.prototype.explode = function() {
	    var self = this;
	    self.state = 1;
	    setTimeout(function() {
	        window.game.screen.ship = false;
	        var player = window.game.player;
	        player.lifes--;
	        var screenName = player.lifes <= 0 ? 'over' : 'ready';
	        window.game.screen = window.game.getScreen(screenName);
	        window.game.screen._init();
	    }, 1000);
	};

	module.exports = Ship;





/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var AlienGreen = __webpack_require__(17);
	var AlienPurple = __webpack_require__(19);
	var AlienRed = __webpack_require__(20);
	var Flagship = __webpack_require__(21);
	var Sfx = __webpack_require__(9);

	function Swarm() {
	    this.aliens = [];
	    this.grid = [];
	    this.dir = 1;  // 1 - to left | -1 - to right
	    this.velocity = 2;
	    this.waveSfx = new Sfx('./assets/sfx/wave.wav');

	    this._init();
	}

	Swarm.prototype._init = function () {
	    var i, j, x, y, alien, line,
	        top = 120;

	    // Flagship
	    line = [];
	    for (i = 0; i < 2; i++) {
	        x = 142 + i * 102;
	        alien = new Flagship(x, top, 0);
	        this.aliens.push(alien);
	        line.push(alien);
	    }
	    this.grid.push(line);

	    // Red SpaceShip
	    line = [];
	    for (i = 0; i < 6; i++) {
	        x = 108 + i * 34;
	        alien = new AlienRed(x, top + 28, i);
	        this.aliens.push(alien);
	        line.push(alien);
	    }
	    this.grid.push(line);

	    // Purple SpaceShip
	    line = [];
	    for (i = 0; i < 8; i++) {
	        x = 74 + i * 34;
	        alien = new AlienPurple(x, top + 56, i + 1);
	        this.aliens.push(alien);
	        line.push(alien);
	    }
	    this.grid.push(line);

	    // Green SpaceShip
	    for (j = 0; j < 3; j++) {
	        line = [];
	        for (i = 0; i < 10; i++) {
	            x = 40 + i * 34;
	            y = top + (j + 3) * 28;
	            alien = new AlienGreen(x, y, i + 2);
	            this.aliens.push(alien);
	            line.push(alien);
	        }
	        this.grid.push(line);
	    }

	    this.waveSfx.loop();

	};

	Swarm.prototype.next = function () {
	    var self = this;
	    var isRight = self.aliens.every(function (alien) {
	        var posX = alien.pos.x + self.dir * self.velocity;
	        return posX < 578 && posX > 40;
	    });

	    if (!isRight) {
	        self.dir *= (-1);
	    }

	    self.aliens = self.aliens.map(function (alien) {
	        alien.pos.x = alien.pos.x + self.dir * self.velocity;
	        return alien;
	    })
	};

	Swarm.prototype.draw = function () {
	    var self = this;
	    self.aliens = self.aliens.filter(function(alien) {
	        return alien.isAlive();
	    });

	    self.aliens.forEach(function (alien) {
	        alien.draw();
	    });

	    self.next();
	};

	module.exports = Swarm;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var Alien = __webpack_require__(18);

	function AlienGreen() {
	    this.txId = 0;
	    this.score = 60;
	    Alien.apply(this, arguments);
	}

	AlienGreen.prototype = Object.create(Alien.prototype);
	AlienGreen.prototype.constructor = AlienGreen;

	module.exports = AlienGreen;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var Sprite = __webpack_require__(8);
	var Sfx = __webpack_require__(9);

	function Alien(x, y, idx) {
	    if (this.constructor === Alien) {
	        throw new Error("Can't instantiate abstract class!");
	    }

	    this.pos = {
	        x: x,
	        y: y
	    };

	    this.state = 2;

	    this.spaceshipTx = new Sprite({
	        width: 22,
	        height: 22,
	        frame: idx % 3,
	        frames: 3,
	        line: this.txId,
	        src: './assets/img/aliens-state.gif'
	    });

	    this.jumpLTx = new Sprite({
	        width: 24,
	        height: 24,
	        frames: 9,
	        line: this.txId * 2,
	        src: './assets/img/aliens-move.gif'
	    });

	    this.jumpRTx = new Sprite({
	        width: 24,
	        height: 24,
	        frames: 9,
	        line: this.txId * 2 + 1,
	        src: './assets/img/aliens-move.gif'
	    });

	    this.explosionTx = new Sprite({
	        width: 32,
	        height: 32,
	        frames: 4,
	        fps: 8,
	        src: './assets/img/aliens-die.gif'
	    });

	    this.explodeSfx = new Sfx('./assets/sfx/explode.wav');
	}

	Alien.DEAD = 0;
	Alien.INJURED = 1;
	Alien.ALIVE = 2;
	Alien.JUMP_L = 3;
	Alien.JUMP_R = 4;

	Alien.prototype._isInjured = function() {
	    var bulletPos = window.game.screen.ship.bullet;
	    var alienPos = this.pos;

	    return bulletPos.x > alienPos.x &&
	        bulletPos.x < alienPos.x + 22 &&
	        bulletPos.y > alienPos.y &&
	        bulletPos.y < alienPos.y + 22;
	};

	Alien.prototype.isAlive = function () {
	    if (this.state === Alien.DEAD) {
	        return false;
	    }

	    if (!this._isInjured()) {
	        return true;
	    }

	    this.explode();

	    var ship = window.game.screen.ship;

	    ship.readyState = true;
	    ship.bullet = {x: 0, y: 0};

	    window.game.player.addPts(this.score);
	    return true;
	};

	Alien.prototype.explode = function () {
	    var self = this;

	    this.state = Alien.INJURED;
	    this.explodeSfx.play();
	    this.expPos = {
	        x: this.pos.x - 5,
	        y: this.pos.y - 5
	    };

	    setTimeout(function () {
	        self.state = Alien.DEAD;
	    }, 500);
	};

	Alien.prototype.jump = function () {
	    self.state = Alien.JUMP_L;
	};

	Alien.prototype.draw = function () {
	    switch (this.state) {
	        case Alien.DEAD:
	            console.log('Alien dead');
	            break;
	        case Alien.INJURED:
	            this.explosionTx.draw(this.expPos.x, this.expPos.y);
	            break;
	        case Alien.ALIVE:
	            this.spaceshipTx.draw(this.pos.x, this.pos.y);
	            break;
	        case Alien.JUMP_L:
	            this.jumpLTx.draw(this.pos.x - 1, this.pos.y - 1);
	            break;
	        case Alien.JUMP_R:
	            this.jumpRTx.draw(this.pos.x - 1, this.pos.y - 1);
	            break;
	    }
	};

	module.exports = Alien;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var Alien = __webpack_require__(18);

	function AlienPurple() {
	    this.txId = 2;
	    this.score = 80;
	    Alien.apply(this, arguments);
	}

	AlienPurple.prototype = Object.create(Alien.prototype);
	AlienPurple.prototype.constructor = AlienPurple;

	module.exports = AlienPurple;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var Alien = __webpack_require__(18);

	function AlienRed() {
	    this.txId = 1;
	    this.score = 100;
	    Alien.apply(this, arguments);
	}

	AlienRed.prototype = Object.create(Alien.prototype);
	AlienRed.prototype.constructor = AlienRed;

	module.exports = AlienRed;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var Alien = __webpack_require__(18);

	function Flagship() {
	    this.txId = 3;
	    this.score = 150;
	    Alien.apply(this, arguments);
	}

	Flagship.prototype = Object.create(Alien.prototype);
	Flagship.prototype.constructor = Flagship;

	module.exports = Flagship;

/***/ },
/* 22 */
/***/ function(module, exports) {

	function GameOverScreen() {
	    this._init();
	}

	GameOverScreen.prototype._init = function() {
	    return;
	};

	GameOverScreen.prototype.draw = function(){
	    var text = window.game.text;
	    var ctx = window.game.ctx;

	    text.setColor(0x5);
	    ctx.textAlign = "center";
	    ctx.textBaseline = "middle";
	    ctx.fillText("GAME OVER", 320, 240);
	};

	GameOverScreen.prototype.send = function(key) {
	    if (key === 'START') {
	        window.game.screen = window.game.getScreen('home');
	    }
	};

	module.exports = GameOverScreen;

/***/ },
/* 23 */
/***/ function(module, exports) {

	function PauseScreen() {
	    this._init();
	}

	PauseScreen.prototype._init = function() {
	    return;
	};

	PauseScreen.prototype.draw = function(){
	    var text = window.game.text;
	    var ctx = window.game.ctx;

	    text.setColor(0x0);
	    ctx.globalAlpha = 0.5;
	    ctx.fillRect(0, 0, 640, 480);
	    ctx.globalAlpha = 1.0;

	    text.setColor(0x3);
	    ctx.textAlign = "center";
	    ctx.textBaseline = "middle";
	    ctx.fillText("PAUSE", 320, 240);
	};

	PauseScreen.prototype.send = function() {
	    return;
	};

	module.exports = PauseScreen;

/***/ }
/******/ ]);