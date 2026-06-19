import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { api, Restaurant } from '../api/client'
import RestaurantCard from '../components/RestaurantCard'

const STACK_DEPTH = 3

export default function Swipe() {
  const { participantId } = useParams<{ participantId: string }>()
  const sessionId = (useLocation().state as { sessionId: number } | null)?.sessionId
  const navigate = useNavigate()

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!participantId) return
    api.getRestaurants(Number(participantId)).then(r => {
      setRestaurants(r)
      setLoading(false)
    })
  }, [participantId])

  async function handleSwipe(liked: boolean) {
    if (busy) return
    setBusy(true)
    // card animation plays inside RestaurantCard (280ms), then this fires
    await api.recordSwipe(Number(participantId), restaurants[index].id, liked)
    if (index + 1 >= restaurants.length) {
      await api.finishSwiping(Number(participantId))
      navigate(`/results/${sessionId}`)
    } else {
      setIndex(i => i + 1)
      setBusy(false)
    }
  }

  if (loading) return <div style={s.center}>Loading restaurants…</div>
  if (!restaurants.length) return <div style={s.center}>No restaurants found.</div>

  // Visible stack: [back … front], rendered back-first so front paints on top
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

      {/* Card stack */}
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
}
