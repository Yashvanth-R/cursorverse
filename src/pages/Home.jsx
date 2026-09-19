import React, { useMemo, useState } from 'react'
import EffectCard from '../components/EffectCard'
import EFFECTS from '../data/effects'

export default function Home() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const categories = useMemo(() => ['All', ...Array.from(new Set(EFFECTS.map(e => e.category)))], [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return EFFECTS.filter(e => {
      if (category !== 'All' && e.category !== category) return false
      if (!q) return true
      return e.title.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q)
    })
  }, [query, category])

  return (
    <div className="container">
      <h1>Make your website move.</h1>
      <p className="lede">Twelve cursor effects. Hover a card to run it, open one to tune it and copy the code.</p>

      <div style={{ margin: '12px 0' }}>
        <input
          className="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search cursor effects..."
        />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '14px 0 20px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={'chip' + (cat === category ? ' is-active' : '')}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid">
        {filtered.map(e => <EffectCard key={e.id} effect={e} />)}
      </div>

      {filtered.length === 0 && <p className="lede">Nothing matches “{query}”.</p>}
    </div>
  )
}
