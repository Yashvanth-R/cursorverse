import { starPath, rand, rgba, hueOf, TAU } from '../core/math'

/** Spinning five-point stars that scatter from the pointer and twinkle out. */
export default {
  id: 'star',
  name: 'StarTrail',
  title: 'Star Trail',
  emoji: '⭐',
  category: 'Trails',
  trigger: 'move',
  hint: 'Sweep across to scatter stars',
  hideCursor: true,
  defaults: { color: '#ffd700', size: 10, speed: 0.16 },

  create (ctx, state, opts) {
    const stars = []
    let acc = 0

    return {
      frame(dt, s) {
        const { color, size, speed } = opts.current
        const p = s.pointer
        const baseHue = hueOf(color)

        if (p.inside && p.seen) {
          acc += p.speed * dt + 0.6 * dt
          while (acc > 6) {
            acc -= 6
            stars.push({
              x: p.x + rand(-4, 4),
              y: p.y + rand(-4, 4),
              vx: rand(-1, 1) + p.vx * 0.08,
              vy: rand(-1.1, 0.2) + p.vy * 0.08,
              r: size * rand(0.5, 1.3),
              rot: rand(0, TAU),
              spin: rand(-0.09, 0.09),
              life: 1,
              decay: rand(0.01, 0.02) * (0.5 + speed * 3),
              hue: baseHue + rand(-18, 18),
              twinkle: rand(0, TAU)
            })
          }
        }

        ctx.globalCompositeOperation = 'lighter'
        for (let i = stars.length - 1; i >= 0; i--) {
          const st = stars[i]
          st.life -= st.decay * dt
          if (st.life <= 0) { stars.splice(i, 1); continue }
          st.x += st.vx * dt
          st.y += st.vy * dt
          st.vy += 0.012 * dt
          st.vx *= 0.985
          st.vy *= 0.985
          st.rot += st.spin * dt
          st.twinkle += 0.16 * dt

          const pulse = 0.75 + Math.sin(st.twinkle) * 0.25
          const r = st.r * st.life * pulse
          const alpha = Math.min(1, st.life * 1.4)

          ctx.save()
          ctx.translate(st.x, st.y)
          ctx.rotate(st.rot)
          ctx.shadowBlur = r * 2
          ctx.shadowColor = `hsla(${st.hue},100%,65%,${alpha})`
          ctx.fillStyle = `hsla(${st.hue},100%,${72 - (1 - st.life) * 18}%,${alpha})`
          starPath(ctx, r)
          ctx.fill()
          // glint
          ctx.strokeStyle = rgba('#ffffff', alpha * 0.5)
          ctx.lineWidth = Math.max(0.4, r * 0.09)
          ctx.beginPath()
          ctx.moveTo(-r * 1.6, 0); ctx.lineTo(r * 1.6, 0)
          ctx.moveTo(0, -r * 1.6); ctx.lineTo(0, r * 1.6)
          ctx.stroke()
          ctx.restore()
        }
        ctx.shadowBlur = 0
        ctx.globalCompositeOperation = 'source-over'
      }
    }
  }
}
