import { rand, rgba, mix, clamp, TAU } from '../core/math'

/** Electric sparks: streaks that decelerate, drop, and crackle into secondary embers. */
export default {
  id: 'spark',
  name: 'SparkClick',
  title: 'Spark',
  emoji: '⚡',
  category: 'Click Effects',
  trigger: 'click',
  hint: 'Click to strike sparks',
  hideCursor: false,
  defaults: { color: '#ffd93d', size: 10, speed: 0.3 },

  create (ctx, state, opts) {
    const sparks = []
    const flashes = []
    const bolts = []

    function spawn(x, y, n, power, gen) {
      const { speed } = opts.current
      for (let i = 0; i < n; i++) {
        const a = rand(0, TAU)
        const v = rand(2, 11) * power * (0.4 + speed * 2.4)
        sparks.push({
          x, y, px: x, py: y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          life: 1,
          decay: rand(0.02, 0.05) / power,
          gen
        })
      }
    }

    function strike(x, y) {
      const { size } = opts.current
      spawn(x, y, 26, 1, 0)
      flashes.push({ x, y, life: 1 })
      // a couple of jagged bolts shooting out of the impact
      for (let b = 0; b < 3; b++) {
        const a = rand(0, TAU)
        const pts = [{ x, y }]
        let cx = x, cy = y, ca = a
        for (let j = 0; j < 5; j++) {
          ca += rand(-0.7, 0.7)
          const len = size * rand(0.6, 1.6)
          cx += Math.cos(ca) * len
          cy += Math.sin(ca) * len
          pts.push({ x: cx, y: cy })
        }
        bolts.push({ pts, life: 1 })
      }
    }

    return {
      down(x, y) { strike(x, y) },
      frame(dt, s) {
        const { color, size } = opts.current
        ctx.globalCompositeOperation = 'lighter'
        ctx.lineCap = 'round'

        for (let i = flashes.length - 1; i >= 0; i--) {
          const f = flashes[i]
          f.life -= 0.13 * dt
          if (f.life <= 0) { flashes.splice(i, 1); continue }
          const r = size * (0.6 + (1 - f.life) * 3.2)
          const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r)
          g.addColorStop(0, rgba('#ffffff', f.life * 0.8))
          g.addColorStop(0.35, mix(color, '#ffffff', 0.4, f.life * 0.5))
          g.addColorStop(1, rgba(color, 0))
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(f.x, f.y, r, 0, TAU)
          ctx.fill()
        }

        for (let i = bolts.length - 1; i >= 0; i--) {
          const b = bolts[i]
          b.life -= 0.14 * dt
          if (b.life <= 0) { bolts.splice(i, 1); continue }
          ctx.strokeStyle = mix(color, '#ffffff', 0.6, b.life)
          ctx.lineWidth = Math.max(0.6, size * 0.14 * b.life)
          ctx.shadowBlur = size
          ctx.shadowColor = rgba(color, b.life)
          ctx.beginPath()
          ctx.moveTo(b.pts[0].x, b.pts[0].y)
          for (let j = 1; j < b.pts.length; j++) ctx.lineTo(b.pts[j].x, b.pts[j].y)
          ctx.stroke()
        }
        ctx.shadowBlur = 0

        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i]
          sp.life -= sp.decay * dt
          if (sp.life <= 0) {
            // crackle: a big spark throws a few small ones as it dies
            if (sp.gen === 0 && Math.random() < 0.35) spawn(sp.x, sp.y, 3, 0.4, 1)
            sparks.splice(i, 1)
            continue
          }
          sp.px = sp.x; sp.py = sp.y
          sp.x += sp.vx * dt
          sp.y += sp.vy * dt
          sp.vy += 0.16 * dt
          sp.vx *= 0.93
          sp.vy *= 0.93

          const alpha = clamp(sp.life * 1.5, 0, 1)
          ctx.strokeStyle = mix(color, '#ffffff', sp.life * 0.7, alpha)
          ctx.lineWidth = Math.max(0.5, size * 0.16 * sp.life)
          ctx.beginPath()
          ctx.moveTo(sp.px, sp.py)
          ctx.lineTo(sp.x, sp.y)
          ctx.stroke()
        }
        ctx.globalCompositeOperation = 'source-over'
      }
    }
  }
}
