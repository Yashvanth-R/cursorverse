import { rgba, rand, clamp, TAU } from '../core/math'

/** Water rings: a staggered set of expanding wavefronts per click, plus a gentle wake on move. */
export default {
  id: 'ripple',
  name: 'RippleEffect',
  title: 'Water Ripple',
  emoji: '💧',
  category: 'Click Effects',
  trigger: 'click',
  hint: 'Click to drop into the water',
  hideCursor: false,
  defaults: { color: '#6ee7ff', size: 60, speed: 0.26 },

  create (ctx, state, opts) {
    const rings = []
    let moveAcc = 0

    function drop(x, y, strength) {
      const { size, speed } = opts.current
      const count = strength > 0.5 ? 3 : 1
      for (let i = 0; i < count; i++) {
        rings.push({
          x, y,
          r: size * 0.12,
          max: size * (1.6 + i * 0.55) * strength,
          grow: (1.6 + speed * 6) * (1 - i * 0.12),
          life: 1,
          decay: (0.011 + speed * 0.012) / (1 + i * 0.25),
          width: (2.6 - i * 0.6) * strength,
          wobble: rand(0, TAU)
        })
      }
    }

    return {
      down(x, y) { drop(x, y, 1) },
      frame(dt, s) {
        const { color, size } = opts.current
        const p = s.pointer

        // a light wake so the surface feels alive while you move
        if (p.inside && p.seen && p.speed > 1) {
          moveAcc += p.speed * dt
          if (moveAcc > 60) { moveAcc = 0; drop(p.x, p.y, 0.35) }
        }

        for (let i = rings.length - 1; i >= 0; i--) {
          const r = rings[i]
          r.life -= r.decay * dt
          if (r.life <= 0) { rings.splice(i, 1); continue }
          r.r += r.grow * dt * (0.4 + r.life)      // fast at first, then settles
          r.wobble += 0.05 * dt

          const alpha = clamp(r.life * r.life * 1.2, 0, 1)

          // refraction sheen inside the ring
          const g = ctx.createRadialGradient(r.x, r.y, r.r * 0.72, r.x, r.y, r.r)
          g.addColorStop(0, rgba(color, 0))
          g.addColorStop(0.75, rgba(color, alpha * 0.1))
          g.addColorStop(1, rgba(color, 0))
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.r, 0, TAU)
          ctx.fill()

          // the wavefront itself, slightly elliptical so it looks like a surface
          ctx.save()
          ctx.translate(r.x, r.y)
          ctx.strokeStyle = rgba(color, alpha)
          ctx.lineWidth = Math.max(0.4, r.width * r.life)
          ctx.beginPath()
          ctx.ellipse(0, 0, r.r, r.r * (0.94 + Math.sin(r.wobble) * 0.03), 0, 0, TAU)
          ctx.stroke()
          // trailing crest
          ctx.strokeStyle = rgba('#ffffff', alpha * 0.28)
          ctx.lineWidth = Math.max(0.3, r.width * r.life * 0.5)
          ctx.beginPath()
          ctx.ellipse(0, 0, r.r * 0.86, r.r * 0.82, 0, 0, TAU)
          ctx.stroke()
          ctx.restore()
        }

        // pointer marker so you know where the next drop lands
        if (p.inside && p.seen) {
          ctx.strokeStyle = rgba(color, 0.35)
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(p.x, p.y, size * 0.1, 0, TAU)
          ctx.stroke()
        }
      }
    }
  }
}
