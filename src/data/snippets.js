import { hexToRgb, hueOf, getEffect } from '@yashvanth/cursorverse'

/* Every snippet below is generated from the live playground settings, so what you copy
   is what you just saw. The vanilla versions are self-contained: paste one into a page
   and it mounts its own full-screen canvas. */

const head = trigger => [
  "const cv = document.createElement('canvas')",
  "cv.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999'",
  'document.body.appendChild(cv)',
  "const ctx = cv.getContext('2d')",
  'const fit = () => { cv.width = innerWidth; cv.height = innerHeight }',
  "addEventListener('resize', fit); fit()",
  '',
  'const p = { x: 0, y: 0, px: 0, py: 0 }',
  "addEventListener('pointermove', e => { p.x = e.clientX; p.y = e.clientY })",
  trigger === 'click'
    ? "addEventListener('pointerdown', e => burst(e.clientX, e.clientY))"
    : null,
  'const parts = []'
].filter(Boolean).join('\n')

const loop = (spawn, update) => [
  '',
  'requestAnimationFrame(function frame () {',
  '  ctx.clearRect(0, 0, cv.width, cv.height)',
  '  const vx = p.x - p.px, vy = p.y - p.py; p.px = p.x; p.py = p.y',
  spawn ? spawn.split('\n').map(l => '  ' + l).join('\n') : null,
  update.split('\n').map(l => '  ' + l).join('\n'),
  '  requestAnimationFrame(frame)',
  '})'
].filter(l => l !== null).join('\n')

const walk = body => [
  'for (let i = parts.length - 1; i >= 0; i--) {',
  '  const s = parts[i]',
  '  s.life -= s.decay',
  '  if (s.life <= 0) { parts.splice(i, 1); continue }',
  body.split('\n').map(l => '  ' + l).join('\n'),
  '}'
].join('\n')

/* ---------------- per-effect vanilla implementations ---------------- */
const JS = {
  fire: (C, size) => head('move') + loop(
    'for (let i = 0; i < 3; i++) parts.push({\n' +
    '  x: p.x, y: p.y, vx: (Math.random() - .5) + vx * .1,\n' +
    '  vy: -Math.random() * 1.4 - .4, r: ' + size + ' * (.3 + Math.random() * .5),\n' +
    '  life: 1, decay: .02\n' +
    '})',
    "ctx.globalCompositeOperation = 'lighter'\n" + walk(
      's.x += s.vx; s.y += s.vy; s.vy -= .035; s.vx *= .98\n' +
      'const r = s.r * (1.2 - s.life * .6)\n' +
      'const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r)\n' +
      "g.addColorStop(0, 'rgba(255,250,225,' + s.life + ')')\n" +
      "g.addColorStop(.4, 'rgba(" + C + ",' + s.life * .55 + ')')\n" +
      "g.addColorStop(1, 'rgba(" + C + ",0)')\n" +
      'ctx.fillStyle = g\n' +
      'ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, 7); ctx.fill()'
    )
  ),

  glow: (C, size, speed) => [
    head('move'),
    'const ring = { x: 0, y: 0 }',
    loop(null,
      'ring.x += (p.x - ring.x) * ' + speed + '\n' +
      'ring.y += (p.y - ring.y) * ' + speed + '\n' +
      "ctx.globalCompositeOperation = 'lighter'\n" +
      'const g = ctx.createRadialGradient(ring.x, ring.y, 0, ring.x, ring.y, ' + size * 3 + ')\n' +
      "g.addColorStop(0, 'rgba(" + C + ",.35)')\n" +
      "g.addColorStop(1, 'rgba(" + C + ",0)')\n" +
      'ctx.fillStyle = g\n' +
      'ctx.beginPath(); ctx.arc(ring.x, ring.y, ' + size * 3 + ', 0, 7); ctx.fill()\n' +
      "ctx.strokeStyle = 'rgba(" + C + ",.9)'; ctx.lineWidth = " + Math.max(1.5, size * 0.14) + '\n' +
      'ctx.beginPath(); ctx.arc(ring.x, ring.y, ' + size + ', 0, 7); ctx.stroke()'
    )
  ].join('\n'),

  cat: (C, size, speed) => [
    head('move'),
    'const head = { x: 0, y: 0 }',
    loop(null,
      'head.x += (p.x - head.x) * ' + speed + '; head.y += (p.y - head.y) * ' + speed + '\n' +
      'const R = ' + size / 2 + '\n' +
      "ctx.fillStyle = 'rgb(" + C + ")'\n" +
      '// ears\n' +
      'for (const s of [-1, 1]) {\n' +
      '  ctx.beginPath()\n' +
      '  ctx.moveTo(head.x + s * R * .75, head.y - R * .55)\n' +
      '  ctx.lineTo(head.x + s * R * .95, head.y - R * 1.5)\n' +
      '  ctx.lineTo(head.x + s * R * .15, head.y - R * .9)\n' +
      '  ctx.fill()\n' +
      '}\n' +
      '// head\n' +
      'ctx.beginPath(); ctx.ellipse(head.x, head.y, R, R * .88, 0, 0, 7); ctx.fill()\n' +
      '// eyes, pupils leaning toward the pointer\n' +
      'const d = Math.hypot(p.x - head.x, p.y - head.y) || 1\n' +
      'for (const s of [-1, 1]) {\n' +
      '  const ex = head.x + s * R * .36, ey = head.y - R * .08\n' +
      "  ctx.fillStyle = '#fff'\n" +
      '  ctx.beginPath(); ctx.ellipse(ex, ey, R * .2, R * .24, 0, 0, 7); ctx.fill()\n' +
      "  ctx.fillStyle = '#171722'\n" +
      '  ctx.beginPath()\n' +
      '  ctx.ellipse(ex + (p.x - head.x) / d * R * .09, ey + (p.y - head.y) / d * R * .09, R * .07, R * .17, 0, 0, 7)\n' +
      '  ctx.fill()\n' +
      "  ctx.fillStyle = 'rgb(" + C + ")'\n" +
      '}'
    )
  ].join('\n'),

  rainbow: (C, size) => [
    head('move'),
    'let hue = 0',
    loop(
      'hue = (hue + 2) % 360\n' +
      'parts.push({ x: p.x, y: p.y, hue, life: 1, decay: .02 })',
      "ctx.lineCap = 'round'\n" +
      'for (let i = 1; i < parts.length; i++) {\n' +
      '  const a = parts[i - 1], b = parts[i], t = i / parts.length\n' +
      "  ctx.strokeStyle = 'hsla(' + b.hue + ',100%,60%,' + b.life + ')'\n" +
      '  ctx.lineWidth = ' + size + ' * t * b.life\n' +
      '  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()\n' +
      '}\n' +
      'for (let i = parts.length - 1; i >= 0; i--) {\n' +
      '  parts[i].life -= parts[i].decay\n' +
      '  if (parts[i].life <= 0) parts.splice(i, 1)\n' +
      '}'
    )
  ].join('\n'),

  star: (C, size) => [
    head('move'),
    'function star (x, y, r, rot) {',
    '  ctx.beginPath()',
    '  for (let i = 0; i < 10; i++) {',
    '    const rad = i % 2 ? r * .45 : r',
    '    const a = i / 10 * 6.283 + rot',
    '    ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad)',
    '  }',
    '  ctx.closePath(); ctx.fill()',
    '}',
    loop(
      'if (Math.hypot(vx, vy) > 1) parts.push({\n' +
      '  x: p.x, y: p.y, vx: (Math.random() - .5) * 2, vy: -Math.random(),\n' +
      '  r: ' + size + ' * (.5 + Math.random()), rot: Math.random() * 6.283,\n' +
      '  spin: (Math.random() - .5) * .18, life: 1, decay: .015\n' +
      '})',
      "ctx.globalCompositeOperation = 'lighter'\n" + walk(
        's.x += s.vx; s.y += s.vy; s.vy += .012; s.rot += s.spin\n' +
        "ctx.fillStyle = 'rgba(" + C + ",' + s.life + ')'\n" +
        'star(s.x, s.y, s.r * s.life, s.rot)'
      )
    )
  ].join('\n'),

  heart: (C, size) => [
    head('move'),
    'function heart (x, y, s) {',
    '  ctx.beginPath()',
    '  ctx.moveTo(x, y + s * .3)',
    '  ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s * .3)',
    '  ctx.bezierCurveTo(x - s / 2, y + s * .66, x, y + s * .9, x, y + s * 1.12)',
    '  ctx.bezierCurveTo(x, y + s * .9, x + s / 2, y + s * .66, x + s / 2, y + s * .3)',
    '  ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s * .3)',
    '  ctx.fill()',
    '}',
    loop(
      'if (Math.hypot(vx, vy) > 1) parts.push({\n' +
      '  x: p.x, y: p.y, vy: -.7 - Math.random(), sway: Math.random() * 6.283,\n' +
      '  s: ' + size + ' * (.6 + Math.random() * .7), life: 1, decay: .012\n' +
      '})',
      walk(
        's.sway += .07; s.x += Math.sin(s.sway) * .5; s.y += s.vy; s.vy *= .985\n' +
        "ctx.fillStyle = 'rgba(" + C + ",' + s.life + ')'\n" +
        'heart(s.x, s.y, s.s * s.life)'
      )
    )
  ].join('\n'),

  blob: (C, size, speed) => [
    head('move'),
    '// a chain of nodes, merged by a metaball field sampled every 4px',
    'const N = 6, STEP = 4',
    'const nodes = Array.from({ length: N }, () => ({ x: 0, y: 0 }))',
    'const buf = document.createElement(' + "'canvas'" + ')',
    'const bctx = buf.getContext(' + "'2d'" + ')',
    loop(null,
      'nodes[0].x += (p.x - nodes[0].x) * ' + (speed * 2.2).toFixed(2) + '\n' +
      'nodes[0].y += (p.y - nodes[0].y) * ' + (speed * 2.2).toFixed(2) + '\n' +
      'for (let i = 1; i < N; i++) {\n' +
      '  nodes[i].x += (nodes[i - 1].x - nodes[i].x) * ' + (speed * 1.8).toFixed(2) + '\n' +
      '  nodes[i].y += (nodes[i - 1].y - nodes[i].y) * ' + (speed * 1.8).toFixed(2) + '\n' +
      '}\n' +
      'const fw = Math.ceil(cv.width / STEP), fh = Math.ceil(cv.height / STEP)\n' +
      'if (buf.width !== fw) { buf.width = fw; buf.height = fh }\n' +
      'const img = bctx.createImageData(fw, fh), d = img.data\n' +
      'for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {\n' +
      '  let sum = 0\n' +
      '  for (let i = 0; i < N; i++) {\n' +
      '    const r = ' + size / 2 + ' * (1 - i / (N + 1.2))\n' +
      '    const dx = x * STEP - nodes[i].x, dy = y * STEP - nodes[i].y\n' +
      '    sum += r * r / (dx * dx + dy * dy || .0001)\n' +
      '  }\n' +
      '  if (sum < .75) continue\n' +
      '  const o = (y * fw + x) * 4\n' +
      '  d[o] = ' + C.split(',')[0] + '; d[o + 1] = ' + C.split(',')[1] + '; d[o + 2] = ' + C.split(',')[2] + '\n' +
      '  d[o + 3] = Math.min(1, (sum - .75) * 1.6) * 235\n' +
      '}\n' +
      'bctx.putImageData(img, 0, 0)\n' +
      'ctx.drawImage(buf, 0, 0, cv.width, cv.height)'
    )
  ].join('\n'),

  confetti: (C, size) => [
    head('click'),
    'function burst (x, y) {',
    '  for (let i = 0; i < 46; i++) {',
    '    const a = Math.random() * 6.283, v = 2 + Math.random() * 7',
    '    parts.push({',
    '      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2,',
    '      w: ' + size + ' * (.35 + Math.random() * .35), h: ' + size + ' * (.2 + Math.random() * .2),',
    '      rot: Math.random() * 6.283, spin: (Math.random() - .5) * .6,',
    '      flip: Math.random() * 6.283, hue: ' + 'HUE' + ' + (Math.random() - .5) * 120,',
    '      life: 1, decay: .008',
    '    })',
    '  }',
    '}',
    loop(null, walk(
      's.x += s.vx; s.y += s.vy; s.vy += .32; s.vx *= .985\n' +
      's.rot += s.spin; s.flip += .2\n' +
      'ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot)\n' +
      'ctx.scale(1, Math.abs(Math.cos(s.flip)) * .9 + .1)\n' +
      "ctx.fillStyle = 'hsla(' + s.hue + ',95%,' + (Math.cos(s.flip) > 0 ? 62 : 44) + '%,' + s.life + ')'\n" +
      'ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h)\n' +
      'ctx.restore()'
    ))
  ].join('\n'),

  ripple: (C, size) => [
    head('click'),
    'function burst (x, y) {',
    '  for (let i = 0; i < 3; i++) {',
    '    parts.push({ x, y, r: ' + size * 0.12 + ', grow: 1.6 - i * .2, w: 2.6 - i * .6, life: 1, decay: .012 })',
    '  }',
    '}',
    loop(null, walk(
      's.r += s.grow * (.4 + s.life)\n' +
      "ctx.strokeStyle = 'rgba(" + C + ",' + s.life * s.life + ')'\n" +
      'ctx.lineWidth = s.w * s.life\n' +
      'ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.stroke()'
    ))
  ].join('\n'),

  magnetic: (C, size, speed) => [
    '// no canvas needed: a ring element plus a pull on every .magnet in range',
    "const ring = document.createElement('div')",
    "ring.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;" +
    'border:2px solid rgb(' + C + ');border-radius:999px;width:' + size * 2 + 'px;height:' + size * 2 + "px'",
    'document.body.appendChild(ring)',
    '',
    'const p = { x: 0, y: 0 }, cur = { x: 0, y: 0 }',
    "addEventListener('pointermove', e => { p.x = e.clientX; p.y = e.clientY })",
    '',
    'const PULL = ' + Math.max(90, size * 9),
    'requestAnimationFrame(function frame () {',
    '  cur.x += (p.x - cur.x) * ' + speed + '; cur.y += (p.y - cur.y) * ' + speed,
    "  ring.style.transform = 'translate(' + (cur.x - " + size + ") + 'px,' + (cur.y - " + size + ") + 'px)'",
    "  document.querySelectorAll('.magnet').forEach(el => {",
    '    const r = el.getBoundingClientRect()',
    '    const dx = p.x - (r.left + r.width / 2), dy = p.y - (r.top + r.height / 2)',
    '    const dist = Math.hypot(dx, dy)',
    '    if (dist > PULL) { el.style.transform = ""; return }',
    '    const f = Math.pow(1 - dist / PULL, 1.6) * ' + size * 1.4,
    "    el.style.transform = 'translate(' + dx / dist * f + 'px,' + dy / dist * f + 'px)'",
    '  })',
    '  requestAnimationFrame(frame)',
    '})'
  ].join('\n'),

  snow: (C, size) => [
    head('move'),
    'function flake (r) {',
    '  ctx.beginPath()',
    '  for (let i = 0; i < 6; i++) {',
    '    const a = i / 6 * 6.283',
    '    ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)',
    '    const bx = Math.cos(a) * r * .5, by = Math.sin(a) * r * .5',
    '    for (const s of [.6, -.6]) {',
    '      ctx.moveTo(bx, by)',
    '      ctx.lineTo(bx + Math.cos(a + s) * r * .3, by + Math.sin(a + s) * r * .3)',
    '    }',
    '  }',
    '  ctx.stroke()',
    '}',
    loop(
      'parts.push({\n' +
      '  x: p.x, y: p.y, vy: .3 + Math.random() * .5, sway: Math.random() * 6.283,\n' +
      '  r: ' + size + ' * (.3 + Math.random() * .45), rot: Math.random() * 6.283,\n' +
      '  spin: (Math.random() - .5) * .07, life: 1, decay: .007\n' +
      '})',
      walk(
        's.sway += .045; s.x += Math.sin(s.sway) * .5; s.y += s.vy; s.rot += s.spin\n' +
        'ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot)\n' +
        "ctx.strokeStyle = 'rgba(" + C + ",' + s.life + ')'\n" +
        'ctx.lineWidth = Math.max(.5, s.r * .12)\n' +
        'flake(s.r)\n' +
        'ctx.restore()'
      )
    )
  ].join('\n'),

  spark: (C, size) => [
    head('click'),
    'function burst (x, y) {',
    '  for (let i = 0; i < 26; i++) {',
    '    const a = Math.random() * 6.283, v = 2 + Math.random() * 9',
    '    parts.push({ x, y, px: x, py: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: .03 })',
    '  }',
    '}',
    loop(null,
      "ctx.globalCompositeOperation = 'lighter'\n" +
      "ctx.lineCap = 'round'\n" + walk(
        's.px = s.x; s.py = s.y\n' +
        's.x += s.vx; s.y += s.vy; s.vy += .16; s.vx *= .93; s.vy *= .93\n' +
        "ctx.strokeStyle = 'rgba(" + C + ",' + s.life + ')'\n" +
        'ctx.lineWidth = ' + Math.max(0.5, size * 0.16) + ' * s.life\n' +
        'ctx.beginPath(); ctx.moveTo(s.px, s.py); ctx.lineTo(s.x, s.y); ctx.stroke()'
      )
    )
  ].join('\n')
}

const CSS = {
  magnetic: (hex, size) => [
    '.magnet {',
    '  transition: transform 220ms cubic-bezier(.16, .8, .25, 1);',
    '}',
    '/* the ring is positioned from JS; keep the native cursor out of the way */',
    'body { cursor: none; }'
  ].join('\n'),
  default: (hex, size, id) => [
    '/* the canvas the effect mounts into */',
    '.cursor-fx {',
    '  position: fixed;',
    '  inset: 0;',
    '  pointer-events: none;   /* clicks pass straight through */',
    '  z-index: 9999;',
    '}',
    '',
    '/* hide the system cursor so the effect is the cursor */',
    'body { cursor: none; }',
    '',
    ':root {',
    '  --fx-color: ' + hex + ';',
    '  --fx-size: ' + size + 'px;',
    '}'
  ].join('\n')
}

export default function getSnippets(id, { color, size, speed }) {
  const meta = getEffect(id)
  const pkg = '@yashvanth/cursorverse'
  const { r, g, b } = hexToRgb(color)
  const C = r + ',' + g + ',' + b

  const react = [
    "import { useRef } from 'react'",
    "import { " + meta.name + " } from '@yashvanth/cursorverse/react'",
    '',
    'export default function Demo () {',
    '  const stage = useRef(null)',
    '  return (',
    '    // the stage must be position:relative — the effect fills it',
    '    <div className="stage" ref={stage}>',
    '      <' + meta.name,
    '        color="' + color + '"',
    '        size={' + size + '}',
    '        speed={' + speed + '}',
    '        containerRef={stage}',
    '      />',
    '    </div>',
    '  )',
    '}',
    '',
    '// containerRef is optional — without it the effect fills its parent element',
  ].join('\n')

  const install = [
    '# npm i ' + pkg,
    '',
    "import { createCursor } from '" + pkg + "'",
    '',
    "// page-wide: hides the OS cursor and runs until you stop it",
    "const cursor = createCursor('" + id + "', {",
    "  color: '" + color + "',",
    '  size: ' + size + ',',
    '  speed: ' + speed + ',',
    '  // target: document.querySelector(".hero"),  // confine it to one element',
    '})',
    '',
    "cursor.update({ color: '#22d3ee' })   // retune without restarting",
    'cursor.disable()                      // user turned it off in your settings',
    'cursor.enable()                       // …and back on',
    'cursor.destroy()                      // remove it, restore the native cursor'
  ].join('\n')

  const css = (CSS[id] || CSS.default)(color, size, id)

  let js = (JS[id] || JS.fire)(C, size, speed)
  if (id === 'confetti') {
    // the confetti palette fans out around the picked hue
    const hue = Math.round(hueOf(color))
    js = js.replace('HUE', String(hue))
  }
  return { install, react, css, js }
}

