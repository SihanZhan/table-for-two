import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function Home() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    try {
      const session = await api.createSession(name.trim())
      navigate('/join', {
        state: {
          sessionId: session.id,
          joinCode: session.join_code,
          participantId: session.participant_id,
          isCreator: true,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>Table for Two</h1>
      <p style={s.subtitle}>Find a restaurant you both love.</p>
      <div style={s.card}>
        <input
          style={s.input}
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <button style={s.primary} onClick={handleCreate} disabled={loading || !name.trim()}>
          {loading ? 'Creating…' : 'Start a session'}
        </button>
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
    background: '#fafaf8', padding: '1rem',
  },
  title: { fontSize: '2.5rem', fontWeight: 700, margin: 0, color: '#1a1a1a' },
  subtitle: { color: '#666', marginTop: '0.5rem', marginBottom: '2rem' },
  card: {
    background: '#fff', borderRadius: '1rem', padding: '2rem',
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
    width: '100%', maxWidth: '360px',
  },
  input: {
    border: '1px solid #e0e0e0', borderRadius: '0.5rem',
    padding: '0.75rem 1rem', fontSize: '1rem', outline: 'none',
  },
  primary: {
    background: '#e85d04', color: '#fff', border: 'none',
    borderRadius: '0.5rem', padding: '0.85rem', fontSize: '1rem',
    fontWeight: 600, cursor: 'pointer',
  },
  ghost: {
    background: 'transparent', color: '#e85d04', border: '1px solid #e85d04',
    borderRadius: '0.5rem', padding: '0.85rem', fontSize: '1rem',
    fontWeight: 600, cursor: 'pointer',
  },
}
