import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const BRAND = '#E8472A'

export default function Home() {
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleCreate() {
    if (!name.trim() || !city.trim()) return
    setLoading(true)
    setError('')
    try {
      const session = await api.createSession(name.trim(), city.trim())
      navigate('/join', {
        state: {
          sessionId: session.id,
          joinCode: session.join_code,
          participantId: session.participant_id,
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
        <div style={s.pill}>🍽 Restaurant matching for two</div>
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
        {error && <p style={s.error}>{error}</p>}
        <button
          style={{ ...s.btn, opacity: !name.trim() || !city.trim() || loading ? 0.5 : 1 }}
          onClick={handleCreate}
          disabled={loading || !name.trim() || !city.trim()}
        >
          {loading ? 'Finding restaurants…' : 'Create a session →'}
        </button>
        <div style={s.divider}><span>or</span></div>
        <button style={s.ghost} onClick={() => navigate('/join')}>
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
