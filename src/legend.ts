import { Gamepad } from '@game/commands';
import events from '@game/events.js';
import type Game from './game.js';

/**
 * Wires the on-page controls outside the canvas: the desktop keycap legend and the
 * mobile NES-style pad (CSS shows one or the other).
 *
 * Each `button[data-code]` acts as the key named by its `KeyboardEvent.code`:
 * pressing it goes through `Game.pressKey`/`releaseKey`, so held movement works
 * with mouse or touch. Real key presses light up every button for the same action.
 * Buttons with `data-state="pause|mute|zoom"` show `aria-pressed` while that state is on.
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
