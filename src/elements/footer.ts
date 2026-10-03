import { HomeScreen } from '@game/screens';
import { Sprite } from '@game/commands';

/** Bottom bar: remaining lives (left) and stage flags (right). Hidden on the home screen. */
export default class Footer {
    private readonly lifeSprite = new Sprite({
        width: 22,
        height: 28,
        src: './assets/img/footer.gif'
    });

    private readonly stageSprite = new Sprite({
        width: 16,
        height: 28,
        line: 1,
        src: './assets/img/footer.gif'
    });

    /** Draws one ship icon per spare life. */
    lifes(): void {
        const player = window.game.player;
        for (let i = 1; i < player.lifes; i++) {
            const offset = 8 + i * 32;
            this.lifeSprite.draw(offset, 430);
        }
    }

    /** Draws one flag per stage reached. */
    stage(): void {
        const player = window.game.player;
        for (let i = 0; i < player.stage; i++) {
            const offset = 584 - i * 16;
            this.stageSprite.draw(offset, 430);
        }
    }

    draw(): void {
        if (window.game.screen instanceof HomeScreen) {
            return;
        }

        this.lifes();
        this.stage();
    }
}
