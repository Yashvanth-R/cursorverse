import { lerp, clamp, rgba } from '../core/math'
import { HIDE_CLASS, ensureHideStyle } from '../core/engine'

const DEFAULT_SELECTOR = '.rv-magnet, .magnet, [data-cursor-magnet]'

/**
 * A magnetic pointer: elements matching `magnetSelector` are pulled toward the
 * cursor with a distance falloff, and the ring snaps onto (and morphs into)
 * whatever it is hovering. DOM-based rather than canvas-based, because it has to
 * move real elements around.
 */
export default {
  id: 'magnetic',
  name: 'MagneticEffect',
  title: 'Magnetic',
  emoji: '🧲',
  category: 'Magnetic',
  trigger: 'move',
  hint: 'Approach the buttons — they lean in',
  hideCursor: true,
  defaults: { color: '#9be15d', size: 16, speed: 0.2 },

  mount (host, opts, config = {}) {
    const doc = host.ownerDocument
    const win = doc.defaultView || window
    const eventTarget = config.eventTarget || host
    const hideOn = config.hideNativeCursor ? (config.hideTarget || host) : null
    if (hideOn) { ensureHideStyle(doc); hideOn.classList.add(HIDE_CLASS) }

    const ring = doc.createElement('div')
    Object.assign(ring.style, {
      position: 'absolute', top: '0', left: '0', border: '2px solid',
      borderRadius: '999px', pointerEvents: 'none', opacity: '0',
      willChange: 'transform,width,height', boxSizing: 'border-box'
    })
    const dot = doc.createElement('div')
    Object.assign(dot.style, {
      position: 'absolute', top: '0', left: '0', width: '6px', height: '6px',
      borderRadius: '50%', pointerEvents: 'none', opacity: '0'
    })
    host.appendChild(ring)
    host.appendChild(dot)

    const pointer = { x: -9999, y: -9999, inside: false, seen: false }
    const size0 = (opts.current && opts.current.size) || 16
    const cur = { x: -9999, y: -9999, w: size0 * 2, h: size0 * 2, r: size0, alpha: 0 }
    const touched = new Set()

    function onMove(e) {
      const rect = host.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.inside = true
      if (!pointer.seen) { pointer.seen = true; cur.x = pointer.x; cur.y = pointer.y }
    }
    function onLeave() { pointer.inside = false }

    eventTarget.addEventListener('pointermove', onMove)
    eventTarget.addEventListener('pointerleave', onLeave)

    let raf = 0
    let last = win.performance.now()

    function frame(now) {
      const dt = clamp((now - last) / 16.6667, 0, 3)
      last = now
      const { color, size, speed, magnetSelector } = opts.current
      const rect = host.getBoundingClientRect()
      const targets = host.querySelectorAll(magnetSelector || DEFAULT_SELECTOR)
      const pull = Math.max(90, size * 9)

      let hoverBox = null

      targets.forEach(el => {
        if (!touched.has(el)) {
          touched.add(el)
          if (!el.style.transition) el.style.transition = 'transform 220ms cubic-bezier(.16,.8,.25,1)'
        }
        const r = el.getBoundingClientRect()
        const cx = r.left - rect.left + r.width / 2
        const cy = r.top - rect.top + r.height / 2
        const dx = pointer.x - cx
        const dy = pointer.y - cy
        const dist = Math.hypot(dx, dy)

        if (pointer.inside && dist < pull) {
          const force = Math.pow(1 - dist / pull, 1.6)
          const grab = size * 1.4 * force
          el.style.transform =
            `translate(${(dx / (dist || 1)) * grab}px, ${(dy / (dist || 1)) * grab}px) scale(${1 + force * 0.12})`
          el.style.boxShadow = `0 0 22px ${rgba(color, force * 0.55)}`
          const over = Math.abs(dx) < r.width / 2 && Math.abs(dy) < r.height / 2
          if (over && !hoverBox) {
            hoverBox = {
              x: cx + (dx / (dist || 1)) * grab,
              y: cy + (dy / (dist || 1)) * grab,
              w: r.width + 14,
              h: r.height + 14
            }
          }
        } else {
          el.style.transform = ''
          el.style.boxShadow = ''
        }
      })

      const k = clamp(speed * 1.6 * dt, 0, 1)
      const morph = clamp(0.22 * dt, 0, 1)
      cur.x = lerp(cur.x, hoverBox ? hoverBox.x : pointer.x, k)
      cur.y = lerp(cur.y, hoverBox ? hoverBox.y : pointer.y, k)
      cur.w = lerp(cur.w, hoverBox ? hoverBox.w : size * 2, morph)
      cur.h = lerp(cur.h, hoverBox ? hoverBox.h : size * 2, morph)
      cur.r = lerp(cur.r, hoverBox ? 10 : size, morph)
      cur.alpha = lerp(cur.alpha, pointer.inside && pointer.seen ? 1 : 0, clamp(0.12 * dt, 0, 1))

      ring.style.transform = `translate(${cur.x - cur.w / 2}px, ${cur.y - cur.h / 2}px)`
      ring.style.width = cur.w + 'px'
      ring.style.height = cur.h + 'px'
      ring.style.borderRadius = cur.r + 'px'
      ring.style.borderColor = color
      ring.style.opacity = String(cur.alpha)
      ring.style.background = hoverBox ? rgba(color, 0.12) : 'transparent'
      ring.style.boxShadow = `0 0 ${size}px ${rgba(color, 0.45 * cur.alpha)}`

      dot.style.transform = `translate(${pointer.x - 3}px, ${pointer.y - 3}px)`
      dot.style.background = color
      dot.style.opacity = String(cur.alpha * (hoverBox ? 0.35 : 1))

      raf = win.requestAnimationFrame(frame)
    }
    raf = win.requestAnimationFrame(frame)

    return {
      destroy() {
        win.cancelAnimationFrame(raf)
        eventTarget.removeEventListener('pointermove', onMove)
        eventTarget.removeEventListener('pointerleave', onLeave)
        touched.forEach(el => { el.style.transform = ''; el.style.boxShadow = '' })
        touched.clear()
        ring.remove()
        dot.remove()
        if (hideOn) hideOn.classList.remove(HIDE_CLASS)
      }
    }
  }
}
