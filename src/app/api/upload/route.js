import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const data = await request.formData()
    const file = data.get('file')

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    const fileName = `${Date.now()}-${safeName}`

    const { error } = await supabase.storage
      .from('umkm-images')
      .upload(fileName, buffer, { contentType: file.type, upsert: false })

    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('umkm-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}