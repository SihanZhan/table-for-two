import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, Match } from '../api/client'

const BRAND = '#E8472A'

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [matches, setMatches] = useState<Match[]>([])
  const [bothFinished, setBothFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!sessionId) return

    async function poll() {
      const data = await api.getMatches(Number(sessionId))
      setBothFinished(data.both_finished)
      setMatches(data.matches)
      setLoading(false)
      if (data.both_finished && intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    poll()
    intervalRef.current = setInterval(poll, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [sessionId])

  if (loading) return <div style={s.center}><Spinner /></div>

  if (!bothFinished) {
    return (
      <div style={s.center}>
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2 style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#1C1C1E' }}>
            Waiting for your partner…
          </h2>
          <p style={{ margin: 0, color: '#9CA3AF', lineHeight: 1.6 }}>
            Matches reveal when you're both done swiping.
          </p>
          <Spinner style={{ marginTop: '1.5rem' }} />
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div style={s.center}>
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😬</div>
          <h2 style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#1C1C1E' }}>No matches this time</h2>
          <p style={{ margin: '0 0 1.5rem', color: '#9CA3AF', lineHeight: 1.6 }}>
            Looks like you two have very different tastes — or you both passed on everything. Try again!
          </p>
          <button style={s.btn} onClick={() => navigate('/')}>Start a new session</button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={{ fontSize: '2.5rem' }}>🎉</div>
        <h1 style={s.title}>You both said yes!</h1>
        <p style={s.sub}>
          {matches.length === 1
            ? 'One spot you're both into.'
            : `${matches.length} places you're both into.`}
        </p>
      </div>

      <div style={s.list}>
        {matches.map(m => (
          <MatchCard key={m.restaurant.id} match={m} />
        ))}
      </div>

      <button style={s.btn} onClick={() => navigate('/')}>Start a new session</button>
    </div>
  )
}

function MatchCard({ match: m }: { match: Match }) {
  return (
    <div style={mc.card}>
      {m.restaurant.image_url && (
        <div style={{ position: 'relative', height: 180 }}>
          <img src={m.restaurant.image_url} alt={m.restaurant.name} style={mc.img} />
          <div style={mc.imgOverlay} />
        </div>
      )}
      <div style={mc.body}>
        <div style={mc.topRow}>
          <h2 style={mc.name}>{m.restaurant.name}</h2>
          <span style={mc.price}>{'$'.repeat(m.restaurant.price_range)}</span>
        </div>
        <p style={mc.meta}>
          {m.restaurant.cuisine} · {m.restaurant.neighborhood} · ★ {m.restaurant.rating}
        </p>
        <div style={mc.explanationBox}>
          <p style={mc.explanation}>{m.explanation}</p>
        </div>
      </div>
    </div>
  )
}

function Spinner({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      border: `3px solid #F3F4F6`,
      borderTopColor: BRAND,
      animation: 'spin 0.8s linear infinite',
      margin: '0 auto',
      ...style,
    }} />
  )
}

// inject spin keyframe once
if (typeof document !== 'undefined' && !document.getElementById('spin-style')) {
  const el = document.createElement('style')
  el.id = 'spin-style'
  el.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
  document.head.appendChild(el)
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', background: '#FAF8F5',
    padding: '2.5rem 1rem 3rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  header: { textAlign: 'center', marginBottom: '2rem', maxWidth: 400 },
  title: { margin: '0.5rem 0 0.4rem', fontSize: '2rem', fontWeight: 800, color: '#1C1C1E', letterSpacing: '-0.4px' },
  sub: { margin: 0, color: '#6B7280', fontSize: '0.95rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: 480 },
  btn: {
    marginTop: '2rem', background: BRAND, color: '#fff', border: 'none',
    borderRadius: 14, padding: '0.9rem 2rem',
    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
  },
  center: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: '2rem',
  },
}

const mc: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff', borderRadius: 20,
    overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  imgOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)',
  },
  body: { padding: '1.1rem 1.25rem' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  name: { margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1C1C1E' },
  price: { color: BRAND, fontWeight: 700, fontSize: '0.95rem' },
  meta: { margin: '0 0 0.75rem', color: '#9CA3AF', fontSize: '0.8rem', fontWeight: 500 },
  explanationBox: {
    background: '#FFF8F6', borderLeft: `3px solid ${BRAND}`,
    borderRadius: '0 8px 8px 0', padding: '0.65rem 0.85rem',
  },
  explanation: { margin: 0, lineHeight: 1.65, color: '#374151', fontSize: '0.9rem' },
}
