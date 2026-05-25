'use client'

import client from '@/app/api/client'

const PRICE_RANGES = [
  'Rp 5.000 – Rp 15.000',
  'Rp 15.000 – Rp 30.000',
  'Rp 20.000 – Rp 40.000',
  'Rp 30.000 – Rp 50.000',
  'Rp 50.000+',
]

export function isGoogleMapsUrl(url) {
  try {
    const { hostname } = new URL(url)
    return (
      hostname === 'maps.google.com' ||
      hostname === 'www.google.com' ||
      hostname === 'maps.app.goo.gl' ||
      hostname === 'goo.gl'
    )
  } catch { return false }
}

export function isValidPhone(phone) {
  return /^08\d{9,11}$/.test(phone)
}

export function validateForm(formData) {
  const errs = {}
  if (!isGoogleMapsUrl(formData.mapsUrl))
    errs.mapsUrl = 'Masukkan link Google Maps yang valid (maps.app.goo.gl/...)'
  if (!formData.priceLabel)
    errs.priceLabel = 'Pilih rentang harga'
  if (!isValidPhone(formData.whatsapp))
    errs.whatsapp = 'Nomor harus diawali 08 dan terdiri dari 11–13 digit'
  return errs
}

export const EMPTY_FORM = {
  name: '',
  city: '',
  mapsUrl: '',
  priceLabel: '',
  images: ['', '', ''],
  whatsapp: '',
}

/**
 * UmkmForm — reusable form for adding and editing UMKM entries.
 *
 * Props:
 *   formData       — current form state object
 *   setFormData    — state setter
 *   fieldErrors    — object of per-field error strings
 *   setFieldErrors — state setter
 *   onSubmit       — async submit handler (receives event)
 *   saving         — boolean, disables submit while saving
 *   error          — global error string (optional)
 *   mode           — 'add' | 'edit', controls submit button label
 */
export default function Form({
  formData,
  setFormData,
  fieldErrors,
  setFieldErrors,
  onSubmit,
  saving,
  error,
  mode = 'add',
}) {
  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    const fileName = `${Date.now()}-${safeName}`

    const { error } = await client.storage
      .from('umkm-images')
      .upload(fileName, file, { contentType: file.type, upsert: false })

    if (error) { console.error('Upload failed', error); return }

    const { data } = client.storage.from('umkm-images').getPublicUrl(fileName)
    const newImgs = [...formData.images]
    newImgs[index] = data.publicUrl
    setFormData({ ...formData, images: newImgs })
  }

  const clearError = (field) => {
    if (fieldErrors[field]) setFieldErrors(p => ({ ...p, [field]: '' }))
  }

  return (
    <form onSubmit={onSubmit} className="umkm-form">
      <input
        required
        placeholder="Nama UMKM"
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
      />

      <input
        required
        placeholder="Kalurahan"
        value={formData.city}
        onChange={e => setFormData({ ...formData, city: e.target.value })}
      />

      {/* Google Maps URL */}
      <div>
        <input
          required
          type="url"
          placeholder="Link Google Maps (maps.app.goo.gl/...)"
          value={formData.mapsUrl}
          onChange={e => { setFormData({ ...formData, mapsUrl: e.target.value }); clearError('mapsUrl') }}
          style={fieldErrors.mapsUrl ? { borderColor: '#ff3b30' } : {}}
        />
        {fieldErrors.mapsUrl && <p className="field-error">{fieldErrors.mapsUrl}</p>}
      </div>

      {/* Price Range Dropdown */}
      <div>
        <select
          required
          value={formData.priceLabel}
          onChange={e => { setFormData({ ...formData, priceLabel: e.target.value }); clearError('priceLabel') }}
          className="price-select"
          style={fieldErrors.priceLabel ? { borderColor: '#ff3b30' } : {}}
        >
          <option value="" disabled>Pilih Rentang Harga</option>
          {PRICE_RANGES.map((label, i) => (
            <option key={i} value={label}>{label}</option>
          ))}
        </select>
        {fieldErrors.priceLabel && <p className="field-error">{fieldErrors.priceLabel}</p>}
      </div>

      {/* WhatsApp */}
      <div>
        <input
          required
          placeholder="No. WhatsApp (cth: 08123456789)"
          value={formData.whatsapp}
          maxLength={13}
          onChange={e => {
            const val = e.target.value.replace(/\D/g, '')
            setFormData({ ...formData, whatsapp: val })
            clearError('whatsapp')
          }}
          style={fieldErrors.whatsapp ? { borderColor: '#ff3b30' } : {}}
        />
        {fieldErrors.whatsapp && <p className="field-error">{fieldErrors.whatsapp}</p>}
      </div>

      {/* Images */}
      <div className="image-grid-3">
        {[0, 1, 2].map((i) => (
          <label key={i} className="photo-square upload-label">
            {formData.images[i] ? (
              <img src={formData.images[i]} className="preview-image" alt="Preview" />
            ) : (
              <span>+</span>
            )}
            <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, i)} />
          </label>
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="add-biz-btn" disabled={saving}>
        {saving ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Simpan UMKM'}
      </button>
    </form>
  )
}