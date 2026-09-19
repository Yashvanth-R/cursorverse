import React from 'react'
import { useParams, Link } from 'react-router-dom'
import Playground from '../components/Playground'
import EFFECTS from '../data/effects'

export default function EffectPage() {
  const { id } = useParams()
  const effect = EFFECTS.find(e => e.id === id)

  if (!effect) {
    return (
      <div className="container">
        <h2>Effect not found</h2>
        <p className="lede">We couldn't find that effect.</p>
        <Link to="/" className="btn">Back to all effects</Link>
      </div>
    )
  }

  return (
    <div className="container">
      <Link to="/" className="btn btn-ghost" style={{ marginBottom: 16 }}>← All effects</Link>
      <h1>{effect.emoji} {effect.title}</h1>
      <p className="lede">{effect.description}</p>
      <Playground effect={effect} />
    </div>
  )
}
