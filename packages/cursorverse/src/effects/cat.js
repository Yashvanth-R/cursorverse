import { lerp, clamp, mix, rgba, TAU } from '../core/math'

/** A cat head that chases the pointer: ears, blinking eyes that track, and a wagging tail. */
export default {
  id: 'cat',
  name: 'CatCursor',
  title: 'Cat',
  emoji: '🐱',
  category: 'Cursors',
  trigger: 'move',
  hint: 'The cat watches your pointer',
  hideCursor: true,
  defaults: { color: '#ffd166', size: 36, speed: 0.28 },

  create (ctx, state, opts) {
    const head = { x: -9999, y: -9999, tilt: 0 }
    const tail = Array.from({ length: 9 }, () => ({ x: -9999, y: -9999 }))
    let blink = 0
    let nextBlink = 900

    return {
      frame(dt, s) {
        const { color, size, speed } = opts.current
        const p = s.pointer
        if (!p.seen) return
        if (head.x < -9000) {
          head.x = p.x; head.y = p.y
          tail.forEach(t => { t.x = p.x; t.y = p.y })
        }

        const k = clamp(speed * dt, 0, 1)
        const dx = p.x - head.x
        const dy = p.y - head.y
        head.x = lerp(head.x, p.x, k)
        head.y = lerp(head.y, p.y, k)
        head.tilt = lerp(head.tilt, clamp(dx * 0.012, -0.5, 0.5), 0.12 * dt)

        // tail: each segment chases the one in front, plus a sine wag
        const wag = Math.sin(s.time * 0.006) * size * 0.14
        const back = Math.atan2(dy, dx) + Math.PI       // opposite the direction of travel
        tail[0].x = head.x + Math.cos(back) * size * 0.42
        tail[0].y = head.y + Math.sin(back) * size * 0.42
        for (let i = 1; i < tail.length; i++) {
          const t = tail[i], prev = tail[i - 1]
          const seg = size * 0.13
          const a = Math.atan2(t.y - prev.y, t.x - prev.x)
          const tx = prev.x + Math.cos(a) * seg + Math.cos(back + Math.PI / 2) * wag * (i / tail.length)
          const ty = prev.y + Math.sin(a) * seg + Math.sin(back + Math.PI / 2) * wag * (i / tail.length)
          t.x = lerp(t.x, tx, 0.55 * dt)
          t.y = lerp(t.y, ty, 0.55 * dt)
        }

        // ---- tail ----
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        for (let i = tail.length - 1; i > 0; i--) {
          ctx.strokeStyle = mix(color, '#000000', 0.12, 1)
          ctx.lineWidth = size * 0.17 * (1 - i / (tail.length + 2))
          ctx.beginPath()
          ctx.moveTo(tail[i - 1].x, tail[i - 1].y)
          ctx.lineTo(tail[i].x, tail[i].y)
          ctx.stroke()
        }

        ctx.save()
        ctx.translate(head.x, head.y)
        ctx.rotate(head.tilt)
        const R = size * 0.5

        // ---- ears ----
        ctx.fillStyle = color
        for (const side of [-1, 1]) {
          ctx.beginPath()
          ctx.moveTo(side * R * 0.75, -R * 0.55)
          ctx.lineTo(side * R * 0.95, -R * 1.5)
          ctx.lineTo(side * R * 0.15, -R * 0.9)
          ctx.closePath()
          ctx.fill()
          ctx.fillStyle = mix(color, '#ff8fab', 0.65, 1)
          ctx.beginPath()
          ctx.moveTo(side * R * 0.7, -R * 0.7)
          ctx.lineTo(side * R * 0.82, -R * 1.22)
          ctx.lineTo(side * R * 0.34, -R * 0.9)
          ctx.closePath()
          ctx.fill()
          ctx.fillStyle = color
        }

        // ---- head ----
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.ellipse(0, 0, R, R * 0.88, 0, 0, TAU)
        ctx.fill()

        // ---- eyes, pupils leaning toward the real pointer ----
        blink += dt * 16
        if (blink > nextBlink) {
          if (blink > nextBlink + 130) { blink = 0; nextBlink = 900 + Math.random() * 2600 }
        }
        const blinking = blink > nextBlink
        const look = Math.hypot(dx, dy) || 1
        const lx = clamp(dx / look, -1, 1) * R * 0.09
        const ly = clamp(dy / look, -1, 1) * R * 0.09

        for (const side of [-1, 1]) {
          const ex = side * R * 0.36, ey = -R * 0.08
          if (blinking) {
            ctx.strokeStyle = '#1b1b25'
            ctx.lineWidth = Math.max(1.2, R * 0.09)
            ctx.beginPath()
            ctx.moveTo(ex - R * 0.18, ey)
            ctx.lineTo(ex + R * 0.18, ey)
            ctx.stroke()
          } else {
            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.ellipse(ex, ey, R * 0.2, R * 0.24, 0, 0, TAU)
            ctx.fill()
            ctx.fillStyle = '#171722'
            ctx.beginPath()
            ctx.ellipse(ex + lx, ey + ly, R * 0.07, R * 0.17, 0, 0, TAU)   // slit pupil
            ctx.fill()
          }
        }

        // ---- nose + mouth ----
        ctx.fillStyle = mix(color, '#ff5d8f', 0.8, 1)
        ctx.beginPath()
        ctx.moveTo(0, R * 0.18)
        ctx.lineTo(-R * 0.11, R * 0.06)
        ctx.lineTo(R * 0.11, R * 0.06)
        ctx.closePath()
        ctx.fill()

        ctx.strokeStyle = 'rgba(30,30,40,0.75)'
        ctx.lineWidth = Math.max(1, R * 0.055)
        ctx.beginPath()
        ctx.arc(-R * 0.13, R * 0.24, R * 0.15, 0, Math.PI)
        ctx.arc(R * 0.13, R * 0.24, R * 0.15, 0, Math.PI)
        ctx.stroke()

        // ---- whiskers ----
        ctx.strokeStyle = rgba('#ffffff', 0.75)
        ctx.lineWidth = Math.max(0.8, R * 0.04)
        for (const side of [-1, 1]) {
          for (const spread of [-0.22, 0, 0.22]) {
            ctx.beginPath()
            ctx.moveTo(side * R * 0.28, R * 0.14)
            ctx.lineTo(side * R * 1.15, R * 0.14 + spread * R)
            ctx.stroke()
          }
        }
        ctx.restore()
      }
    }
  }
}
