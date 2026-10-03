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

    draw(): void {
        if (!this.ship || !this.swarm) {
            return;
        }

        this.steer(window.game.gamepad);
        this.swarm.draw(this.ship);
        this.ship.draw();

        if (this.swarm.aliens.length === 0) {
            this.swarm.waveSfx.stop();
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
