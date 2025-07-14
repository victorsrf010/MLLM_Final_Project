export const dynamic = 'force-dynamic'

import { exec } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const step = searchParams.get('step')
  const model = searchParams.get('model')

  let command = ''
  const baseEvalPath = path.join(process.cwd(), '..', 'eval')
  const configPath = path.join(baseEvalPath, 'config.json')

  // Update config.json with selected model
  if (step === 'generate') {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

      if (model === 'gpt-4o') {
        config.MODEL = 'gpt-4o'
      } else if (model === 'gemini') {
        config.MODEL = 'gemini'
      } else {
        return NextResponse.json({ error: `Model '${model}' not supported.` })
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    } catch (err) {
      return NextResponse.json({ error: 'Failed to update config.json' })
    }
  }

  // Define the command to run
  switch (step) {
    case 'generate':
      if (model === 'gpt-4o') {
        command = `python "${path.join(baseEvalPath, 'generate_gpt4o_answers.py')}"`
      } else if (model === 'gemini') {
        command = `python "${path.join(baseEvalPath, 'generate_gemini_answers.py')}"`
      }
      break
    case 'extract':
      command = `python "${path.join(baseEvalPath, 'extract_accuracy.py')}" --model ${model}`
      break
    case 'analyze':
      command = `python "${path.join(baseEvalPath, 'analyze_accuracy.py')}" --model ${model}`
      break
    default:
      return NextResponse.json({ error: 'Invalid step' })
  }

  // Run the command and return the result
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
