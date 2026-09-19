import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CursorEffect } from '@yashvanth/cursorverse/react'

/** Card with a live miniature of the real effect — it only runs while hovered. */
export default function EffectCard({ effect }) {
  const stageRef = useRef(null)
  const [live, setLive] = useState(false)
  const props = effect.defaultProps || {}

  return (
    <div
      className="card"
      onMouseEnter={() => setLive(true)}
      onMouseLeave={() => setLive(false)}
    >
      <div className="card-stage" ref={stageRef}>
        {live ? (
          <CursorEffect
            effect={effect.id}
            color={props.color}
            size={Math.max(8, Math.round((props.size || 20) * 0.7))}
            speed={props.speed}
            containerRef={stageRef}
          />
        ) : (
          <span className="card-stage-emoji">{effect.emoji}</span>
        )}
        {live && effect.id === 'magnetic' && (
          <div className="magnet-row magnet-row-mini">
            <button className="rv-magnet">Hi</button>
          </div>
        )}
      </div>

      <div className="card-body">
        <h4>{effect.title}</h4>
        <p>{effect.description}</p>
        <div className="card-foot">
          <span className="tag">{effect.trigger === 'click' ? 'On click' : 'On move'}</span>
          <Link to={`/effect/${effect.id}`} className="btn">Open</Link>
        </div>
      </div>
    </div>
  )
}
