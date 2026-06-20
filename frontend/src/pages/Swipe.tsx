import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { api, Restaurant } from '../api/client'
import RestaurantCard from '../components/RestaurantCard'

const STACK_DEPTH = 3
const BRAND = '#E8472A'

export default function Swipe() {
  const { participantId } = useParams<{ participantId: string }>()
  const sessionId = (useLocation().state as { sessionId: number } | null)?.sessionId
  const navigate = useNavigate()

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!participantId) return
    api.getRestaurants(Number(participantId))
      .then(r => setRestaurants(r))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load restaurants'))
      .finally(() => setLoading(false))
  }, [participantId])

  async function handleSwipe(liked: boolean) {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await api.recordSwipe(Number(participantId), restaurants[index].id, liked)
      if (index + 1 >= restaurants.length) {
        await api.finishSwiping(Number(participantId))
        navigate(`/results/${sessionId}`)
      } else {
        setIndex(i => i + 1)
        setBusy(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again')
      setBusy(false)
    }
  }

  if (loading) return <div style={s.center}>Loading restaurants…</div>

  if (error && restaurants.length === 0) {
    return (
      <div style={s.center}>
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
          <p style={{ color: '#DC2626', fontWeight: 600, margin: '0 0 1rem' }}>{error}</p>
          <button style={s.retryBtn} onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  if (!restaurants.length) return <div style={s.center}>No restaurants found.</div>

  const stackOffsets = Array.from(
    { length: Math.min(STACK_DEPTH, restaurants.length - index) },
    (_, i) => i,
  ).reverse()

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={s.logo}>Table for Two</span>
        <span style={s.progress}>{index + 1} / {restaurants.length}</span>
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 400, height: 560 }}>
        {stackOffsets.map(offset => {
          const scale = 1 - offset * 0.04
          const translateY = offset * 14
          const isActive = offset === 0

          return (
            <div
              key={restaurants[index + offset]?.id ?? `ghost-${offset}`}
              style={{
                position: 'absolute', inset: 0,
                transform: `scale(${scale}) translateY(-${translateY}px)`,
                transition: 'transform 0.2s ease',
                zIndex: STACK_DEPTH - offset,
              }}
            >
              {isActive ? (
                <RestaurantCard
                  restaurant={restaurants[index]}
                  onLike={() => handleSwipe(true)}
                  onPass={() => handleSwipe(false)}
                  disabled={busy}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  borderRadius: 24, background: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <p style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 500 }}>
          {error}
        </p>
      )}

      <p style={s.hint}>Swipe or tap to decide</p>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', background: '#FAF8F5',
    padding: '1rem 1rem 2rem',
  },
  header: {
    width: '100%', maxWidth: 400,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.75rem 0 1.5rem',
  },
  logo: { fontSize: '1rem', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.3px' },
  progress: { fontSize: '0.82rem', color: '#9CA3AF', fontWeight: 500 },
  hint: { marginTop: '1.25rem', fontSize: '0.78rem', color: '#C4BAB1', fontWeight: 500 },
  center: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#9CA3AF',
  },
  retryBtn: {
    background: BRAND, color: '#fff', border: 'none',
    borderRadius: 12, padding: '0.75rem 2rem',
    fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
  },
}
