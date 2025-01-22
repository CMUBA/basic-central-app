import fs from 'node:fs'
import path from 'node:path'

export async function saveImage(base64Data: string): Promise<string> {
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  const base64Image = base64Data.split(';base64,').pop()
  if (!base64Image) {
    throw new Error('Invalid image data')
  }

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'public/uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // Generate a unique filename
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`
  const filepath = path.join(uploadDir, filename)

  // Save the file
  fs.writeFileSync(filepath, base64Image, { encoding: 'base64' })

  // Return the public URL
  return `/uploads/${filename}`
} 