import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use service role key here so uploads bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const data = await request.formData()
    const file = data.get('file')

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sanitize filename and make it unique
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    const fileName = `${Date.now()}-${safeName}`

    // Upload to Supabase Storage bucket
    const { error } = await supabase.storage
      .from('umkm-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('umkm-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}