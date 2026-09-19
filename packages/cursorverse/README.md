# @yashvanth/cursorverse

Twelve real cursor effects for the web — not one circle with a colour prop. Canvas
particle systems, a true metaball blob, tumbling confetti and a magnetic pointer that
moves your actual DOM elements.

Vanilla core, no dependencies. React bindings are optional and live behind a separate
entry point, so a plain JS site never pays for them.

```bash
npm i @yashvanth/cursorverse
```

## Quick start

```js
import { createCursor } from '@yashvanth/cursorverse'

// page-wide: hides the OS cursor and runs until you stop it
const cursor = createCursor('fire', { color: '#ff4500', size: 22 })
```

That's it. To let people turn it off — a settings toggle, a preference you persist:

```js
cursor.disable()                    // stops it, restores the native cursor
cursor.enable()                     // starts it again
cursor.update({ color: '#22d3ee' }) // retune live, without restarting
cursor.destroy()                    // remove it entirely
```

Confine it to one element instead of the whole page:

```js
createCursor('star', { target: document.querySelector('.hero') })
```

## React

```jsx
import { useRef } from 'react'
import { StarTrail } from '@yashvanth/cursorverse/react'

export default function Hero () {
  const stage = useRef(null)
  return (
    <section ref={stage} style={{ position: 'relative' }}>
      <StarTrail color="#ffd700" size={10} speed={0.16} containerRef={stage} />
    </section>
  )
}
```

`containerRef` is optional — leave it out and the effect covers the whole page. There is
also a generic `<CursorEffect effect="star" … />` and a `useCursorEffect(id, options, ref)`
hook. Components render nothing; they mount a canvas into the host element.

## The effects

| id | what it does | trigger |
| --- | --- | --- |
| `fire` | rising flame particles, white-hot core cooling into your colour | move |
| `glow` | neon ring that lags behind the pointer and stretches with velocity | move |
| `cat` | cat head with ears, tracking eyes, whiskers and a wagging tail | move |
| `rainbow` | smooth ribbon whose hue cycles as it is drawn | move |
| `star` | spinning five-point stars that scatter, twinkle and fall | move |
| `heart` | hearts that pop out, float up, sway and fade | move |
| `blob` | metaball chain merged from an implicit field — stretches and snaps back | move |
| `confetti` | tumbling paper with gravity, drag and shaded back faces | click |
| `ripple` | staggered water wavefronts, plus a light wake while moving | click |
| `magnetic` | pulls nearby elements in; the ring snaps onto what it is over | move |
| `snow` | six-armed crystals that drift, sway and reach terminal velocity | move |
| `spark` | electric streaks that decelerate, drop and crackle into embers | click |

`import { catalogue } from '@yashvanth/cursorverse'` gives you this list as data
(`id`, `title`, `emoji`, `category`, `trigger`, `defaults`) for building a picker.

## Options

| option | default | meaning |
| --- | --- | --- |
| `color` | per effect | base colour, any hex |
| `size` | per effect | scale in px |
| `speed` | per effect | follow/emission rate, `0.02`–`0.8` |
| `target` | `null` | element to confine the effect to; omit for page-wide |
| `zIndex` | `2147483000` | stacking of the page-wide overlay |
| `hideNativeCursor` | per effect | hide the OS cursor while running |
| `respectReducedMotion` | `true` | skip when the OS asks for reduced motion |
| `requireFinePointer` | `true` | skip on touch-only devices |
| `magnetSelector` | `.rv-magnet, .magnet, [data-cursor-magnet]` | `magnetic` only |

When an effect refuses to mount, `cursor.running` is `false` and `cursor.blocked` tells
you why (`'reduced-motion'`, `'coarse-pointer'`, `'no-dom'`). Nothing throws, so it is safe
to call during SSR — the effect simply mounts on the client.

## The magnetic effect

Mark the elements it should attract, then mount it:

```html
<button class="magnet">Subscribe</button>
```

```js
createCursor('magnetic', { magnetSelector: '.magnet' })
```

It sets `transform` on those elements (adding a transition if they don't have one) and
restores them on `destroy()`.

## Notes

- Canvas overlays are always `pointer-events: none`, so clicks pass straight through.
- Everything is DPR-aware and cleans up after itself: one `requestAnimationFrame` loop
  per effect, cancelled on `destroy()`.
- `type: module` with a CJS build alongside; TypeScript declarations included.

MIT
