import { rand, rgba, hueOf, clamp, TAU } from '../core/math'

/** Click bursts of tumbling paper confetti with gravity, drag and streamers. */
export default {
  id: 'confetti',
  name: 'ConfettiClick',
  title: 'Confetti Click',
  emoji: '🎉',
  category: 'Click Effects',
  trigger: 'click',
  hint: 'Click anywhere to pop confetti',
  hideCursor: false,
  defaults: { color: '#ff7a18', size: 14, speed: 0.2 },

  create (ctx, state, opts) {
    const bits = []
    const flashes = []

    function burst(x, y) {
      const { size, speed } = opts.current
      const hue = hueOf(opts.current.color)
      const n = 46
      for (let i = 0; i < n; i++) {
        const a = rand(0, TAU)
        const power = rand(2, 9) * (0.5 + speed * 2.5)
        bits.push({
          x, y,
          vx: Math.cos(a) * power,
          vy: Math.sin(a) * power - rand(1, 4),
          w: size * rand(0.35, 0.7),
          h: size * rand(0.2, 0.4),
          rot: rand(0, TAU),
          spin: rand(-0.3, 0.3),
          flip: rand(0, TAU),
          flipSpeed: rand(0.12, 0.3),
          hue: (hue + rand(-60, 60) + 360) % 360,
          life: 1,
          decay: rand(0.005, 0.011),
          ribbon: Math.random() < 0.25
        })
      }
      flashes.push({ x, y, r: size * 0.6, life: 1 })
    }

    return {
      down(x, y) { burst(x, y) },
      frame(dt, s) {
        const { size } = opts.current

        for (let i = flashes.length - 1; i >= 0; i--) {
          const f = flashes[i]
          f.life -= 0.06 * dt
          if (f.life <= 0) { flashes.splice(i, 1); continue }
          ctx.globalCompositeOperation = 'lighter'
          ctx.strokeStyle = rgba('#ffffff', f.life * 0.5)
          ctx.lineWidth = 2 * f.life
          ctx.beginPath()
          ctx.arc(f.x, f.y, f.r + (1 - f.life) * size * 4, 0, TAU)
          ctx.stroke()
          ctx.globalCompositeOperation = 'source-over'
        }

        for (let i = bits.length - 1; i >= 0; i--) {
          const b = bits[i]
          b.life -= b.decay * dt
          if (b.life <= 0 || b.y > s.h + 40) { bits.splice(i, 1); continue }
          b.x += b.vx * dt
          b.y += b.vy * dt
          b.vy += 0.32 * dt              // gravity
          b.vx *= 0.985                  // air drag
          b.vy *= 0.992
          b.rot += b.spin * dt
          b.flip += b.flipSpeed * dt

          const squash = Math.cos(b.flip)                     // paper tumbling edge-on
          const alpha = clamp(b.life * 1.6, 0, 1)
          ctx.save()
          ctx.translate(b.x, b.y)
          ctx.rotate(b.rot)
          ctx.scale(1, Math.abs(squash) * 0.9 + 0.1)
          const light = squash > 0 ? 62 : 44                  // shade the back face
          ctx.fillStyle = `hsla(${b.hue},95%,${light}%,${alpha})`
          if (b.ribbon) {
            ctx.fillRect(-b.w * 1.1, -b.h * 0.25, b.w * 2.2, b.h * 0.5)
          } else {
            ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h)
          }
          ctx.restore()
        }
      }
    }
  }
}
