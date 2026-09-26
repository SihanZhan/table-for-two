import { useRef, useState } from 'react'
import { Restaurant } from '../api/client'
import { HeartIcon, XIcon } from './icons'

interface Props {
  restaurant: Restaurant
  onLike: () => void
  onPass: () => void
  disabled?: boolean
}

const BRAND = '#E8472A'
const SWIPE_THRESHOLD = 110
const ROTATION_DIVISOR = 18

export default function RestaurantCard({ restaurant, onLike, onPass, disabled }: Props) {
  const [dismissDir, setDismissDir] = useState<'left' | 'right' | null>(null)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const draggingRef = useRef(false)
  const startXRef = useRef(0)
  const stars = Math.round(restaurant.rating)

  async function fire(liked: boolean) {
    if (disabled || dismissDir) return
    setDismissDir(liked ? 'right' : 'left')
    await new Promise(r => setTimeout(r, 280))
    liked ? onLike() : onPass()
  }

  function onPointerDown(e: React.PointerEvent) {
    if (disabled || dismissDir) return
    draggingRef.current = true
    setIsDragging(true)
    startXRef.current = e.clientX
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return
    setDragX(e.clientX - startXRef.current)
  }

  function onPointerUp() {
    if (!draggingRef.current) return
    draggingRef.current = false
    setIsDragging(false)
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      fire(dragX > 0)
    } else {
      setDragX(0)
    }
  }

  const flyX = dismissDir === 'right' ? '115%' : dismissDir === 'left' ? '-115%' : `${dragX}px`
  const flyRot = dismissDir === 'right' ? '18deg' : dismissDir === 'left' ? '-18deg' : `${dragX / ROTATION_DIVISOR}deg`
  const likeOpacity = dismissDir === 'right' ? 1 : Math.max(0, Math.min(1, dragX / SWIPE_THRESHOLD))
  const nopeOpacity = dismissDir === 'left' ? 1 : Math.max(0, Math.min(1, -dragX / SWIPE_THRESHOLD))

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
        transform: `translateX(${flyX}) rotate(${flyRot})`,
        transition: isDragging ? 'none' : dismissDir ? 'transform 0.28s cubic-bezier(0.4,0,0.2,1)' : 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        userSelect: 'none',
        touchAction: 'pan-y',
        cursor: disabled || dismissDir ? 'default' : isDragging ? 'grabbing' : 'grab',
        position: 'relative',
      }}
    >
      {/* LIKE / NOPE drag stamps */}
      <div style={{
        position: 'absolute', top: 20, left: 20, zIndex: 2,
        padding: '6px 14px', borderRadius: 8, border: `3px solid ${BRAND}`,
        color: BRAND, fontWeight: 800, fontSize: '1.3rem', letterSpacing: '1px',
        transform: 'rotate(-14deg)', opacity: likeOpacity, pointerEvents: 'none',
        background: 'rgba(255,255,255,0.85)',
      }}>
        LIKE
      </div>
      <div style={{
        position: 'absolute', top: 20, right: 20, zIndex: 2,
        padding: '6px 14px', borderRadius: 8, border: '3px solid #9CA3AF',
        color: '#6B7280', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '1px',
        transform: 'rotate(14deg)', opacity: nopeOpacity, pointerEvents: 'none',
        background: 'rgba(255,255,255,0.85)',
      }}>
        NOPE
      </div>

      {/* Photo */}
      <div style={{ position: 'relative', height: 280 }}>
        {restaurant.image_url ? (
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', background: '#F0EDE8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '5rem', color: '#D1CBC3',
          }}>
            {restaurant.cuisine[0]}
          </div>
        )}

        {/* gradient overlay — name + price on top of photo */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '1rem 1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              {restaurant.name}
            </h2>
            <span style={{
              background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 8, padding: '2px 8px',
              fontSize: '0.8rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', marginLeft: 8,
            }}>
              {'$'.repeat(restaurant.price_range)}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
            {restaurant.cuisine} · {restaurant.neighborhood}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem 1.25rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem' }}>
          <span style={{ color: '#F4A300', fontSize: '0.9rem', letterSpacing: 1 }}>
            {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
          </span>
          <span style={{ fontSize: '0.82rem', color: '#888', fontWeight: 500 }}>
            {restaurant.rating.toFixed(1)}
          </span>
        </div>
        <p style={{
          margin: 0, fontSize: '0.9rem', color: '#4B4B4B', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {restaurant.description}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.65rem', padding: '1rem 1.25rem' }}>
        <button
          className="icon-btn"
          onClick={() => fire(false)}
          disabled={!!disabled || !!dismissDir}
          aria-label="Pass"
          style={{
            flex: 1, padding: '0.8rem', border: '2px solid #E8E3DC',
            borderRadius: 14, background: '#fff', fontSize: '1rem',
            fontWeight: 600, cursor: 'pointer', color: '#888',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <XIcon size={17} /> Pass
        </button>
        <button
          className="btn-primary"
          onClick={() => fire(true)}
          disabled={!!disabled || !!dismissDir}
          aria-label="Like"
          style={{
            flex: 1, padding: '0.8rem', border: 'none',
            borderRadius: 14, background: BRAND,
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <HeartIcon size={17} /> Like
        </button>
      </div>
    </div>
  )
}
