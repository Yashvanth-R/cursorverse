import { lerp, clamp, hexToRgb, rgba, TAU } from '../core/math'

/**
 * A real metaball blob: a chain of nodes chases the pointer and the nodes are merged
 * by evaluating an implicit field on a low-res buffer, then upscaled. That gooey
 * "one body stretching and snapping back" look is impossible with plain circles.
 */
export default {
  id: 'blob',
  name: 'BlobCursor',
  title: 'Blob',
  emoji: '🟣',
  category: 'Cursors',
  trigger: 'move',
  hint: 'Flick the pointer to stretch the blob',
  hideCursor: true,
  defaults: { color: '#6ee7b7', size: 40, speed: 0.12 },

  create (ctx, state, opts) {
    const N = 6
    const nodes = Array.from({ length: N }, () => ({ x: -9999, y: -9999 }))
    const STEP = 4                          // field resolution, in css px
    let field = null, fw = 0, fh = 0, img = null

    function ensureBuffer(w, h) {
      const nw = Math.max(1, Math.ceil(w / STEP))
      const nh = Math.max(1, Math.ceil(h / STEP))
      if (nw === fw && nh === fh && field) return
      fw = nw; fh = nh
      field = document.createElement('canvas')
      field.width = fw; field.height = fh
      img = field.getContext('2d').createImageData(fw, fh)
    }

    return {
      frame(dt, s) {
        const { color, size, speed } = opts.current
        const p = s.pointer
        if (!p.seen) return
        if (nodes[0].x < -9000) nodes.forEach(n => { n.x = p.x; n.y = p.y })

        // head springs to the pointer, the rest follow in a chain
        const k = clamp(speed * 2.2 * dt, 0, 1)
        nodes[0].x = lerp(nodes[0].x, p.x, k)
        nodes[0].y = lerp(nodes[0].y, p.y, k)
        for (let i = 1; i < N; i++) {
          const f = clamp(speed * (2.2 - i * 0.22) * dt, 0, 1)
          nodes[i].x = lerp(nodes[i].x, nodes[i - 1].x, f)
          nodes[i].y = lerp(nodes[i].y, nodes[i - 1].y, f)
        }

        const radii = nodes.map((_, i) => size * 0.5 * (1 - i / (N + 1.2)))

        ensureBuffer(s.w, s.h)
        const data = img.data
        const { r: cr, g: cg, b: cb } = hexToRgb(color)

        // bounding box of the blob so we only touch pixels that can matter
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (let i = 0; i < N; i++) {
          const pad = radii[i] * 2.2
          minX = Math.min(minX, nodes[i].x - pad); maxX = Math.max(maxX, nodes[i].x + pad)
          minY = Math.min(minY, nodes[i].y - pad); maxY = Math.max(maxY, nodes[i].y + pad)
        }
        const x0 = clamp(Math.floor(minX / STEP), 0, fw), x1 = clamp(Math.ceil(maxX / STEP), 0, fw)
        const y0 = clamp(Math.floor(minY / STEP), 0, fh), y1 = clamp(Math.ceil(maxY / STEP), 0, fh)

        data.fill(0)
        for (let py = y0; py < y1; py++) {
          const wy = py * STEP
          for (let px = x0; px < x1; px++) {
            const wx = px * STEP
            let sum = 0
            for (let i = 0; i < N; i++) {
              const dx = wx - nodes[i].x, dy = wy - nodes[i].y
              const d2 = dx * dx + dy * dy || 0.0001
              sum += (radii[i] * radii[i]) / d2
            }
            if (sum < 0.55) continue
            const a = clamp((sum - 0.75) * 1.6, 0, 1)
            const hot = clamp((sum - 1.2) * 0.5, 0, 0.55)   // brighter core
            const o = (py * fw + px) * 4
            data[o] = Math.min(255, cr + hot * 140)
            data[o + 1] = Math.min(255, cg + hot * 140)
            data[o + 2] = Math.min(255, cb + hot * 140)
            data[o + 3] = a * 235
          }
        }
        field.getContext('2d').putImageData(img, 0, 0)

        ctx.save()
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.shadowBlur = size * 0.6
        ctx.shadowColor = rgba(color, 0.5)
        ctx.drawImage(field, 0, 0, fw, fh, 0, 0, fw * STEP, fh * STEP)
        ctx.restore()

        // glossy highlight on the head so it reads as a 3D droplet
        const hx = nodes[0].x - radii[0] * 0.3, hy = nodes[0].y - radii[0] * 0.35
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, radii[0] * 0.7)
        g.addColorStop(0, 'rgba(255,255,255,0.55)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(hx, hy, radii[0] * 0.7, 0, TAU)
        ctx.fill()
      }
    }
  }
}
