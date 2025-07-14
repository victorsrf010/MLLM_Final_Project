import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import { writeFile } from 'fs/promises'
import { tmpdir } from 'os'

export async function POST(req: Request) {
  const formData = await req.formData()
  const image = formData.get('image') as File
  const prompt = formData.get('prompt') as string
  const model = formData.get('model') as string
  const apiKey = formData.get('apiKey') as string

  if (!image || !apiKey) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

  const arrayBuffer = await image.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const filePath = path.join(tmpdir(), image.name)
  await writeFile(filePath, buffer)

  const scriptPath = path.join(process.cwd(), '../eval/run_gpt_4o_dynamic.py')

  const args = ['--img', filePath, '--key', apiKey]
  const python = spawn('python', [scriptPath, ...args])

  let output = ''
  let error = ''

  python.stdout.on('data', (data) => output += data.toString())
  python.stderr.on('data', (data) => error += data.toString())

  return new Promise((resolve) => {
    python.on('close', () => {
      resolve(NextResponse.json({ output: output || error }))
    })
  })
}
