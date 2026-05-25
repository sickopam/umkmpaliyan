'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import client from '@/app/api/client'
import Form, { EMPTY_FORM, validateForm } from '@/app/component/form'

function Carousel({ images }) {
  const [current, setCurrent] = useState(0)
  const startX = useRef(null)

  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length)
  const next = () => setCurrent(c => (c + 1) % images.length)

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (startX.current === null) return
    const diff = startX.current - e.changedTouches[0].clientX
    if (diff > 40) next()
    else if (diff < -40) prev()
    startX.current = null
  }

  return (
    <div className="carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="carousel-track-wrapper">
        <div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {images.map((src, i) => (
            <div key={i} className="carousel-slide">
              <img src={src} alt={`slide ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <>
          <button className="carousel-btn prev" onClick={prev}>‹</button>
          <button className="carousel-btn next" onClick={next}>›</button>
          <div className="carousel-dots">
            {images.map((_, i) => (
              <button key={i} className={`carousel-dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function BusinessProfile() {
  const { id } = useParams()
  const router = useRouter()

  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [hasVoted, setHasVoted] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)

  useEffect(() => {
    async function fetchBusiness() {
      setLoading(true)
      const { data, error } = await client.from('umkm').select('*').eq('id', id).single()
      if (error) { console.error(error); setError('Gagal memuat data.') }
      else {
        setBusiness(data)
        setFormData({
          name: data.name,
          city: data.city,
          mapsUrl: data.maps_url ?? '',
          priceLabel: data.price_label ?? '',
          images: data.images?.length === 3 ? data.images : ['', '', ''],
          whatsapp: data.whatsapp ?? '',
        })
      }
      setLoading(false)
    }
    fetchBusiness()
    if (localStorage.getItem(`voted_${id}`)) setHasVoted(true)
  }, [id])

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validateForm(formData)
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return }

    setSaving(true)
    setError(null)
    setFieldErrors({})

    const payload = {
      name: formData.name,
      city: formData.city,
      maps_url: formData.mapsUrl,
      price_label: formData.priceLabel,
      images: formData.images,
      whatsapp: formData.whatsapp,
    }

    const { error } = await client.from('umkm').update(payload).eq('id', id)
    if (error) { console.error(error); setError('Gagal menyimpan perubahan.') }
    else { setBusiness(prev => ({ ...prev, ...payload })); setIsEditOpen(false) }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Hapus UMKM ini? Tindakan ini tidak bisa dibatalkan.')) return
    const { error } = await client.from('umkm').delete().eq('id', id)
    if (error) { console.error(error); setError('Gagal menghapus.') }
    else router.back()
  }

  const handleRate = async (star) => {
    if (hasVoted) return
    setUserRating(star)
    const newReviews = (business.reviews || 0) + 1
    const newRating = (((business.rating || 0) * (business.reviews || 0)) + star) / newReviews
    const rounded = Math.round(newRating * 10) / 10
    const { error } = await client.from('umkm').update({ rating: rounded, reviews: newReviews }).eq('id', id)
    if (!error) {
      setBusiness(prev => ({ ...prev, rating: rounded, reviews: newReviews }))
      setHasVoted(true)
      localStorage.setItem(`voted_${id}`, 'true')
    }
  }

  if (loading) return <div className="loading-indicator">Memuat data...</div>
  if (!business) return <div className="loading-indicator">UMKM tidak ditemukan.</div>

  const images = business.images ?? []

  return (
    <div className="profile-container">
      <header className="catalog-header">
        <button onClick={() => router.back()} className="back-button large">←<span className="btn-label"> Kembali</span></button>
        <div className="header-actions">
          <button className="edit-btn" onClick={() => { setFieldErrors({}); setError(null); setIsEditOpen(true) }}>✏️<span className="btn-label"> Edit</span></button>
          <button className="delete-btn" onClick={handleDelete}>🗑️<span className="btn-label"> Hapus</span></button>
        </div>
      </header>

      {error && <p className="error-banner">{error}</p>}

      <main className="profile-content">
        <section className="profile-hero">
          <h1 className="catalog-title large">{business.name}</h1>
          <p className="profile-subtitle">{business.city}</p>
        </section>

        {/* Desktop grid */}
        <div className="profile-photo-grid">
          {images.map((src, i) => (
            <div key={i} className="photo-square" style={{ overflow: 'hidden' }}>
              <img src={src} alt={`${business.name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
            </div>
          ))}
        </div>

        {/* Mobile carousel */}
        {images.length > 0 && <Carousel images={images} />}

        <section className="profile-details">
          <div className="detail-card">
            <h3>Tentang Kami</h3>
            <p style={{ color: '#424245', lineHeight: '1.5', marginBottom: '20px' }}>
              {business.description || `Selamat datang di ${business.name}. Kami menyediakan produk berkualitas terbaik di ${business.city}.`}
            </p>
            <div style={{ background: 'rgba(0,0,0,0.05)', padding: '15px', borderRadius: '12px', display: 'inline-block' }}>
              <span style={{ fontWeight: '600' }}>Rentang Harga:</span>{' '}
              {business.price_label ?? '–'}
            </div>
          </div>

          <div className="detail-card">
            <h3>Rating</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px', fontWeight: '700' }}>{business.rating?.toFixed(1)}</span>
              <span style={{ color: '#888' }}>/ 5.0 ({business.reviews} ulasan)</span>
            </div>
            {hasVoted ? (
              <p style={{ color: '#888', fontSize: '14px' }}>Anda sudah memberi rating. Terima kasih! ⭐ {userRating}/5</p>
            ) : (
              <>
                <p style={{ marginBottom: '8px', fontSize: '14px', color: '#555' }}>Beri rating untuk UMKM ini:</p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer',
                        color: star <= (hoverRating || userRating) ? '#f5a623' : '#ccc',
                        transition: 'color 0.15s'
                      }}
                    >★</button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="detail-card">
            <h3>Lokasi & Kontak</h3>
            <p style={{ color: '#424245', marginBottom: '10px' }}>📍 {business.city}, Paliyan</p>
            <p style={{ color: '#424245', marginBottom: '16px' }}>☎️ {business.whatsapp}</p>
            {business.maps_url && (
              <a href={business.maps_url} target="_blank" rel="noopener noreferrer" className="maps-btn" style={{ display: 'inline-block', marginBottom: '10px' }}>
                📍 Buka di Google Maps
              </a>
            )}
            <button className="wa-button" onClick={() => window.open(`https://wa.me/${business.whatsapp}`)}>
              💬 Hubungi via WhatsApp
            </button>
          </div>
        </section>
      </main>

      {isEditOpen && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="detail-card modal-content" onClick={e => e.stopPropagation()}>
            <h3>Edit UMKM</h3>
            <Form
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
              setFieldErrors={setFieldErrors}
              onSubmit={handleSave}
              saving={saving}
              error={error}
              mode="edit"
            />
          </div>
        </div>
      )}
    </div>
  )
}