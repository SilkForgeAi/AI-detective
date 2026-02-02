import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import pdfParse from 'pdf-parse'
import Tesseract from 'tesseract.js'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export async function POST(request: NextRequest) {
  try {
    // Optional: Get user if logged in, but not required
    const session = await getSession(request)
    const userId = session?.userId || null

    const formData = await request.formData()
    const file = formData.get('file') as File
    const caseId = formData.get('caseId') as string
    const evidenceId = formData.get('evidenceId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${Date.now()}-${file.name}`
    const filepath = join(UPLOAD_DIR, filename)

    await writeFile(filepath, buffer)

    let extractedText = ''
    const mimeType = file.type

    // Extract text based on file type
    if (mimeType === 'application/pdf') {
      try {
        const pdfData = await pdfParse(buffer)
        extractedText = pdfData.text
      } catch (error) {
        console.error('PDF parsing error:', error)
      }
    } else if (mimeType.startsWith('image/')) {
      try {
        const { data: { text } } = await Tesseract.recognize(buffer, 'eng')
        extractedText = text
      } catch (error) {
        console.error('OCR error:', error)
      }
    }

    const fileData = {
      id: `file-${Date.now()}`,
      filename,
      originalName: file.name,
      mimeType,
      size: file.size,
      path: filepath,
      url: `/api/files/${filename}`,
      extractedText,
      caseId: caseId || null,
      evidenceId: evidenceId || null,
      uploadedAt: new Date().toISOString(),
      userId, // Optional user ID if logged in
    }

    // Save to database (would use fileRepository here)
    // For now, return file data

    return NextResponse.json({ file: fileData })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
