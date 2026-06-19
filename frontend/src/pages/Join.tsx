import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import QRCode from '../components/QRCode'

const BRAND = '#E8472A'

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
          <div style={s.iconRow}>🔗</div>
          <h2 style={s.heading}>Share with your partner</h2>
          <p style={s.sub}>Scan the QR code or share the code below.</p>

          <div style={s.qrWrap}>
            <QRCode value={creator.joinCode} />
          </div>

          <div style={s.codeRow}>
            {creator.joinCode.split('').map((ch, i) => (
              <span key={i} style={s.codeLetter}>{ch}</span>
            ))}
          </div>

          <button
            style={s.btn}
            onClick={() => navigate(`/swipe/${creator.participantId}`, { state: { sessionId: creator.sessionId } })}
          >
            I'll start swiping →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.iconRow}>👋</div>
        <h2 style={s.heading}>Join a session</h2>
        <p style={s.sub}>Enter your name and the code your partner shared.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
          <input
            style={s.input} placeholder="Your name"
            value={name} autoFocus
            onChange={e => setName(e.target.value)}
          />
          <input
            style={{ ...s.input, textTransform: 'uppercase', letterSpacing: '0.25rem', fontWeight: 700 }}
            placeholder="SESSION CODE"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
        </div>

        {error && <p style={s.error}>{error}</p>}

        <button
          style={{ ...s.btn, opacity: !code.trim() || !name.trim() || loading ? 0.5 : 1 }}
          onClick={handleJoin}
          disabled={loading || !code.trim() || !name.trim()}
        >
          {loading ? 'Joining…' : 'Join session →'}
        </button>

        <button style={s.back} onClick={() => navigate('/')}>← Back</button>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: '#FAF8F5', padding: '2rem 1rem',
  },
  card: {
    background: '#fff', borderRadius: 20, padding: '2rem 1.75rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
    width: '100%', maxWidth: 380, alignItems: 'center',
  },
  iconRow: { fontSize: '2rem', lineHeight: 1 },
  heading: { margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#1C1C1E', letterSpacing: '-0.3px' },
  sub: { margin: 0, color: '#6B7280', fontSize: '0.875rem', textAlign: 'center', lineHeight: 1.5 },
  qrWrap: { padding: '0.5rem 0' },
  codeRow: { display: 'flex', gap: 8 },
  codeLetter: {
    width: 40, height: 48,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#FFF0ED', borderRadius: 10,
    fontSize: '1.4rem', fontWeight: 800, color: BRAND, letterSpacing: 0,
  },
  input: {
    width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 12,
    padding: '0.85rem 1rem', fontSize: '1rem', outline: 'none', color: '#1C1C1E',
  },
  btn: {
    width: '100%', background: BRAND, color: '#fff', border: 'none',
    borderRadius: 12, padding: '0.9rem', fontSize: '0.95rem',
    fontWeight: 700, cursor: 'pointer', marginTop: 4,
  },
  back: {
    background: 'none', border: 'none', color: '#9CA3AF',
    fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500,
  },
  error: { color: '#DC2626', margin: 0, fontSize: '0.85rem' },
}
