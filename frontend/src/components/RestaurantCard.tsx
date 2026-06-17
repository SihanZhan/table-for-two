import { Restaurant } from '../api/client'

interface Props {
  restaurant: Restaurant
  onLike: () => void
  onPass: () => void
  disabled?: boolean
}

export default function RestaurantCard({ restaurant, onLike, onPass, disabled }: Props) {
  const stars = Math.round(restaurant.rating)

  return (
    <div style={s.card}>
      {restaurant.image_url ? (
        <img src={restaurant.image_url} alt={restaurant.name} style={s.img} />
      ) : (
        <div style={s.placeholder}>{restaurant.cuisine[0]}</div>
      )}
      <div style={s.body}>
        <div style={s.row}>
          <h2 style={s.name}>{restaurant.name}</h2>
          <span style={s.price}>{'$'.repeat(restaurant.price_range)}</span>
        </div>
        <p style={s.meta}>{restaurant.cuisine} · {restaurant.neighborhood}</p>
        <p style={s.stars}>
          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
          <span style={s.ratingNum}>{restaurant.rating.toFixed(1)}</span>
        </p>
        <p style={s.desc}>{restaurant.description}</p>
      </div>
      <div style={s.actions}>
        <button style={s.passBtn} onClick={onPass} disabled={disabled}>Pass</button>
        <button style={s.likeBtn} onClick={onLike} disabled={disabled}>Like</button>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff', borderRadius: '1.25rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    overflow: 'hidden', width: '100%', maxWidth: '400px',
  },
  img: { width: '100%', height: '240px', objectFit: 'cover', display: 'block' },
  placeholder: {
    width: '100%', height: '240px', background: '#f0ede8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '5rem', color: '#ccc',
  },
  body: { padding: '1rem 1.25rem 0' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#1a1a1a' },
  price: { color: '#e85d04', fontWeight: 700 },
  meta: { color: '#888', margin: '0.2rem 0', fontSize: '0.85rem' },
  stars: { color: '#f4a300', margin: '0 0 0.5rem' },
  ratingNum: { color: '#666', fontSize: '0.8rem', marginLeft: '0.4rem' },
  desc: { color: '#444', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.5rem' },
  actions: { display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem' },
  passBtn: {
    flex: 1, padding: '0.85rem', border: '2px solid #e0e0e0',
    borderRadius: '0.75rem', background: '#fff', fontSize: '1rem',
    fontWeight: 600, cursor: 'pointer', color: '#666',
  },
  likeBtn: {
    flex: 1, padding: '0.85rem', border: 'none',
    borderRadius: '0.75rem', background: '#e85d04',
    color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
  },
}
