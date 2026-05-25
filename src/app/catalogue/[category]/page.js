'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Card from '@/app/component/card'
import client from '@/app/api/client'
import Form, { EMPTY_FORM, validateForm } from '@/app/component/form'

export default function Catalogue() {
  const { category } = useParams()
  const router = useRouter()

  const [items, setItems] = useState([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(6)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => { fetchItems() }, [category])

  async function fetchItems() {
    setLoading(true)
    setError(null)
    const { data, error } = await client
      .from('umkm')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) { console.error('Fetch error:', error); setError('Gagal memuat data.') }
    else setItems(data)
    setLoading(false)
  }

  const openAddModal = () => {
    setFormData(EMPTY_FORM)
    setFieldErrors({})
    setError(null)
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validateForm(formData)
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return }

    setSaving(true)
    setError(null)
    setFieldErrors({})

    const { data, error } = await client
      .from('umkm')
      .insert([{
        name: formData.name,
        city: formData.city,
        maps_url: formData.mapsUrl,
        price_label: formData.priceLabel,
        images: formData.images,
        whatsapp: formData.whatsapp,
        category,
        rating: 0.0,
        reviews: 0,
      }])
      .select()
      .single()

    if (error) { console.error('Insert error:', error); setError('Gagal menambah UMKM.') }
    else { setItems(prev => [data, ...prev]); setIsModalOpen(false) }

    setSaving(false)
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )
  const displayedItems = filteredItems.slice(0, visibleCount)

  return (
    <div className={`catalog-view ${category}`}>
      <header className="catalog-header">
        <div className="header-left">
          <button onClick={() => router.back()} className="back-button large">
            <span>←</span><span className="btn-label"> Kembali</span>
          </button>
        </div>

        <h1 className="header-center large">
          {category === 'makanan' ? 'Makanan & Minuman' : 'Kerajinan Tangan'}
        </h1>

        <div className="header-right">
          <div className="search-wrapper">
            <button className="search-toggle large" onClick={() => {
              if (isSearchOpen) { setSearch(''); setVisibleCount(6) }
              setIsSearchOpen(!isSearchOpen)
            }}>
              {isSearchOpen ? '✕' : '🔍'}
            </button>
            {isSearchOpen && (
              <input
                autoFocus
                type="text"
                placeholder="Cari UMKM..."
                className="apple-search-inline large"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setVisibleCount(6) }}
              />
            )}
            <button className="add-biz-btn" onClick={openAddModal}>+<span className="btn-label"> UMKM</span></button>
          </div>
        </div>
      </header>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="loading-text">Memuat data...</p>
      ) : (
        <>
          <div className="catalog-grid large">
            {displayedItems.map((item) => (
              <Card key={item.id} item={item} category={category} />
            ))}
          </div>

          {visibleCount < filteredItems.length && (
            <button className="load-more-btn" onClick={() => setVisibleCount(v => v + 6)}>
              Lihat lebih banyak
            </button>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="detail-card modal-content" onClick={e => e.stopPropagation()}>
            <h3>Tambah UMKM Baru</h3>
            <Form
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
              setFieldErrors={setFieldErrors}
              onSubmit={handleSave}
              saving={saving}
              error={error}
              mode="add"
            />
          </div>
        </div>
      )}
    </div>
  )
}