import { hueOf, clamp } from '../core/math'

/** A smooth ribbon behind the pointer whose hue cycles as it is drawn. */
export default {
  id: 'rainbow',
  name: 'RainbowTrail',
  title: 'Rainbow Trail',
  emoji: '🌈',
  category: 'Trails',
  trigger: 'move',
  hint: 'Draw with your pointer',
  hideCursor: true,
  defaults: { color: '#ff2d95', size: 14, speed: 0.12 },

  create (ctx, state, opts) {
    const pts = []
    let hue = hueOf(opts.current.color)

    return {
      frame(dt, s) {
        const { color, size, speed } = opts.current
        const p = s.pointer
        hue = (hue + (3.5 + speed * 14) * dt) % 360

        if (p.seen && p.inside) {
          const last = pts[pts.length - 1]
          if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 1.2) {
            pts.push({ x: p.x, y: p.y, hue, life: 1 })
          }
        }
        const fade = 0.016 + speed * 0.06
        for (let i = pts.length - 1; i >= 0; i--) {
          pts[i].life -= fade * dt
          if (pts[i].life <= 0) pts.splice(i, 1)
        }
        while (pts.length > 140) pts.shift()
        if (pts.length < 2) return

        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalCompositeOperation = 'lighter'

        // two passes: a wide soft glow, then the crisp ribbon.
        // each segment runs midpoint -> point -> midpoint, so the curve stays
        // continuous while every segment keeps its own hue and width.
        for (const pass of [{ w: 2.6, a: 0.18 }, { w: 1, a: 1 }]) {
          for (let i = 1; i < pts.length - 1; i++) {
            const a = pts[i - 1], b = pts[i], c = pts[i + 1]
            const t = i / pts.length
            ctx.strokeStyle = `hsla(${b.hue},100%,${pass.w > 1 ? 60 : 65}%,${clamp(b.life * t * pass.a, 0, 1)})`
            ctx.lineWidth = Math.max(0.8, size * t * b.life * pass.w)
            ctx.beginPath()
            ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2)
            ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2)
            ctx.stroke()
          }
        }

        // head of the ribbon
        if (p.inside) {
          ctx.fillStyle = `hsl(${hue},100%,72%)`
          ctx.shadowBlur = size
          ctx.shadowColor = `hsl(${hue},100%,60%)`
          ctx.beginPath()
          ctx.arc(p.x, p.y, size * 0.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
        ctx.globalCompositeOperation = 'source-over'
      }
    }
  }
}
