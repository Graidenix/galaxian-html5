import { type default as Alien, AlienState, type DiveSide } from './alien.js';
import AlienGreen from './aliens/green.js';
import AlienPurple from './aliens/purple.js';
import AlienRed from './aliens/red.js';
import Flagship from './aliens/flagship.js';
import { Sfx } from '@game/commands';
import { TICK_RATE } from '@game/config.js';
import { type default as Ship, ShipState } from './ship.js';
import Bomb from './bomb.js';

const TOP = 120;
const ALIEN_SIZE = 22;
/** Most aliens out of formation at once. */
const MAX_DIVERS = 3;
/** Seconds between dive attempts, before scaling by how many aliens remain. */
const DIVE_DELAY = [1.5, 3.5] as const;

/**
 * The alien formation: flagships, red, purple, then three green rows.
 * Sways side to side, sends aliens from the row ends on dive attacks,
 * and loops the wave sound while alive.
 */
export default class Swarm {
    /** Aliens still in play, flat. */
    aliens: Alien[] = [];
    /** Formation rows, top to bottom (includes dead aliens). */
    grid: Alien[][] = [];
    /** Sway direction: 1 = right, -1 = left. */
    dir = 1;
    /** Current sway offset added to every slot's x. */
    offsetX = 0;
    /** Bombs in flight. */
    bombs: Bomb[] = [];
    /** Sway speed in px/s. */
    velocity = 48;
    readonly waveSfx = new Sfx('./assets/sfx/wave.mp3');
    private readonly total: number;
    private diveTimer: number;

    constructor() {
        // Flagships
        this.addRow(2, (i) => new Flagship(142 + i * 102, TOP, 0));
        // Red
        this.addRow(6, (i) => new AlienRed(108 + i * 34, TOP + 28, i));
        // Purple
        this.addRow(8, (i) => new AlienPurple(74 + i * 34, TOP + 56, i + 1));
        // Green
        for (let j = 0; j < 3; j++) {
            this.addRow(10, (i) => new AlienGreen(40 + i * 34, TOP + (j + 3) * 28, i + 2));
        }

        this.total = this.aliens.length;
        this.diveTimer = this.nextDiveDelay();
        this.waveSfx.loop();
    }

    private addRow(count: number, build: (i: number) => Alien): void {
        const line: Alien[] = [];
        for (let i = 0; i < count; i++) {
            line.push(build(i));
        }
        this.aliens.push(...line);
        this.grid.push(line);
    }

    /** Moves the formation's sway offset, reversing at the playfield edges. */
    private sway(): void {
        const step = this.dir * this.velocity / TICK_RATE;
        const fits = this.aliens.every((alien) => {
            const posX = alien.slot.x + this.offsetX + step;
            return posX < 578 && posX > 40;
        });

        if (!fits) {
            this.dir *= -1;
        }
        this.offsetX += this.dir * this.velocity / TICK_RATE;
    }

    /** Counts down to the next dive and launches one from a row end. */
    private launchDivers(): void {
        this.diveTimer -= 1 / TICK_RATE;
        if (this.diveTimer > 0) {
            return;
        }
        this.diveTimer = this.nextDiveDelay();

        const flying = this.aliens.filter((alien) => alien.isFlying).length;
        if (flying >= MAX_DIVERS) {
            return;
        }

        // Row ends among aliens still in formation; each loops out on its own side.
        const candidates: [Alien, DiveSide][] = [];
        this.grid.forEach((row) => {
            const inFormation = row.filter((alien) => alien.state === AlienState.ALIVE);
            if (inFormation.length > 0) {
                candidates.push([inFormation[0], -1]);
                candidates.push([inFormation[inFormation.length - 1], 1]);
            }
        });
        if (candidates.length === 0) {
            return;
        }

        const [alien, side] = candidates[Math.floor(Math.random() * candidates.length)];
        alien.dive(side);
    }

    /** Random delay that shortens as the formation thins out. */
    private nextDiveDelay(): number {
        const [min, max] = DIVE_DELAY;
        const remaining = this.aliens.length / this.total;
        return (min + Math.random() * (max - min)) * (0.4 + 0.6 * remaining);
    }

    /** Kills the ship and the alien when a flying alien touches it. */
    private checkCollisions(ship: Ship): void {
        for (const alien of this.aliens) {
            if (alien.isFlying && ship.overlaps(alien.pos, ALIEN_SIZE)) {
                alien.kill();
                ship.explode();
                return;
            }
        }
    }

    /** Drops new bombs from attacking aliens and moves existing ones; a hit destroys the ship. */
    private updateBombs(ship: Ship): void {
        const shipAlive = ship.state === ShipState.ALIVE;

        if (shipAlive) {
            const target = {x: ship.pos.x + 13, y: ship.pos.y};
            this.aliens.forEach((alien) => {
                const bomb = alien.tryBomb(target);
                if (bomb) {
                    this.bombs.push(bomb);
                }
            });
        }

        this.bombs.forEach((bomb) => bomb.update());
        this.bombs = this.bombs.filter((bomb) => {
            if (ship.state === ShipState.ALIVE && ship.overlaps(bomb.pos, Bomb.WIDTH, Bomb.HEIGHT)) {
                ship.explode();
                return false;
            }
            return !bomb.isGone;
        });
    }

    /** Silences the swarm and drops its bombs; call when discarding it. */
    stop(): void {
        this.waveSfx.stop();
        this.bombs = [];
    }

    /** Sends every flying alien back to the formation from the top and clears bombs (after the ship dies). */
    recall(): void {
        this.aliens.forEach((alien) => alien.recall());
        this.bombs = [];
    }

    /**
     * Runs one tick: drops dead aliens (hit-testing the ship's bullet), sways,
     * flies divers, moves bombs, then draws. Dives, collisions and new bombs
     * only happen while the ship is alive.
     */
    draw(ship: Ship): void {
        this.aliens = this.aliens.filter((alien) => alien.isAlive(ship.activeBullet));
        this.sway();

        const target = {x: ship.pos.x + 13 - ALIEN_SIZE / 2, y: ship.pos.y};
        this.aliens.forEach((alien) => alien.update(this.offsetX, target));

        if (ship.state === ShipState.ALIVE) {
            this.checkCollisions(ship);
            this.launchDivers();
        }
        this.updateBombs(ship);

        this.aliens.forEach((alien) => alien.draw());
        this.bombs.forEach((bomb) => bomb.draw());
    }
}
