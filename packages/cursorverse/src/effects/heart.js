import { heartPath, rand, rgba, mix, TAU } from '../core/math'

/** Hearts that pop out of the pointer, float up, sway and fade. */
export default {
  id: 'heart',
  name: 'HeartTrail',
  title: 'Heart Trail',
  emoji: '❤️',
  category: 'Trails',
  trigger: 'move',
  hint: 'Move to leave floating hearts',
  hideCursor: true,
  defaults: { color: '#ff6b81', size: 14, speed: 0.15 },

  create (ctx, state, opts) {
    const hearts = []
    let acc = 0

    return {
      frame(dt, s) {
        const { color, size, speed } = opts.current
        const p = s.pointer

        if (p.inside && p.seen) {
          acc += p.speed * dt + 0.5 * dt
          while (acc > 9) {
            acc -= 9
            hearts.push({
              x: p.x + rand(-5, 5),
              y: p.y + rand(-5, 5),
              vx: rand(-0.35, 0.35) + p.vx * 0.05,
              vy: rand(-1.5, -0.7),
              s: size * rand(0.6, 1.35),
              rot: rand(-0.35, 0.35),
              spin: rand(-0.02, 0.02),
              sway: rand(0, TAU),
              life: 1,
              decay: rand(0.008, 0.016) * (0.5 + speed * 3),
              pop: 0
            })
          }
        }

        for (let i = hearts.length - 1; i >= 0; i--) {
          const h = hearts[i]
          h.life -= h.decay * dt
          if (h.life <= 0) { hearts.splice(i, 1); continue }
          h.sway += 0.07 * dt
          h.x += (h.vx + Math.sin(h.sway) * 0.5) * dt
          h.y += h.vy * dt
          h.vy *= 0.985
          h.rot += h.spin * dt
          h.pop = Math.min(1, h.pop + 0.14 * dt)

          // slight heartbeat + a pop-in scale
          const beat = 1 + Math.sin(h.sway * 2.6) * 0.09
          const scale = h.pop * beat * (0.45 + h.life * 0.55)
          const alpha = Math.min(1, h.life * 1.5)

          ctx.save()
          ctx.translate(h.x, h.y)
          ctx.rotate(h.rot)
          ctx.scale(scale, scale)
          ctx.shadowBlur = h.s * 0.9
          ctx.shadowColor = rgba(color, alpha * 0.8)
          ctx.fillStyle = mix(color, '#ffffff', 0.12 * h.life, alpha)
          heartPath(ctx, h.s)
          ctx.fill()
          // highlight
          ctx.shadowBlur = 0
          ctx.fillStyle = rgba('#ffffff', alpha * 0.45)
          ctx.beginPath()
          ctx.ellipse(-h.s * 0.16, -h.s * 0.24, h.s * 0.09, h.s * 0.06, -0.5, 0, TAU)
          ctx.fill()
          ctx.restore()
        }
        ctx.shadowBlur = 0
      }
    }
  }
}
