/** Logical input action a key maps to. */
export type Action = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'FIRE' | 'START' | 'PAUSE' | 'MUTE';

/** Maps `KeyboardEvent.code` to an {@link Action}. */
const KEYS: Record<string, Action> = {
    ArrowUp: 'UP',
    KeyW: 'UP',
    ArrowDown: 'DOWN',
    KeyS: 'DOWN',
    ArrowLeft: 'LEFT',
    KeyA: 'LEFT',
    ArrowRight: 'RIGHT',
    KeyD: 'RIGHT',
    Space: 'FIRE',
    Enter: 'START',
    NumpadEnter: 'START',
    Escape: 'PAUSE',
    KeyM: 'MUTE'
};

/**
 * Keyboard state tracker. Keys are tracked by `KeyboardEvent.code`,
 * so continuous input (movement) can be polled with {@link Gamepad.isDown}.
 */
export default class Gamepad {
    private held = new Set<string>();

    /** Returns the action for a key code, or `undefined` if the key is unmapped. */
    static get(code: string): Action | undefined {
        return KEYS[code];
    }

    /** Marks a key as held. */
    press(code: string): void {
        this.held.add(code);
    }

    /** Marks a key as released. */
    release(code: string): void {
        this.held.delete(code);
    }

    /** Releases all keys (on blur or pause, so keys don't stick). */
    reset(): void {
        this.held.clear();
    }

    /** Whether any key mapped to `action` is currently held. */
    isDown(action: Action): boolean {
        for (const code of this.held) {
            if (KEYS[code] === action) {
                return true;
            }
        }
        return false;
    }
}
