/* Small helpers shared by every effect. No DOM, no framework. */

export const lerp = (a, b, t) => a + (b - a) * t
export const rand = (a, b) => a + Math.random() * (b - a)
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const TAU = Math.PI * 2

export function hexToRgb(hex) {
  let h = String(hex || '#ffffff').replace('#', '').trim()
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const n = parseInt(h, 16)
  if (Number.isNaN(n)) return { r: 255, g: 255, b: 255 }
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgba(hex, a = 1) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${clamp(a, 0, 1)})`
}

/** blend two hex colours, t=0 -> a, t=1 -> b, returns an rgba() string */
export function mix(a, b, t, alpha = 1) {
  const c1 = hexToRgb(a), c2 = hexToRgb(b)
  return `rgba(${Math.round(lerp(c1.r, c2.r, t))},${Math.round(lerp(c1.g, c2.g, t))},${Math.round(lerp(c1.b, c2.b, t))},${clamp(alpha, 0, 1)})`
}

/** hue of a hex colour, in degrees */
export function hueOf(hex) {
  const { r, g, b } = hexToRgb(hex)
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const d = max - min
  if (d === 0) return 0
  let h
  if (max === rn) h = ((gn - bn) / d) % 6
  else if (max === gn) h = (bn - rn) / d + 2
  else h = (rn - gn) / d + 4
  return (h * 60 + 360) % 360
}

/* ---------- shapes ---------- */
export function starPath(ctx, r, points = 5, innerRatio = 0.45) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * innerRatio
    const a = (i / (points * 2)) * TAU - Math.PI / 2
    const x = Math.cos(a) * rad
    const y = Math.sin(a) * rad
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath()
}

/** heart centred on the origin, `s` is roughly its width */
export function heartPath(ctx, s) {
  const t = -s * 0.55
  ctx.beginPath()
  ctx.moveTo(0, t + s * 0.3)
  ctx.bezierCurveTo(0, t, -s / 2, t, -s / 2, t + s * 0.3)
  ctx.bezierCurveTo(-s / 2, t + s * 0.66, 0, t + s * 0.9, 0, t + s * 1.12)
  ctx.bezierCurveTo(0, t + s * 0.9, s / 2, t + s * 0.66, s / 2, t + s * 0.3)
  ctx.bezierCurveTo(s / 2, t, 0, t, 0, t + s * 0.3)
  ctx.closePath()
}

/** six-armed snow crystal centred on the origin */
export function snowflakePath(ctx, r) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU
    const dx = Math.cos(a), dy = Math.sin(a)
    ctx.moveTo(0, 0)
    ctx.lineTo(dx * r, dy * r)
    for (const at of [0.45, 0.75]) {
      const bx = dx * r * at, by = dy * r * at
      const len = r * (at === 0.45 ? 0.32 : 0.2)
      for (const spread of [0.6, -0.6]) {
        ctx.moveTo(bx, by)
        ctx.lineTo(bx + Math.cos(a + spread) * len, by + Math.sin(a + spread) * len)
      }
    }
  }
}
