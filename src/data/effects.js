import { catalogue } from '@yashvanth/cursorverse'

/* The library ships the effect metadata (title, emoji, category, trigger, defaults);
   the demo only adds its own marketing copy on top. */
const DESCRIPTIONS = {
  fire: 'A hot trailing cursor with glow and soft tail.',
  glow: 'Soft neon glow that follows the pointer.',
  cat: 'A playful cat head follows the pointer.',
  rainbow: 'Colorful trail that cycles hues.',
  star: 'Tiny stars that fade out behind the cursor.',
  heart: 'Heart-shaped particles on hover and move.',
  blob: 'Soft blob that smoothly follows pointer movements.',
  confetti: 'Burst of confetti when clicking.',
  ripple: 'Ripple effect that radiates from clicks.',
  magnetic: 'Cursor pulls nearby elements subtly.',
  snow: 'Tiny snowflakes trailing the cursor.',
  spark: 'Quick sparks on each click.'
}

const EFFECTS = catalogue.map(meta => ({
  ...meta,
  description: DESCRIPTIONS[meta.id] || '',
  defaultProps: meta.defaults
}))

export default EFFECTS
