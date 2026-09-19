import { clamp } from './math'

/* The runtime every canvas effect shares: a DPR-aware canvas sized to its host,
   pointer state in host-local coordinates, and a frame loop. Plain DOM — the React
   bindings in ../react.jsx are a thin wrapper over this. */

const HIDE_CLASS = 'cursorverse-hide-native'

/** Injects (once) the rule that hides the OS cursor inside a hidden-cursor host. */
function ensureHideStyle(doc) {
  if (doc.getElementById('cursorverse-style')) return
  const style = doc.createElement('style')
  style.id = 'cursorverse-style'
  style.textContent =
    '.' + HIDE_CLASS + ',.' + HIDE_CLASS + ' *{cursor:none!important}'
  doc.head.appendChild(style)
}

/**
 * Mounts a canvas effect.
 *
 * @param {object} def      effect definition with create(ctx, state, opts)
 * @param {Element} host    element the canvas covers; must be positioned
 * @param {{current: object}} opts  live options — mutate opts.current to retune
 * @param {object} [config]
 * @param {EventTarget} [config.eventTarget]  where pointer events are listened for
 *                                            (defaults to the host)
 * @param {boolean} [config.hideNativeCursor]
 * @returns {{ destroy(): void, canvas: HTMLCanvasElement }}
 */
export function mountCanvasEffect(def, host, opts, config = {}) {
  const doc = host.ownerDocument
  const win = doc.defaultView || window
  const eventTarget = config.eventTarget || host
  const hideOn = config.hideNativeCursor ? (config.hideTarget || host) : null

  const canvas = doc.createElement('canvas')
  canvas.setAttribute('data-cursorverse', def.id)
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  })
  host.appendChild(canvas)
  const ctx = canvas.getContext('2d')

  if (hideOn) {
    ensureHideStyle(doc)
    hideOn.classList.add(HIDE_CLASS)
  }

  const state = {
    w: 0,
    h: 0,
    time: 0,
    pointer: {
      x: -9999, y: -9999, px: -9999, py: -9999,
      vx: 0, vy: 0, speed: 0,
      inside: false, down: false, seen: false
    }
  }

  const dpr = Math.min(win.devicePixelRatio || 1, 2)
  function resize() {
    const r = host.getBoundingClientRect()
    state.w = r.width
    state.h = r.height
    canvas.width = Math.max(1, Math.round(r.width * dpr))
    canvas.height = Math.max(1, Math.round(r.height * dpr))
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()

  let ro = null
  if (typeof win.ResizeObserver !== 'undefined') {
    ro = new win.ResizeObserver(resize)
    ro.observe(host)
  } else {
    win.addEventListener('resize', resize)
  }

  const api = def.create(ctx, state, opts) || {}

  const local = e => {
    const r = host.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function onMove(e) {
    const { x, y } = local(e)
    const p = state.pointer
    if (!p.seen) { p.x = p.px = x; p.y = p.py = y; p.seen = true }
    p.x = x; p.y = y; p.inside = true
    if (api.move) api.move(x, y, state)
  }
  function onDown(e) {
    const { x, y } = local(e)
    const p = state.pointer
    if (!p.seen) { p.x = p.px = x; p.y = p.py = y; p.seen = true }
    p.x = x; p.y = y; p.down = true; p.inside = true
    if (api.down) api.down(x, y, state)
  }
  function onUp() {
    state.pointer.down = false
    if (api.up) api.up(state)
  }
  function onEnter() { state.pointer.inside = true }
  function onLeave() {
    state.pointer.inside = false
    state.pointer.down = false
    if (api.leave) api.leave(state)
  }

  eventTarget.addEventListener('pointermove', onMove)
  eventTarget.addEventListener('pointerdown', onDown)
  eventTarget.addEventListener('pointerenter', onEnter)
  eventTarget.addEventListener('pointerleave', onLeave)
  win.addEventListener('pointerup', onUp)

  let raf = 0
  let last = win.performance.now()
  function loop(now) {
    // dt is measured in 60fps frames, clamped so a backgrounded tab can't jump
    const dt = clamp((now - last) / 16.6667, 0, 3)
    last = now
    state.time = now
    const p = state.pointer
    p.vx = p.x - p.px
    p.vy = p.y - p.py
    p.speed = Math.hypot(p.vx, p.vy)
    p.px = p.x
    p.py = p.y
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, state.w, state.h)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    if (api.frame) api.frame(dt, state)
    raf = win.requestAnimationFrame(loop)
  }
  raf = win.requestAnimationFrame(loop)

  return {
    canvas,
    destroy() {
      win.cancelAnimationFrame(raf)
      if (ro) ro.disconnect(); else win.removeEventListener('resize', resize)
      eventTarget.removeEventListener('pointermove', onMove)
      eventTarget.removeEventListener('pointerdown', onDown)
      eventTarget.removeEventListener('pointerenter', onEnter)
      eventTarget.removeEventListener('pointerleave', onLeave)
      win.removeEventListener('pointerup', onUp)
      if (api.destroy) api.destroy()
      if (hideOn) hideOn.classList.remove(HIDE_CLASS)
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
    }
  }
}

/** Mounts any effect definition — canvas-based or DOM-based (see effects/magnetic). */
export function mountEffect(def, host, opts, config = {}) {
  return def.mount
    ? def.mount(host, opts, config)
    : mountCanvasEffect(def, host, opts, config)
}

export { HIDE_CLASS, ensureHideStyle }
