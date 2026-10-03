import { Howl, Howler } from 'howler';

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
