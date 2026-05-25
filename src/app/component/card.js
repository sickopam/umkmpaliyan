'use client'
import { useRouter } from 'next/navigation'

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = rating >= star
        const half = !filled && rating >= star - 0.5
        return (
          <svg key={star} width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <defs>
              <linearGradient id={`half-${star}`}>
                <stop offset="50%" stopColor="#f5a623" />
                <stop offset="50%" stopColor="#ddd" />
              </linearGradient>
            </defs>
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={filled ? '#f5a623' : half ? `url(#half-${star})` : '#ddd'}
            />
          </svg>
        )
      })}
    </div>
  )
}

export default function Card({ item, category }) {
  const router = useRouter()

  return (
    <div
      className={`biz-card ${category === "makanan" ? "makanan-card" : "kerajinan-card"}`}
      onClick={() => router.push(`/business/${item.id}`)}
    >
      <div className="biz-info">
        <h3>{item.name}</h3>
        <p>{item.city}</p>
      </div>

      <div className="biz-photos">
        {item.images && item.images.length > 0 ? (
          item.images.map((img, index) => (
            <div key={index} className="photo-square" style={{ overflow: 'hidden' }}>
              <img
                src={img}
                alt={`${item.name} preview ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))
        ) : (
          <>
            <div className="photo-square">📦</div>
            <div className="photo-square">📦</div>
            <div className="photo-square">📦</div>
          </>
        )}
      </div>

      <div className="biz-card-footer">
        <span className="price">{item.price_label ?? '–'}</span>
        <div className="rating-container">
          <StarRating rating={item.rating ?? 0} />
          <div className="rating-stats">
            {(item.rating ?? 0).toFixed(1)} <span className="review-count">({item.reviews ?? 0})</span>
          </div>
        </div>
      </div>
    </div>
  )
}