export const dynamic = 'force-dynamic'

import { exec } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const step = searchParams.get('step')
  const model = searchParams.get('model')

  let command = ''
  const baseEvalPath = path.join(process.cwd(), '..', 'eval')

  switch (step) {
    case 'generate':
      if (model === 'gpt-4o') {
        command = `python "${path.join(baseEvalPath, 'generate_gpt4o_answers.py')}"`
      } else if (model === 'gemini') {
        command = `python "${path.join(baseEvalPath, 'generate_gemini_answers.py')}"`
      } else {
        return NextResponse.json({ error: `Model '${model}' not supported.` })
      }
      break
    case 'extract':
      command = `python "${path.join(baseEvalPath, 'extract_accuracy.py')}"`
      break
    case 'analyze':
      command = `python "${path.join(baseEvalPath, 'analyze_accuracy.py')}" --model ${model}`
      break
    default:
      return NextResponse.json({ error: 'Invalid step' })
  }

  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve(NextResponse.json({ error: stderr || stdout }))
      } else {
        try {
          const parsed = step === 'analyze' ? JSON.parse(stdout) : stdout
          resolve(NextResponse.json({ output: parsed }))
        } catch {
          resolve(NextResponse.json({ error: 'Failed to parse output' }))
        }
      }
    })
  })
}
