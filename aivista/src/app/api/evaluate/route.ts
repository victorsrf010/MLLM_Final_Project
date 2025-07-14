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
        const script = path.join(baseEvalPath, 'generate_gpt4o_answers.py')
        command = `python "${script}"`
      } else if (model === 'gemini') {
        const script = path.join(baseEvalPath, 'generate_gemini_answers.py')
        command = `python "${script}"`
      } else {
        return NextResponse.json({ error: `Model '${model}' not supported yet.` })
      }
      break
    case 'extract':
      command = `python "${path.join(baseEvalPath, 'extract_accuracy.py')}"`
      break
    case 'analyze':
      command = `python "${path.join(baseEvalPath, 'analyze_accuracy.py')}"`
      break
    default:
      return NextResponse.json({ error: 'Invalid step' })
  }

  console.log('Running command:', command)

  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Exec error:', error)
        resolve(NextResponse.json({ error: stderr || stdout }))
      } else {
        resolve(NextResponse.json({ output: stdout }))
      }
    })
  })
}
