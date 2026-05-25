import { writeFile, mkdir } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request) {
  const data = await request.formData();
  const file = data.get('file');

  if (!file) return NextResponse.json({ success: false });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Define the path to /public/uploads
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Ensure the directory exists
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);
  
  // Return the public URL to be stored in localStorage
  return NextResponse.json({ url: `/uploads/${fileName}` });
}