import { Gamepad } from '@game/commands';
import events from '@game/events.js';
import type Game from './game.js';

/**
 * Wires the on-page controls legend (outside the canvas).
 *
 * Each `button[data-code]` acts as the key named by its `KeyboardEvent.code`:
 * pressing it goes through `Game.pressKey`/`releaseKey`, so held movement works
 * with mouse or touch. Real key presses light up the button for the same action,
 * and the PAUSE/MUTE/ZOOM buttons show `aria-pressed` while active.
 */
export default function bindLegend(root: HTMLElement, game: Game): void {
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('button[data-code]'));

    const setDown = (code: string, down: boolean): void => {
        const action = Gamepad.get(code);
        buttons
            .filter((button) => Gamepad.get(button.dataset.code ?? '') === action)
            .forEach((button) => button.classList.toggle('is-down', down));
    };

    for (const button of buttons) {
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

    const toggleButton = (action: string, pressed: boolean): void => {
        buttons
            .filter((button) => Gamepad.get(button.dataset.code ?? '') === action)
            .forEach((button) => button.setAttribute('aria-pressed', String(pressed)));
    };
    events.on('pauseChanged', (paused) => toggleButton('PAUSE', paused));
    events.on('muteChanged', (muted) => toggleButton('MUTE', muted));
    let zoomed = false;
    events.on('zoomToggled', () => {
        zoomed = !zoomed;
        toggleButton('ZOOM', zoomed);
    });
}
