import { Ship, Swarm } from '@game/models';
import events from '@game/events.js';
import type { Action, Gamepad } from '@game/commands';
import type { Screen } from './screen.js';

/** Gameplay: ship, swarm, steering and firing. */
export default class GameScreen implements Screen {
    private ship: Ship | null = null;
    private swarm: Swarm | null = null;

    constructor() {
        this.init();

        events.on('alienKilled', () => {
            this.ship?.reload();
        });
    }

    /** Creates a ship/swarm if missing; keeps existing ones (e.g. the swarm after a death). */
    init(this: GameScreen): void {
        this.ship ??= new Ship();
        this.swarm ??= new Swarm();
    }

    /** Drops the ship so the next `init()` builds a fresh one, and calls attacking aliens back. */
    resetShip(): void {
        this.ship = null;
        this.swarm?.recall();
    }

    /** Discards the ship and swarm (game over) so the next game starts with a full formation. */
    reset(): void {
        this.swarm?.stop();
        this.swarm = null;
        this.ship = null;
    }

    draw(): void {
        const {ship, swarm} = this;
        if (!ship || !swarm) {
            return;
        }

        this.steer(window.game.gamepad);
        swarm.draw(ship);
        ship.draw();

        // ship.draw() can emit shipDestroyed, whose handler may reset this screen.
        if (this.swarm !== swarm) {
            return;
        }

        if (swarm.aliens.length === 0) {
            swarm.stop();
            this.swarm = null;
            events.emit('stageCleared');
        }
    }

    /** Moves the ship while LEFT/RIGHT is held. */
    private steer(gamepad: Gamepad): void {
        if (gamepad.isDown('LEFT')) {
            this.ship?.left();
        } else if (gamepad.isDown('RIGHT')) {
            this.ship?.right();
        }
    }

    /** FIRE shoots; DOWN self-destructs (debug). */
    send(action: Action): void {
        if (action === 'FIRE') {
            this.ship?.fire();
        } else if (action === 'DOWN') {
            this.ship?.explode();
        }
    }
}
