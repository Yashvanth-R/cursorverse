import { useEffect, useRef } from 'react'
import { mountEffect } from './core/engine'
import { getEffect, effects } from './effects'

/**
 * Runs an effect inside `ref`'s element, or page-wide when `ref` is omitted.
 * Options are read live, so changing color/size/speed retunes the running effect
 * instead of restarting it.
 */
export function useCursorEffect(effect, options = {}, ref = null) {
  const def = getEffect(effect)
  const optsRef = useRef(null)
  optsRef.current = { ...def.defaults, ...options }

  const hideNativeCursor =
    options.hideNativeCursor === undefined ? def.hideCursor : options.hideNativeCursor
  const zIndex = options.zIndex || 2147483000

  useEffect(() => {
    if (typeof document === 'undefined') return
    // refs are attached before effects run, so this is the real element
    const host = ref && ref.current
    const page = !host

    let overlay = null
    let restore = null

    if (page) {
      overlay = document.createElement('div')
      Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        pointerEvents: 'none', zIndex: String(zIndex)
      })
      document.body.appendChild(overlay)
    } else if (window.getComputedStyle(host).position === 'static') {
      const prev = host.style.position
      host.style.position = 'relative'
      restore = () => { host.style.position = prev }
    }

    const instance = mountEffect(def, overlay || host, optsRef, {
      eventTarget: page ? document : host,
      hideNativeCursor: !!hideNativeCursor,
      hideTarget: page ? document.documentElement : host
    })

    return () => {
      instance.destroy()
      if (overlay) overlay.remove()
      if (restore) restore()
    }
    // remounting on every option change would throw away live particles
  }, [def.id, hideNativeCursor, zIndex])
}

/**
 * <CursorEffect effect="star" color="#ffd700" size={10} containerRef={ref} />
 *
 * Renders nothing itself: the effect is appended to `containerRef`'s element, or
 * to a full-page overlay when no ref is given.
 */
export function CursorEffect({ effect = 'fire', containerRef = null, ...options }) {
  useCursorEffect(effect, options, containerRef)
  return null
}

/** Named components, one per effect: <FireCursor />, <StarTrail />, … */
const components = {}
for (const def of effects) {
  const Component = props => <CursorEffect {...props} effect={def.id} />
  Component.displayName = def.name
  components[def.name] = Component
}

export const {
  FireCursor, GlowCursor, CatCursor, RainbowTrail, StarTrail, HeartTrail,
  BlobCursor, ConfettiClick, RippleEffect, MagneticEffect, SnowTrail, SparkClick
} = components

export { effects, getEffect }
export default CursorEffect
