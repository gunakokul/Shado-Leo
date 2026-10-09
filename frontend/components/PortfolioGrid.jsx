import { useState, useEffect } from 'react'
import Lightbox from './Lightbox'

export default function PortfolioGrid() {
  const [items, setItems] = useState([])
  const [active, setActive] = useState(null)

  useEffect(() => {
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/gallery')
      .then(r => r.json())
      .then(setItems)
  }, [])

  return (
    <div>
      <div style={{columnCount: 3, columnGap: '1rem'}}>
        {items.map(it => (
          <div key={it.id} style={{breakInside: 'avoid', marginBottom: '1rem'}}>
            <img src={it.thumbnailUrl} alt={it.title} className="w-full rounded" onClick={() => setActive(it)} />
          </div>
        ))}
      </div>
      {active && <Lightbox item={active} onClose={() => setActive(null)} />}
    </div>
  )
}
