import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import QRCode from '../components/QRCode'

interface CreatorState {
  sessionId: number
  joinCode: string
  participantId: number
  isCreator: boolean
}

export default function Join() {
  const location = useLocation()
  const creator = location.state as CreatorState | null
  const navigate = useNavigate()

  const [code, setCode] = useState(creator?.joinCode ?? '')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleJoin() {
    if (!code.trim() || !name.trim()) return
    setLoading(true)
    setError('')
    try {
      const p = await api.joinSession(code.trim(), name.trim())
      navigate(`/swipe/${p.id}`, { state: { sessionId: p.session_id } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join')
    } finally {
      setLoading(false)
    }
  }

  if (creator?.isCreator) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <h2 style={s.heading}>Share with your partner</h2>
          <p style={s.sub}>They can scan the QR code or type the code below.</p>
          <QRCode value={creator.joinCode} />
          <div style={s.codeBox}>{creator.joinCode}</div>
          <button style={s.primary} onClick={() =>
            navigate(`/swipe/${creator.participantId}`, { state: { sessionId: creator.sessionId } })
          }>
            I'll start swiping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.heading}>Join a session</h2>
        <input style={s.input} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        <input
          style={s.input} placeholder="Session code"
          value={code} onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
        />
        {error && <p style={s.error}>{error}</p>}
        <button style={s.primary} onClick={handleJoin} disabled={loading || !code.trim() || !name.trim()}>
          {loading ? 'Joining…' : 'Join'}
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
  card: {
    background: '#fff', borderRadius: '1rem', padding: '2rem',
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
    width: '100%', maxWidth: '360px', alignItems: 'center',
  },
  heading: { margin: 0, fontSize: '1.4rem', fontWeight: 700 },
  sub: { margin: 0, color: '#666', textAlign: 'center', fontSize: '0.9rem' },
  codeBox: {
    fontSize: '2rem', fontWeight: 700, letterSpacing: '0.3rem', color: '#e85d04',
    background: '#fff8f5', padding: '0.75rem 1.5rem', borderRadius: '0.5rem',
    border: '2px dashed #e85d04', width: '100%', textAlign: 'center',
  },
  input: {
    border: '1px solid #e0e0e0', borderRadius: '0.5rem',
    padding: '0.75rem 1rem', fontSize: '1rem', outline: 'none',
    width: '100%',
  },
  primary: {
    background: '#e85d04', color: '#fff', border: 'none',
    borderRadius: '0.5rem', padding: '0.85rem', fontSize: '1rem',
    fontWeight: 600, cursor: 'pointer', width: '100%',
  },
  error: { color: '#d00', margin: 0, fontSize: '0.85rem' },
}
