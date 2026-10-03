import { Gamepad } from '@game/commands';
import events from '@game/events.js';
import type Game from './game.js';

/**
 * Wires the on-page controls outside the canvas: the desktop keycap legend and the
 * mobile NES-style pad (CSS shows one or the other).
 *
 * Each `button[data-code]` acts as the key named by its `KeyboardEvent.code`,
 * pressed on pointer *down* and held until the pointer lifts, through
 * `Game.pressKey`/`releaseKey`. That gives the keyboard's held-key behavior: continuous
 * movement and auto-fire. Every pointer is tracked on its own, so two thumbs (direction
 * plus FIRE) work together.
 *
 * The mobile D-pad (`.pad-dpad`) is one touch surface rather than four buttons.
 * Direction follows the finger, with a center dead zone, so rolling a thumb from ← to →
 * switches direction without lifting, like a real NES cross.
 *
 * Real key presses light up every button for the same action. Buttons with
 * `data-state="pause|mute|zoom"` show `aria-pressed` while that state is on.
 */
export default function bindLegend(root: HTMLElement, game: Game): void {
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('button[data-code]'));

    const setDown = (code: string, down: boolean): void => {
        const action = Gamepad.get(code);
        buttons
            .filter((button) => Gamepad.get(button.dataset.code ?? '') === action)
            .forEach((button) => button.classList.toggle('is-down', down));
    };

    // Long-press on a pad button must not open a context menu (Android fires one on touch-hold).
    root.querySelector('.pad')?.addEventListener('contextmenu', (ev) => ev.preventDefault());

    const dpad = root.querySelector<HTMLElement>('.pad-dpad');
    if (dpad) {
        bindDpad(dpad, game, setDown);
    }

    for (const button of buttons) {
        if (dpad?.contains(button)) {
            continue; // handled as one surface by bindDpad
        }
        const code = button.dataset.code ?? '';

        button.addEventListener('pointerdown', (ev) => {
            ev.preventDefault(); // keep focus off the button, so Space/Enter never "click" it
            button.setPointerCapture(ev.pointerId);
            setDown(code, true);
            game.pressKey(code);
        });

        const release = (): void => {
            setDown(code, false);
            game.releaseKey(code);
        };
        button.addEventListener('pointerup', release);
        button.addEventListener('pointercancel', release);
    }

    document.addEventListener('keydown', (ev) => setDown(ev.code, true));
    document.addEventListener('keyup', (ev) => setDown(ev.code, false));
    window.addEventListener('blur', () => {
        buttons.forEach((button) => button.classList.remove('is-down'));
    });

    const showState = (state: string, pressed: boolean): void => {
        buttons
            .filter((button) => button.dataset.state === state)
            .forEach((button) => button.setAttribute('aria-pressed', String(pressed)));
    };
    events.on('pauseChanged', (paused) => showState('pause', paused));
    events.on('muteChanged', (muted) => showState('mute', muted));
    let zoomed = false;
    events.on('zoomToggled', () => {
        zoomed = !zoomed;
        showState('zoom', zoomed);
    });
}

/** Fraction of the D-pad's half-size around the center that counts as "no direction". */
const DPAD_DEAD_ZONE = 0.25;

/**
 * Makes the D-pad one touch surface: each pointer's direction is recomputed as it moves,
 * releasing the old key and pressing the new one when it changes.
 */
function bindDpad(dpad: HTMLElement, game: Game, setDown: (code: string, down: boolean) => void): void {
    const current = new Map<number, string | null>();

    const directionAt = (ev: PointerEvent): string | null => {
        const rect = dpad.getBoundingClientRect();
        const half = Math.min(rect.width, rect.height) / 2;
        const dx = ev.clientX - (rect.left + rect.width / 2);
        const dy = ev.clientY - (rect.top + rect.height / 2);
        if (Math.hypot(dx, dy) < half * DPAD_DEAD_ZONE) {
            return null;
        }
        if (Math.abs(dx) >= Math.abs(dy)) {
            return dx < 0 ? 'ArrowLeft' : 'ArrowRight';
        }
        return dy < 0 ? 'ArrowUp' : 'ArrowDown';
    };

    const set = (pointerId: number, code: string | null): void => {
        const previous = current.get(pointerId) ?? null;
        if (previous === code) {
            return;
        }
        if (previous) {
            setDown(previous, false);
            game.releaseKey(previous);
        }
        if (code) {
            setDown(code, true);
            game.pressKey(code);
        }
        current.set(pointerId, code);
    };

    dpad.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        dpad.setPointerCapture(ev.pointerId);
        set(ev.pointerId, directionAt(ev));
    });
    dpad.addEventListener('pointermove', (ev) => {
        if (current.has(ev.pointerId)) {
            set(ev.pointerId, directionAt(ev));
        }
    });
    const end = (ev: PointerEvent): void => {
        set(ev.pointerId, null);
        current.delete(ev.pointerId);
    };
    dpad.addEventListener('pointerup', end);
    dpad.addEventListener('pointercancel', end);
}
