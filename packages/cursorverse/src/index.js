import { mountEffect } from './core/engine'
import { effects, effectMap, effectIds, getEffect } from './effects'

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

const media = q => {
  try { return isBrowser && window.matchMedia(q).matches } catch { return false }
}

/**
 * Mount a cursor effect.
 *
 * @param {string|object} effect   effect id ('fire', 'star', …) or a definition
 * @param {object} [options]
 * @param {Element|null} [options.target]   element to confine the effect to.
 *                                          Omit for a page-wide overlay.
 * @param {string} [options.color]
 * @param {number} [options.size]
 * @param {number} [options.speed]
 * @param {number} [options.zIndex=2147483000]      page-wide overlay stacking
 * @param {boolean} [options.hideNativeCursor]      defaults to the effect's own preference
 * @param {boolean} [options.respectReducedMotion=true]  skip when the OS asks for less motion
 * @param {boolean} [options.requireFinePointer=true]    skip on touch-only devices
 * @param {string} [options.magnetSelector]         'magnetic' only
 * @returns {{
 *   id: string, running: boolean, element: Element|null, options: object,
 *   update(patch: object): void, enable(): void, disable(): void, destroy(): void
 * }}
 */
export function createCursor(effect = 'fire', options = {}) {
  const def = getEffect(effect)

  const settings = {
    ...def.defaults,
    hideNativeCursor: def.hideCursor,
    zIndex: 2147483000,
    respectReducedMotion: true,
    requireFinePointer: true,
    target: null,
    ...options
  }

  // opts.current is read by effects every frame, so update() retunes a running
  // effect instead of tearing it down
  const opts = { current: settings }

  let instance = null
  let overlay = null
  let hostPositioned = null
  let previousPosition = ''

  function blockedReason() {
    if (!isBrowser) return 'no-dom'
    if (settings.respectReducedMotion && media('(prefers-reduced-motion: reduce)')) return 'reduced-motion'
    if (settings.requireFinePointer && media('(pointer: coarse)')) return 'coarse-pointer'
    return null
  }

  function mount() {
    if (instance || blockedReason()) return
    const target = settings.target

    let host, config
    if (target) {
      host = target
      const pos = window.getComputedStyle(host).position
      if (pos === 'static') {
        hostPositioned = host
        previousPosition = host.style.position
        host.style.position = 'relative'
      }
      config = {
        eventTarget: host,
        hideNativeCursor: !!settings.hideNativeCursor,
        hideTarget: host
      }
    } else {
      overlay = document.createElement('div')
      overlay.setAttribute('data-cursorverse-overlay', def.id)
      Object.assign(overlay.style, {
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        pointerEvents: 'none',
        zIndex: String(settings.zIndex)
      })
      document.body.appendChild(overlay)
      host = overlay
      config = {
        // the overlay can't receive pointer events, so listen on the document
        eventTarget: document,
        hideNativeCursor: !!settings.hideNativeCursor,
        hideTarget: document.documentElement
      }
    }
    instance = mountEffect(def, host, opts, config)
  }

  function unmount() {
    if (instance) { instance.destroy(); instance = null }
    if (overlay) { overlay.remove(); overlay = null }
    if (hostPositioned) {
      hostPositioned.style.position = previousPosition
      hostPositioned = null
    }
  }

  mount()

  return {
    id: def.id,
    get running() { return !!instance },
    get blocked() { return blockedReason() },
    get element() { return overlay || settings.target || null },
    get options() { return { ...opts.current } },

    /** Retune a live effect: update({ color: '#0ff', size: 30 }) */
    update(patch = {}) {
      opts.current = { ...opts.current, ...patch }
      Object.assign(settings, patch)
      // these three change how the effect is mounted, not just how it draws
      if ('target' in patch || 'zIndex' in patch || 'hideNativeCursor' in patch) {
        if (instance) { unmount(); mount() }
      }
    },

    /** Turn the effect on (no-op if already running or blocked). */
    enable() { mount() },
    /** Turn it off but keep the handle reusable. */
    disable() { unmount() },
    /** Remove everything and restore the native cursor. */
    destroy() { unmount() }
  }
}

/** Metadata for building pickers/galleries: id, title, emoji, category, trigger, defaults. */
export const catalogue = effects.map(({ id, name, title, emoji, category, trigger, hint, hideCursor, defaults }) =>
  ({ id, name, title, emoji, category, trigger, hint, hideCursor, defaults: { ...defaults } }))

export { effects, effectMap, effectIds, getEffect }
// colour helpers, exposed because pickers and docs sites keep needing them
export { hexToRgb, rgba, mix, hueOf } from './core/math'
export default createCursor
