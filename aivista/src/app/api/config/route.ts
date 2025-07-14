// config/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const configPath = path.resolve(process.cwd(), '..', 'eval', 'config.json')

export async function POST(req: NextRequest) {
  const { model, openai, google } = await req.json()

  const config = {
    MODEL: model,
    OPENAI_APIKEY: openai || '',
    GOOGLE_APIKEY: google || ''
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  return NextResponse.json({ success: true })
}

export async function GET() {
  if (!fs.existsSync(configPath)) {
    return NextResponse.json({ MODEL: 'gpt-4o', OPENAI: '', GOOGLE: '' })
  }

  const raw = fs.readFileSync(configPath, 'utf-8')
  const config = JSON.parse(raw)
  return NextResponse.json(config)
}
