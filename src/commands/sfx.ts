import { Howl, Howler } from 'howler';

/** WebKit's Audio Session API (iOS 17+); not in TypeScript's DOM lib yet. */
type NavigatorWithAudioSession = Navigator & { audioSession?: { type: string } };

// Howler suspends the AudioContext after 30 s of silence and resumes it from play(),
// which isn't a user gesture; iOS can refuse that resume and stay silent.
Howler.autoSuspend = false;

/**
 * A single sound effect backed by Howler.
 * Overlapping `play()` calls each get their own voice.
 */
export default class Sfx {
    private readonly howl: Howl;

    /** @param src URL relative to `index.html`, e.g. `./assets/sfx/fire.wav` */
    constructor(src: string) {
        this.howl = new Howl({ src: [src] });
    }

    /**
     * Keeps audio playable on iOS (Safari and Chrome, both WebKit):
     * - routes Web Audio as `playback`, so the ring/silent switch doesn't mute the game;
     * - resumes the AudioContext on every user gesture. Howler unlocks only once, but iOS
     *   also leaves the context `suspended`/`interrupted` after calls, lock screen or app
     *   switches, and only a gesture can resume it. Touch *down* doesn't count as a gesture
     *   in WebKit, so this listens to lift and click events too.
     */
    static enableOnUserGesture(): void {
        const session = (navigator as NavigatorWithAudioSession).audioSession;
        if (session) {
            session.type = 'playback';
        }

        const resume = (): void => {
            const ctx = Howler.ctx as AudioContext | undefined;
            if (ctx && ctx.state !== 'running') {
                void ctx.resume();
            }
        };
        for (const type of ['touchend', 'pointerup', 'click', 'keydown']) {
            document.addEventListener(type, resume, true);
        }
    }

    /** Mutes or unmutes every sound globally. */
    static setMuted(muted: boolean): void {
        Howler.mute(muted);
    }

    /** Plays once. */
    play(): void {
        this.howl.loop(false);
        this.howl.play();
    }

    /** Plays on repeat until {@link Sfx.stop}. */
    loop(): void {
        this.howl.loop(true);
        this.howl.play();
    }

    /** Stops every playing voice of this sound. */
    stop(): void {
        this.howl.stop();
    }
}
