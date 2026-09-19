import { lerp, rgba, clamp, TAU } from '../core/math'

/** Neon ring + halo that lags behind the pointer and stretches with velocity. */
export default {
  id: 'glow',
  name: 'GlowCursor',
  title: 'Glow',
  emoji: '✨',
  category: 'Cursors',
  trigger: 'move',
  hint: 'Move around — the ring lags and stretches',
  hideCursor: true,
  defaults: { color: '#7c5cff', size: 18, speed: 0.22 },

  create (ctx, state, opts) {
    const ring = { x: -9999, y: -9999, a: 0, stretch: 1 }
    const smear = []

    return {
      frame(dt, s) {
        const { color, size, speed } = opts.current
        const p = s.pointer
        if (!p.seen) return
        if (ring.x < -9000) { ring.x = p.x; ring.y = p.y }

        const k = clamp(speed * dt, 0, 1)
        ring.x = lerp(ring.x, p.x, k)
        ring.y = lerp(ring.y, p.y, k)
        ring.a = lerp(ring.a, p.inside ? 1 : 0, 0.08 * dt)

        const vel = Math.hypot(p.x - ring.x, p.y - ring.y)
        ring.stretch = lerp(ring.stretch, 1 + clamp(vel / 40, 0, 0.9), 0.2 * dt)
        const angle = Math.atan2(p.y - ring.y, p.x - ring.x)

        smear.push({ x: ring.x, y: ring.y, life: 1 })
        if (smear.length > 18) smear.shift()

        ctx.globalCompositeOperation = 'lighter'

        // soft halo trail
        for (let i = 0; i < smear.length; i++) {
          const t = i / smear.length
          const sm = smear[i]
          const r = size * (0.6 + t * 1.4)
          const g = ctx.createRadialGradient(sm.x, sm.y, 0, sm.x, sm.y, r)
          g.addColorStop(0, rgba(color, 0.12 * t * ring.a))
          g.addColorStop(1, rgba(color, 0))
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(sm.x, sm.y, r, 0, TAU)
          ctx.fill()
        }

        // wide halo
        const halo = ctx.createRadialGradient(ring.x, ring.y, 0, ring.x, ring.y, size * 3)
        halo.addColorStop(0, rgba(color, 0.35 * ring.a))
        halo.addColorStop(0.5, rgba(color, 0.1 * ring.a))
        halo.addColorStop(1, rgba(color, 0))
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(ring.x, ring.y, size * 3, 0, TAU)
        ctx.fill()

        // the ring, stretched along the direction of travel
        ctx.save()
        ctx.translate(ring.x, ring.y)
        ctx.rotate(angle)
        ctx.scale(ring.stretch, 1 / ring.stretch)
        ctx.lineWidth = Math.max(1.5, size * 0.14)
        ctx.strokeStyle = rgba(color, 0.9 * ring.a)
        ctx.shadowBlur = size
        ctx.shadowColor = rgba(color, 0.9)
        ctx.beginPath()
        ctx.arc(0, 0, size, 0, TAU)
        ctx.stroke()
        ctx.restore()

        // crisp dot pinned to the real pointer position
        ctx.shadowBlur = size * 0.8
        ctx.shadowColor = rgba(color, 1)
        ctx.fillStyle = `rgba(255,255,255,${0.95 * ring.a})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(1.5, size * 0.18), 0, TAU)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalCompositeOperation = 'source-over'
      }
    }
  }
}
