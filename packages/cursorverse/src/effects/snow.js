import { snowflakePath, rand, rgba, TAU } from '../core/math'

/** Crystalline flakes shed by the pointer, drifting down and swaying as they fall. */
export default {
  id: 'snow',
  name: 'SnowTrail',
  title: 'Snow Trail',
  emoji: '❄️',
  category: 'Trails',
  trigger: 'move',
  hint: 'Move to shed snowflakes',
  hideCursor: true,
  defaults: { color: '#e6f0ff', size: 12, speed: 0.08 },

  create (ctx, state, opts) {
    const flakes = []
    let acc = 0

    return {
      frame(dt, s) {
        const { color, size, speed } = opts.current
        const p = s.pointer

        if (p.inside && p.seen) {
          acc += p.speed * dt + 0.7 * dt
          while (acc > 7) {
            acc -= 7
            flakes.push({
              x: p.x + rand(-6, 6),
              y: p.y + rand(-6, 6),
              vx: rand(-0.25, 0.25) + p.vx * 0.04,
              vy: rand(0.25, 0.8) + speed * 4,
              r: size * rand(0.3, 0.75),
              rot: rand(0, TAU),
              spin: rand(-0.035, 0.035),
              sway: rand(0, TAU),
              swayAmp: rand(0.2, 0.8),
              life: 1,
              decay: rand(0.004, 0.009)
            })
          }
        }

        for (let i = flakes.length - 1; i >= 0; i--) {
          const f = flakes[i]
          f.life -= f.decay * dt
          if (f.life <= 0 || f.y > s.h + 20) { flakes.splice(i, 1); continue }
          f.sway += 0.045 * dt
          f.x += (f.vx + Math.sin(f.sway) * f.swayAmp) * dt
          f.y += f.vy * dt
          f.vy = Math.min(f.vy + 0.004 * dt, 1.6)     // terminal velocity
          f.rot += f.spin * dt

          const alpha = Math.min(1, f.life * 1.8)
          ctx.save()
          ctx.translate(f.x, f.y)
          ctx.rotate(f.rot)
          ctx.strokeStyle = rgba(color, alpha)
          ctx.lineWidth = Math.max(0.5, f.r * 0.12)
          ctx.lineCap = 'round'
          ctx.shadowBlur = f.r
          ctx.shadowColor = rgba(color, alpha * 0.8)
          snowflakePath(ctx, f.r)
          ctx.stroke()
          ctx.fillStyle = rgba('#ffffff', alpha * 0.85)
          ctx.beginPath()
          ctx.arc(0, 0, f.r * 0.13, 0, TAU)
          ctx.fill()
          ctx.restore()
        }
        ctx.shadowBlur = 0
      }
    }
  }
}
