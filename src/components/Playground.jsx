import React, { useRef, useState, useEffect } from 'react'
import { getEffect } from '@yashvanth/cursorverse'
import { CursorEffect } from '@yashvanth/cursorverse/react'
import getSnippets from '../data/snippets'

function CodeBlock({ label, code }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1400)
    return () => clearTimeout(t)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
  }

  return (
    <div className="codeblock">
      <div className="codeblock-head">
        <strong>{label}</strong>
        <button className="btn btn-ghost" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <pre className="codebox">{code}</pre>
    </div>
  )
}

export default function Playground({ effect }) {
  const containerRef = useRef(null)
  const initial = (effect && effect.defaultProps) || { color: '#ff4500', size: 20, speed: 0.18 }
  const [color, setColor] = useState(initial.color)
  const [size, setSize] = useState(initial.size)
  const [speed, setSpeed] = useState(initial.speed)

  // switching effects re-seeds the controls with that effect's defaults
  useEffect(() => {
    setColor(initial.color)
    setSize(initial.size)
    setSpeed(initial.speed)
  }, [effect && effect.id])

  const meta = getEffect(effect.id)
  const snippets = getSnippets(effect.id, { color, size, speed })

  return (
    <div>
      <div className="preview" ref={containerRef}>
        <CursorEffect
          effect={effect.id}
          color={color}
          size={size}
          speed={speed}
          containerRef={containerRef}
        />

        {effect.id === 'magnetic' && (
          <div className="magnet-row">
            <button className="rv-magnet">Button</button>
            <button className="rv-magnet">Subscribe</button>
            <button className="rv-magnet">Say hi</button>
          </div>
        )}

        <span className="preview-hint">{meta.hint}</span>
      </div>

      <div className="controls">
        <label className="control">
          <span>Color</span>
          <input type="color" value={color} onChange={e => setColor(e.target.value)} />
        </label>
        <label className="control control-grow">
          <span>Size <em>{size}px</em></span>
          <input type="range" min="6" max="80" value={size} onChange={e => setSize(Number(e.target.value))} />
        </label>
        <label className="control control-grow">
          <span>{meta.trigger === 'click' ? 'Energy' : 'Speed'} <em>{speed.toFixed(2)}</em></span>
          <input type="range" min="0.02" max="0.8" step="0.01" value={speed} onChange={e => setSpeed(Number(e.target.value))} />
        </label>
        <button
          className="btn btn-ghost"
          onClick={() => { setColor(initial.color); setSize(initial.size); setSpeed(initial.speed) }}
        >
          Reset
        </button>
      </div>

      <CodeBlock label="Install & use" code={snippets.install} />
      <CodeBlock label="React" code={snippets.react} />
      <CodeBlock label="CSS" code={snippets.css} />
      <CodeBlock label="Vanilla JS — no dependency" code={snippets.js} />
    </div>
  )
}
