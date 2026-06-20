import sharp from 'sharp'
import Ffmpeg from 'fluent-ffmpeg'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { writeFileSync, unlinkSync, readFileSync } from 'fs'

export async function watermarkImage(input: Buffer): Promise<Buffer> {
  const svg = `
    <svg width="1200" height="1200" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="50%" font-size="60" font-family="Arial" font-weight="bold"
            fill="rgba(255,255,255,0.35)" text-anchor="middle"
            transform="rotate(-30, 600, 600)">
        WATERMARK - PREVIEW ONLY
      </text>
      <text x="50" y="100" font-size="60" font-family="Arial" font-weight="bold"
            fill="rgba(255,255,255,0.35)" text-anchor="start"
            transform="rotate(-30, 50, 100)">
        WATERMARK - PREVIEW ONLY
      </text>
    </svg>`

  return sharp(input)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toBuffer()
}

export async function watermarkVideo(input: Buffer): Promise<Buffer> {
  const id = randomUUID()
  const inputPath = join(tmpdir(), `input-${id}.mp4`)
  const outputPath = join(tmpdir(), `output-${id}.mp4`)

  writeFileSync(inputPath, input)

  return new Promise((resolve, reject) => {
    Ffmpeg(inputPath)
      .videoFilter("drawtext=text='WATERMARK - PREVIEW ONLY':fontsize=36:fontcolor=white@0.4:x=(w-text_w)/2:y=(h-text_h)/2:rotate=-30")
      .outputOptions('-c:a', 'copy')
      .on('end', () => {
        try {
          const result = readFileSync(outputPath)
          unlinkSync(inputPath)
          unlinkSync(outputPath)
          resolve(result)
        } catch (e) {
          reject(e)
        }
      })
      .on('error', (err) => {
        try { unlinkSync(inputPath) } catch {}
        try { unlinkSync(outputPath) } catch {}
        reject(err)
      })
      .save(outputPath)
  })
}

export function isVideo(mime: string): boolean {
  return mime.startsWith('video/')
}
