import events from '@game/events.js';

/**
 * Display toggles on the screen wrapper, done purely with CSS classes in `index.html`:
 * - C (easter egg): `.crt` adds vertical scanlines (the original monitor was rotated),
 *   phosphor color boost and flicker. The rounded glass/halo look is always on.
 * - 2: `.x2` shows the 640×480 canvas at 2× size (same pixels, each drawn 2×2).
 */
export default function bindDisplay(screen: HTMLElement): void {
    events.on('crtToggled', () => {
        screen.classList.toggle('crt');
    });
    events.on('zoomToggled', () => {
        screen.classList.toggle('x2');
    });
}
