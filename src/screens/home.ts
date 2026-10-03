import { Player } from '@game/models';
import { Sfx, Sprite, type Action } from '@game/commands';
import type { Screen } from './screen.js';

/** Title screen: logo, 1/2-player choice, plays the theme. */
export default class HomeScreen implements Screen {
    private option = 1;
    private readonly mainSound = new Sfx('./assets/sfx/main.mp3');
    private readonly logo = new Sprite({
        width: 288,
        height: 88,
        src: './assets/img/logo.gif'
    });

    constructor() {
        this.init();
    }

    init(): void {
        this.mainSound.play();
    }

    private select(): void {
        const text = window.game.text;
        const ctx = window.game.ctx;
        const y = this.option === 1 ? 262 : 286;

        text.setColor(0x6);
        text.setFont(14);
        ctx.textAlign = "left";
        ctx.fillText("1 PLAYER", 252, 262);
        ctx.fillText("2 PLAYERS", 252, 286);

        text.setColor(0xF);
        ctx.fillText("▶", 224, y);
    }

    private copyright(): void {
        const text = window.game.text;
        const ctx = window.game.ctx;

        text.setColor(0x5);
        text.setFont(13);
        ctx.textAlign = "center";
        ctx.fillText("NAMCO©", 320, 330);
    }

    private footer(): void {
        const text = window.game.text;
        const ctx = window.game.ctx;

        text.setColor(0x3);
        text.setFont(13);
        ctx.textAlign = "center";
        ctx.fillText("© 1979 1996 NAMCO LTD", 320, 360);
        ctx.fillText("ALL RIGHTS RESERVED", 320, 380);
    }

    draw(): void {
        this.logo.draw(176, 128);
        this.select();
        this.copyright();
        this.footer();
    }

    send(action: Action): void {
        if (action === 'UP' && this.option === 2) {
            this.option = 1;
        } else if (action === 'DOWN' && this.option === 1) {
            this.option = 2;
        } else if (action === 'START') {
            this.start();
        }
    }

    /** Creates the players and goes to the ready screen. */
    private start(): void {
        const game = window.game;
        this.mainSound.stop();
        game.players = [];
        for (let i = 0; i < this.option; i++) {
            game.players.push(new Player(i + 1));
        }
        game.player = game.players[0];
        game.switchScreen('ready');
    }
}
