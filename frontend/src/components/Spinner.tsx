const BRAND = '#E8472A'

if (typeof document !== 'undefined' && !document.getElementById('spin-style')) {
  const el = document.createElement('style')
  el.id = 'spin-style'
  el.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
  document.head.appendChild(el)
}

export default function Spinner({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: '3px solid #F3F4F6',
      borderTopColor: BRAND,
      animation: 'spin 0.8s linear infinite',
      margin: '0 auto',
      ...style,
    }} />
  )
}
