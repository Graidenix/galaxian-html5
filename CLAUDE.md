# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A browser clone of the arcade game Galaxian, drawn on a 640×480 `<canvas>`. TypeScript, built with Vite. No framework, no test suite.

## Layout and build

- `src/` holds the source. Entry is `src/main.ts` (loaded by `index.html` as `<script type="module">`), which creates `new Game(ctx)` and calls `game.defineGamepad()`.
- `public/assets/` holds images, sfx, fonts. Code references them by runtime strings like `./assets/...`, so they must stay in Vite's public dir (copied verbatim, not hashed).
- Icons live in `public/` and are generated from frame 0 of `ship.gif`. `favicon.ico` holds BMP-encoded 16/32/48px images (48 at 1:1 pixels). `icon-192.png`/`icon-512.png` are for the PWA manifest (`manifest.webmanifest`), and `apple-touch-icon.png` is 180px on black. The PNGs use whole-number pixel scaling.
- `vite.config.ts`: `base: './'`, `build.assetsDir: 'static'` (avoids colliding with `public/assets`).
- `tsconfig.json`: `strict`, `moduleResolution: bundler`. Imports use the `.js` extension (resolves to `.ts`).
- `src/types/global.d.ts` declares `window.game: Game`.
- **Display** (`src/display.ts` + CSS in `index.html`): the canvas sits in `#screen-frame`, which always has the rounded-glass look (radius, halo glow, glare/vignette overlay). `2` (`ZOOM`) toggles `.x2`, which shows the same 640×480 canvas at exactly 2× size; it's capped to the viewport width. `C` (`CRT`) is a hidden easter egg, not in the legend or README: it toggles `.crt`, which adds vertical scanlines (the original monitor was mounted rotated), a phosphor color boost and flicker. The canvas is sized by its content box at 4:3, so pixel scaling stays exact. The overlays need `z-index: 1` because the CRT `filter` puts the canvas on its own layer.
- **SEO/sharing**: `index.html` has a meta description, a canonical URL, OpenGraph and Twitter card tags. They use absolute URLs on the live domain `https://galaxian.odajiu.eu/`, so update them if the domain changes. `public/og-image.png` (1200×630) is a mid-dive gameplay frame.
- `index.html` lays out the canvas (scaled down to fit narrow screens, `image-rendering: pixelated`) above the controls legend; its CSS colors are custom properties on `:root`.
- TypeScript is pinned to ~6.0 because typescript-eslint doesn't support TS 7 yet.
- ESLint flat config (`eslint.config.js`): recommended + typescript-eslint.
- Path alias `@game/*` → `src/*` (`tsconfig.json` `paths` + `vite.config.ts` `resolve.alias`; keep both in sync). Cross-folder imports go through the barrels (`@game/commands`, `@game/elements`, `@game/models`, `@game/screens`, each an `index.ts` re-exporting defaults as named exports). Imports inside a folder (including `models/aliens/` → `../alien.js`) stay direct to avoid barrel cycles. New modules in these folders need an entry in their `index.ts`.

```sh
npm install
npm run dev        # dev server
npm run build      # tsc --noEmit && vite build → dist/
npm run preview    # serve dist/
npm run typecheck
npm run lint
```

## Architecture

**Global singleton.** The `Game` constructor sets `window.game = this`. Almost every module reaches shared state through that global rather than through injected references: `window.game.ctx`, `.text`, `.screen`, `.player`, `.gamepad`, `getScreen()`, `switchScreen()`. Because of this, `Game` must be constructed before any `Sprite`, `Text`, or screen is created — and `Game` assigns those members in its constructor body after `window.game = this`, not as field initializers.

**Game loop** (`src/game.ts`). `requestAnimationFrame` drives a fixed-timestep accumulator at `TICK_RATE` (60, `src/config.ts`), capped at 5 catch-up steps. Each tick calls `next()` (advances the background) then `draw()` (players, HUD, current screen, footer). Update and draw are still entangled: most entities advance state inside `draw()` (e.g. `Swarm.draw()` filters dead aliens, draws, then moves). Speeds are px/s divided by `TICK_RATE`; `Sprite` rounds draw positions.

**Events** (`src/events.ts`). A typed mitt bus: `alienKilled`, `scoreChanged`, `shipDestroyed`, `stageCleared`. `Game.bindEvents` handles score, lives and screen transitions; `Hud` listens to `scoreChanged`; `GameScreen` reloads the ship on `alienKilled`. Use `game.switchScreen(name)` (sets screen + `init()`) for transitions.

**Screens** (`src/screens/`). Each screen implements the `Screen` interface (`init()`, `draw()`, `send(action)`). `buildScreen(name: ScreenName)` is the factory, and `game.getScreen(name)` caches instances, so `init()` re-runs on every `game.switchScreen(name)`. Flow: home → ready → game → ready (next stage, or after losing a life) / over → home. Pause swaps in the `pause` screen, saves the previous one in `game.pauseState`, stops the rAF loop and mutes sound. Window blur or a hidden tab also pauses. On game over, `GameScreen.reset()` discards the ship and swarm, so the next game starts with a full formation. `GameScreen.resetShip()` drops the ship after death so the next `init()` builds a new one.

**Input** (`src/commands/gamepad.ts`). `Game.defineGamepad` listens to `keydown`/`keyup` and forwards them to `Game.pressKey(code, repeat)`/`releaseKey(code)`, which map `KeyboardEvent.code` via the `KEYS` table to actions (`UP`, `DOWN`, `LEFT`, `RIGHT`, `FIRE`, `START`, `PAUSE`, `MUTE`, `CRT`, `ZOOM`). Held keys are tracked in `game.gamepad` and polled with `isDown()` (ship movement in `GameScreen.steer`). Non-repeat presses are discrete. `START` (Enter) doubles as pause while paused or on the ready/game screens (`Game.isPausable`); `PAUSE` (Esc) is a silent alias. `MUTE` (M) toggles the player's mute. Other presses go to `game.screen.send(action)`. Audio is muted when the player has muted it or the game is paused (`Game.applyMute` → `Sfx.setMuted` → `Howler.mute`). Held state resets on window blur and pause.

**Controls** (`index.html` + `src/legend.ts`). `#controls` holds two navs, and CSS shows one at a time. `.legend` is the desktop row of keycaps. `.pad` is an NES-style gamepad shown at `max-width: 700px` or on coarse-pointer devices: D-pad, the select-style button = mute (captioned MUTE), START = Enter, and a single round button captioned FIRE. On mobile, the pad is pinned to the bottom (`.screen { margin-block: auto }`, safe-area bottom padding, `100dvh`) and the screen centres in the space above it. The pad is a balanced `1fr auto 1fr` grid, with the decorative stripes drawn inside the centre column. The FIRE well (`.pad-actions`) is the same size as the D-pad well (`3 × --pad-cell + 12px`), with the button centred in it. The 2× option is hidden on mobile, and its sizes are fluid down to 320px. Every control is a `button[data-code]`. `bindLegend` routes pointer down/up through `Game.pressKey`/`releaseKey`, so clicking or tapping behaves exactly like the key, including held movement. Buttons use pointer events only and `preventDefault` on pointerdown, so they never take focus and Space/Enter can't trigger them a second time. Real key presses add `.is-down` to the button for the same action. Buttons with `data-state="pause|mute|zoom"` reflect that state through `aria-pressed` (driven by `pauseChanged`, `muteChanged` and `zoomToggled`). To add a button, give it the `KeyboardEvent.code` of a key in `KEYS`.

**Models** (`src/models/`).
- `Alien` is an abstract class. Subclasses in `aliens/` pass `txId` (sprite-sheet row) and `score` to `super()` — not as fields, because the base constructor needs them before subclass fields initialize.
- `Swarm` builds the formation: a grid of rows (flagships, red, purple, then 3 rows of green). Each alien has a fixed `slot`. The formation sways by moving `Swarm.offsetX`, and in-formation aliens sit at `slot + offsetX`. `Swarm.draw(ship)` runs one tick: `alien.isAlive(ship.activeBullet)` does hit detection (only against a bullet in flight; a hit emits `alienKilled`), then sway, then `alien.update()`, then collisions and dive launches (only while the ship is alive), then bombs, then draw.
- **Dive attacks**: on a random timer (`DIVE_DELAY`, which shortens as aliens die; at most `MAX_DIVERS` out at once), an alien from a row end does a half-loop up and outward, then falls toward the ship. It steers until `COMMIT_DISTANCE` above the ship, so the player can dodge. A diver that touches the ship (`Ship.overlaps`) kills both. Divers that fall off the bottom re-enter from the top as `RETURNING` and fly back to their slot. When the ship dies, `GameScreen.resetShip()` calls `Swarm.recall()`. Flight tuning constants are at the top of `alien.ts`.
- **Bombs** (`bomb.ts`): during the attack phase, each diver drops 1–`MAX_BOMBS` bombs through `Alien.tryBomb(target)`. They start after a short random delay, are spaced `BOMB_INTERVAL` apart, and stop once the diver is within `BOMB_MIN_GAP` of the ship. A bomb falls at a fixed speed and drifts toward where the ship was when it was fired; the drift is clamped. `Swarm` owns the bombs in flight, and a bomb hitting the ship explodes it. Bombs keep falling after their alien dies, and `Swarm.recall()` clears them.
- Dive sprites come from `aliens-move.gif`. It has 9 rotation frames per type, from frame 0 (facing down) to frame 8 (facing up), with even and odd rows turning opposite ways. Only green, red and purple have rows there. The flagship rotates its idle sprite with `Sprite.drawRotated` instead.
- `Ship` allows one bullet at a time: `readyState` gates firing. Explosion and death are sequenced with `setTimeout`.
- States are `as const` objects with matching types: `AlienState` (`DEAD`, `INJURED`, `ALIVE` = in formation, `DIVING`, `RETURNING`) and `ShipState` (`EXPLODING`, `ALIVE`).

**Rendering helpers** (`src/commands/`).
- `Sprite` crops frames out of a sprite sheet. The frame index selects the x offset and `line` selects the y offset.
- `Sfx` wraps a Howler `Howl` (overlapping playback, mobile audio unlock).
- `Text` (in `color.ts`) maps a 16-color palette index (`0x0`–`0xF`) to `fillStyle` and sets the size of the `NES` font. The `@font-face` for `NES` is declared in `index.html`.

## Conventions

- **JSDoc:** every class gets a `/** */` summary, and so does any public member whose purpose or units aren't obvious from its name. Use `@param` only for unclear arguments, and leave types out of tags because TS already has them. Put member docs in `/** */`, not `//`, so they show on hover. Skip trivial members like `draw()`.
- **Speeds and timing:** speeds are px/s constants divided by `TICK_RATE` per tick. Never hardcode per-tick amounts or 24/60. For any gameplay delay that changes state (a screen switch, an emitted event), count it down in ticks rather than with `setTimeout`, so it freezes while paused. `ReadyScreen` and `Ship.explode` work this way.
- **Cross-module effects:** emit an event on the `events` bus and handle it in its owner (usually `Game.bindEvents`), rather than mutating another module's state through `window.game`.
- **New keys:** add them to the `KEYS` table in `gamepad.ts` (and to `Action` if it's a new action).
- **New modules** in `commands/`, `elements/`, `models/` or `screens/` need an export in their folder's `index.ts`.
