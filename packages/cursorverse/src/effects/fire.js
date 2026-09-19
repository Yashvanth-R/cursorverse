import { rand, mix, rgba, TAU } from '../core/math'

/** Rising flame particles: hot white core, cooling into `color`, then smoke. */
export default {
  id: 'fire',
  name: 'FireCursor',
  title: 'Fire',
  emoji: '🔥',
  category: 'Cursors',
  trigger: 'move',
  hint: 'Move your pointer to set it alight',
  hideCursor: true,
  defaults: { color: '#ff4500', size: 22, speed: 0.18 },

  create (ctx, state, opts) {
    const parts = []

    function emit(x, y, n, drift) {
      for (let i = 0; i < n; i++) {
        parts.push({
          x: x + rand(-3, 3),
          y: y + rand(-3, 3),
          vx: rand(-0.5, 0.5) + drift.x * 0.12,
          vy: rand(-1.4, -0.5) + drift.y * 0.08,
          life: 1,
          decay: rand(0.012, 0.026) * (0.6 + opts.current.speed * 2),
          r: opts.current.size * rand(0.3, 0.75),
          wob: rand(0, TAU)
        })
      }
    }

    return {
      frame(dt, s) {
        const { color, size } = opts.current
        const p = s.pointer
        if (p.inside && p.seen) emit(p.x, p.y, p.speed > 1.5 ? 4 : 2, { x: p.vx, y: p.vy })

        ctx.globalCompositeOperation = 'lighter'
        for (let i = parts.length - 1; i >= 0; i--) {
          const f = parts[i]
          f.life -= f.decay * dt
          if (f.life <= 0) { parts.splice(i, 1); continue }
          f.wob += 0.12 * dt
          f.x += (f.vx + Math.sin(f.wob) * 0.35) * dt
          f.y += f.vy * dt
          f.vy -= 0.035 * dt        // flames accelerate upward
          f.vx *= 0.98

          const heat = f.life                       // 1 = just born, 0 = burnt out
          const r = f.r * (0.35 + (1 - heat) * 0.9)
          const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r)
          g.addColorStop(0, mix(color, '#fffbe6', heat * 0.85, heat * 0.9))
          g.addColorStop(0.4, rgba(color, heat * 0.55))
          g.addColorStop(1, rgba(color, 0))
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(f.x, f.y, r, 0, TAU)
          ctx.fill()
        }

        // white-hot core at the pointer itself
        if (p.inside && p.seen) {
          const core = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 0.5)
          core.addColorStop(0, 'rgba(255,255,245,0.95)')
          core.addColorStop(0.5, mix(color, '#ffe9a8', 0.6, 0.7))
          core.addColorStop(1, rgba(color, 0))
          ctx.fillStyle = core
          ctx.beginPath()
          ctx.arc(p.x, p.y, size * 0.5, 0, TAU)
          ctx.fill()
        }
        ctx.globalCompositeOperation = 'source-over'
      }
    }
  }
}
