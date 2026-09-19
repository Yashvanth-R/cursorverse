import fire from './fire'
import glow from './glow'
import cat from './cat'
import rainbow from './rainbow'
import star from './star'
import heart from './heart'
import blob from './blob'
import confetti from './confetti'
import ripple from './ripple'
import magnetic from './magnetic'
import snow from './snow'
import spark from './spark'

/** Every effect, in catalogue order. */
export const effects = [
  fire, glow, cat, rainbow, star, heart,
  blob, confetti, ripple, magnetic, snow, spark
]

export const effectMap = effects.reduce((m, e) => { m[e.id] = e; return m }, {})
export const effectIds = effects.map(e => e.id)

/** Look up an effect by id (or pass a definition object straight through). */
export function getEffect(id) {
  if (id && typeof id === 'object' && (id.create || id.mount)) return id
  const def = effectMap[id]
  if (!def) throw new Error(`[cursorverse] unknown effect "${id}". Known: ${effectIds.join(', ')}`)
  return def
}

export {
  fire, glow, cat, rainbow, star, heart,
  blob, confetti, ripple, magnetic, snow, spark
}
