# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A browser clone of the arcade game Galaxian, drawn on a 640×480 `<canvas>`. TypeScript, built with Vite. No framework, no test suite.

## Layout and build

- `src/` holds the source. Entry is `src/main.ts` (loaded by `index.html` as `<script type="module">`), which creates `new Game(ctx)` and calls `game.defineGamepad()`.
- `public/assets/` holds images, sfx, fonts. Code references them by runtime strings like `./assets/...`, so they must stay in Vite's public dir (copied verbatim, not hashed).
- `vite.config.ts`: `base: './'`, `build.assetsDir: 'static'` (avoids colliding with `public/assets`).
- `tsconfig.json`: `strict`, `moduleResolution: bundler`. Imports use the `.js` extension (resolves to `.ts`).
- `src/types/global.d.ts` declares `window.game: Game`.
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

**Screens** (`src/screens/`). Each screen implements the `Screen` interface (`init()`, `draw()`, `send(action)`). `buildScreen(name: ScreenName)` is the factory, and `game.getScreen(name)` caches instances, so `init()` re-runs on every `game.switchScreen(name)`. Flow: home → ready → game → ready (next stage, or after losing a life) / over → home. Pause swaps in the `pause` screen, saves the previous one in `game.pauseState`, and stops the rAF loop. `GameScreen.resetShip()` drops the ship after death so the next `init()` builds a new one.

**Input** (`src/commands/gamepad.ts`). `Game.defineGamepad` listens to `keydown`/`keyup` and maps `KeyboardEvent.code` via the `KEYS` table to actions (`UP`, `DOWN`, `LEFT`, `RIGHT`, `FIRE`, `START`, `PAUSE`). Held keys are tracked in `game.gamepad` and polled with `isDown()` (ship movement in `GameScreen.steer`). Non-repeat presses are discrete: `PAUSE` toggles the loop, others go to `game.screen.send(action)`. Held state resets on window blur and pause.

**Models** (`src/models/`).
- `Alien` is an abstract class. Subclasses in `aliens/` pass `txId` (sprite-sheet row) and `score` to `super()` — not as fields, because the base constructor needs them before subclass fields initialize.
- `Swarm` builds the formation: a grid of rows (flagships, red, purple, then 3 rows of green). It moves the formation side to side. `Swarm.draw(bullet)` runs `alien.isAlive(bullet)`, which also does hit detection; a hit emits `alienKilled`.
- `Ship` allows one bullet at a time: `readyState` gates firing. Explosion and death are sequenced with `setTimeout`.
- States are `as const` objects with matching types: `AlienState` (`DEAD`, `INJURED`, `ALIVE`, `JUMP_L`, `JUMP_R`) and `ShipState` (`EXPLODING`, `ALIVE`).

**Rendering helpers** (`src/commands/`).
- `Sprite` crops frames out of a sprite sheet. The frame index selects the x offset and `line` selects the y offset.
- `Sfx` wraps a Howler `Howl` (overlapping playback, mobile audio unlock).
- `Text` (in `color.ts`) maps a 16-color palette index (`0x0`–`0xF`) to `fillStyle` and sets the size of the `NES` font. The `@font-face` for `NES` is declared in `index.html`.

## Conventions

- **JSDoc:** every class gets a `/** */` summary, and so does any public member whose purpose or units aren't obvious from its name. Use `@param` only for unclear arguments, and leave types out of tags because TS already has them. Put member docs in `/** */`, not `//`, so they show on hover. Skip trivial members like `draw()`.
- **Speeds and timing:** speeds are px/s constants divided by `TICK_RATE` per tick. Never hardcode per-tick amounts or 24/60.
- **Cross-module effects:** emit an event on the `events` bus and handle it in its owner (usually `Game.bindEvents`), rather than mutating another module's state through `window.game`.
- **New keys:** add them to the `KEYS` table in `gamepad.ts` (and to `Action` if it's a new action).
- **New modules** in `commands/`, `elements/`, `models/` or `screens/` need an export in their folder's `index.ts`.
