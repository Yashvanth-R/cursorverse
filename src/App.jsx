import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import EffectPage from './pages/EffectPage'

export default function App() {
  return (
    <div className="app-root">
      <header className="site-header">
        <Link to="/" className="brand">CURSORVERSE</Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/effect/:id" element={<EffectPage />} />
        </Routes>
      </main>
    </div>
  )
}
