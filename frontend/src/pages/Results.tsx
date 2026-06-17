import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, Match } from '../api/client'

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [matches, setMatches] = useState<Match[]>([])
  const [bothFinished, setBothFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!sessionId) return

    async function fetch() {
      const data = await api.getMatches(Number(sessionId))
      setBothFinished(data.both_finished)
      setMatches(data.matches)
      setLoading(false)
      if (data.both_finished && intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    fetch()
    intervalRef.current = setInterval(fetch, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [sessionId])

  if (loading) return <div style={s.center}>Loading…</div>

  if (!bothFinished) {
    return (
      <div style={s.center}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Waiting for your partner…</p>
          <p style={{ color: '#999' }}>Matches reveal when you're both done.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Your Matches</h1>
      {matches.length === 0 ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#666' }}>No matches this time — try again with a fresh session.</p>
          <button style={s.btn} onClick={() => navigate('/')}>Start over</button>
        </div>
      ) : (
        <div style={s.list}>
          {matches.map(m => (
            <div key={m.restaurant.id} style={s.card}>
              {m.restaurant.image_url && (
                <img src={m.restaurant.image_url} alt={m.restaurant.name} style={s.img} />
              )}
              <div style={s.body}>
                <div style={s.row}>
                  <h2 style={s.name}>{m.restaurant.name}</h2>
                  <span style={s.price}>{'$'.repeat(m.restaurant.price_range)}</span>
                </div>
                <p style={s.meta}>
                  {m.restaurant.cuisine} · {m.restaurant.neighborhood} · {m.restaurant.rating}/5
                </p>
                <p style={s.explanation}>{m.explanation}</p>
              </div>
            </div>
          ))}
          <button style={s.btn} onClick={() => navigate('/')}>Start over</button>
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', background: '#fafaf8',
    padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  heading: { fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '480px' },
  card: {
    background: '#fff', borderRadius: '1rem',
    overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  },
  img: { width: '100%', height: '200px', objectFit: 'cover', display: 'block' },
  body: { padding: '1rem' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  name: { margin: 0, fontSize: '1.2rem', fontWeight: 700 },
  price: { color: '#e85d04', fontWeight: 600 },
  meta: { color: '#888', margin: '0.25rem 0 0.75rem', fontSize: '0.85rem' },
  explanation: { margin: 0, lineHeight: 1.6, color: '#333' },
  btn: {
    background: '#e85d04', color: '#fff', border: 'none',
    borderRadius: '0.5rem', padding: '0.85rem 2rem',
    fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '1rem',
  },
  center: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
}
