import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { api, Restaurant } from '../api/client'
import RestaurantCard from '../components/RestaurantCard'

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

  return (
    <div style={s.page}>
      <p style={s.progress}>{index + 1} / {restaurants.length}</p>
      <RestaurantCard
        restaurant={restaurants[index]}
        onLike={() => handleSwipe(true)}
        onPass={() => handleSwipe(false)}
        disabled={busy}
      />
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: '#fafaf8', padding: '1rem', gap: '1rem',
  },
  progress: { color: '#999', fontSize: '0.85rem', margin: 0 },
  center: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#666',
  },
}
