# CursorVerse

Twelve real cursor effects, shipped two ways:

- **`packages/cursorverse/`** — the publishable npm package (`@yashvanth/cursorverse`).
  Vanilla JS core, optional React bindings, TypeScript declarations.
- **the repo root** — the demo site and playground, which consumes the package exactly
  the way an installed consumer does.

```bash
npm install
npm run dev          # demo site at localhost:5173
npm run build:lib    # build the publishable package
```

The demo resolves `@yashvanth/cursorverse` to `packages/cursorverse/src` through a Vite
alias (see [vite.config.js](vite.config.js)), so library edits hot-reload in the playground.

## Package layout

```
packages/cursorverse/
  src/core/math.js      colour + shape helpers, no DOM
  src/core/engine.js    DPR canvas, pointer state, frame loop, cursor hiding
  src/effects/*.js      one definition per effect (id, meta, defaults, create/mount)
  src/index.js          createCursor() — the vanilla API
  src/react.jsx         <CursorEffect>, named components, useCursorEffect()
  types/*.d.ts          hand-written declarations
```

An effect is just an object: metadata, `defaults`, and a `create(ctx, state, opts)` that
returns `{ frame, down, up, move, leave }`. `magnetic` instead provides `mount(host, opts)`
because it moves real DOM elements rather than drawing. Adding a thirteenth effect means
adding one file and one line in `src/effects/index.js` — the demo picks it up from
`catalogue` automatically.

## The effects

| id | what it does | trigger |
| --- | --- | --- |
| `fire` | rising flame particles, white-hot core cooling into the chosen colour | move |
| `glow` | neon ring that lags behind the pointer and stretches with velocity | move |
| `cat` | cat head with ears, tracking eyes, whiskers and a wagging tail | move |
| `rainbow` | smooth ribbon whose hue cycles as it is drawn | move |
| `star` | spinning five-point stars that scatter, twinkle and fall | move |
| `heart` | hearts that pop out, float up, sway and fade | move |
| `blob` | metaball chain merged from an implicit field — stretches and snaps back | move |
| `confetti` | tumbling paper confetti with gravity, drag and shaded back faces | click |
| `ripple` | staggered water wavefronts plus a light wake while moving | click |
| `magnetic` | nearby magnet elements lean in; the ring snaps onto what it is over | move |
| `snow` | six-armed crystals that drift down, sway and reach terminal velocity | move |
| `spark` | electric streaks that decelerate, drop and crackle into embers | click |

## Publishing the package

```bash
npm run build:lib                              # 1. build dist/
npm run pack:lib                               # 2. inspect the tarball contents
npm i ./packages/cursorverse/*.tgz             #    (optional) try it in a scratch app
npm login                                      # 3. once per machine
npm run publish:lib                            # 4. publishes with --access public
```

**The scope must equal your npm username** (or an org you own), not your display name.
The package is currently `@yashvanth/cursorverse`; if your npm handle is different, run:

```bash
grep -rl '@yashvanth/cursorverse' --exclude-dir=node_modules --exclude-dir=dist . \
  | xargs sed -i 's|@yashvanth/cursorverse|@<your-npm-username>/cursorverse|g'
```

Check your handle with `npm whoami` after `npm login`. A scoped package needs
`--access public` (already in the script); an unscoped name like `cursorverse` must be
free — check with `npm view cursorverse`. Also set `repository` and `homepage` in
[packages/cursorverse/package.json](packages/cursorverse/package.json) before publishing.

Version bumps: `npm --prefix packages/cursorverse version patch|minor|major`, which also
tags the commit. `prepublishOnly` rebuilds `dist/` so a stale build can't be published.

See the [package README](packages/cursorverse/README.md) for the consumer-facing API.
