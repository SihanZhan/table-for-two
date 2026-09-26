import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { ForkKnifeIcon } from '../components/icons'

const BRAND = '#E8472A'
const CUISINES = [
  'American', 'Italian', 'Mexican', 'Japanese', 'Chinese',
  'Thai', 'Indian', 'Mediterranean', 'French', 'Korean',
  'Vietnamese', 'Greek',
]
const RADIUS_OPTIONS = [
  { label: '1 mile', meters: 1609 },
  { label: '2 miles', meters: 3219 },
  { label: '5 miles', meters: 8047 },
  { label: '10 miles', meters: 16093 },
]

export default function Home() {
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [cuisine, setCuisine] = useState('')
  const [minRating, setMinRating] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [radius, setRadius] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleCreate() {
    if (!name.trim() || !city.trim()) return
    setLoading(true)
    setError('')
    try {
      const session = await api.createSession(name.trim(), city.trim(), {
        cuisine: cuisine || undefined,
        min_rating: minRating ? Number(minRating) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        radius: radius ? Number(radius) : undefined,
      })
      navigate('/join', {
        state: {
          sessionId: session.id,
          joinCode: session.join_code,
          participantId: session.participant_id,
          location: session.location,
          isCreator: true,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.pill}><ForkKnifeIcon size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Restaurant matching for two</div>
        <h1 style={s.title}>Stop debating.<br />Start eating.</h1>
        <p style={s.sub}>
          Each of you swipes privately. We surface the places<br />you both said yes to.
        </p>
      </div>

      <div style={s.card}>
        <label style={s.label}>Your name</label>
        <input
          style={s.input}
          placeholder="e.g. Alex"
          value={name}
          autoFocus
          onChange={e => setName(e.target.value)}
        />
        <label style={s.label}>City</label>
        <input
          style={s.input}
          placeholder="e.g. Boston, MA"
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />

        <button type="button" className="filters-toggle" style={s.filtersToggle} onClick={() => setShowFilters(v => !v)}>
          {showFilters ? 'Hide filters' : 'Filters (optional)'}
        </button>

        {showFilters && (
          <div style={s.filtersGrid}>
            <div>
              <label style={s.label}>Cuisine</label>
              <select style={s.select} value={cuisine} onChange={e => setCuisine(e.target.value)}>
                <option value="">Any</option>
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Min rating</label>
              <select style={s.select} value={minRating} onChange={e => setMinRating(e.target.value)}>
                <option value="">Any</option>
                <option value="3">3.0+</option>
                <option value="3.5">3.5+</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Max price</label>
              <select style={s.select} value={maxPrice} onChange={e => setMaxPrice(e.target.value)}>
                <option value="">Any</option>
                <option value="1">$</option>
                <option value="2">$$</option>
                <option value="3">$$$</option>
                <option value="4">$$$$</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Distance</label>
              <select style={s.select} value={radius} onChange={e => setRadius(e.target.value)}>
                <option value="">Any</option>
                {RADIUS_OPTIONS.map(r => <option key={r.meters} value={r.meters}>{r.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {error && <p style={s.error}>{error}</p>}
        <button
          className="btn-primary"
          style={{ ...s.btn, opacity: !name.trim() || !city.trim() || loading ? 0.5 : 1 }}
          onClick={handleCreate}
          disabled={loading || !name.trim() || !city.trim()}
        >
          {loading ? 'Finding restaurants…' : 'Create a session →'}
        </button>
        <div style={s.divider}><span>or</span></div>
        <button className="btn-ghost" style={s.ghost} onClick={() => navigate('/join')}>
          Join with a code
        </button>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: '#FAF8F5', padding: '2rem 1rem', gap: '2rem',
  },
  hero: { textAlign: 'center', maxWidth: 420 },
  pill: {
    display: 'inline-block', background: '#FFF0ED', color: BRAND,
    fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.3px',
    padding: '6px 14px', borderRadius: 999, marginBottom: '1rem',
  },
  title: {
    margin: '0 0 0.75rem', fontSize: '2.6rem', fontWeight: 800,
    color: '#1C1C1E', lineHeight: 1.15, letterSpacing: '-0.5px',
  },
  sub: { margin: 0, color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.6 },
  card: {
    background: '#fff', borderRadius: 20, padding: '1.75rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', gap: '0.6rem',
    width: '100%', maxWidth: 380,
  },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 2 },
  input: {
    border: '1.5px solid #E5E7EB', borderRadius: 12,
    padding: '0.85rem 1rem', fontSize: '1rem', outline: 'none',
    transition: 'border-color 0.15s',
    color: '#1C1C1E',
  },
  filtersToggle: {
    background: 'transparent', border: 'none', color: BRAND,
    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
    padding: '0.35rem 0', textAlign: 'left', alignSelf: 'flex-start',
  },
  filtersGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem',
    marginBottom: '0.2rem',
  },
  select: {
    border: '1.5px solid #E5E7EB', borderRadius: 12,
    padding: '0.7rem 0.8rem', fontSize: '0.9rem', outline: 'none',
    color: '#1C1C1E', background: '#fff', width: '100%',
  },
  btn: {
    background: BRAND, color: '#fff', border: 'none',
    borderRadius: 12, padding: '0.9rem', fontSize: '0.95rem',
    fontWeight: 700, cursor: 'pointer', marginTop: 4,
    transition: 'opacity 0.15s',
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: 12, color: '#D1D5DB',
    fontSize: '0.8rem',
  },
  ghost: {
    background: 'transparent', color: '#6B7280',
    border: '1.5px solid #E5E7EB',
    borderRadius: 12, padding: '0.85rem', fontSize: '0.95rem',
    fontWeight: 600, cursor: 'pointer',
  },
  error: { margin: 0, color: '#DC2626', fontSize: '0.82rem' },
}
