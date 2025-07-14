import { promises as fs } from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData()

    const file = data.get('image') as File
    if (!file) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
    }

    const id = data.get('id') as string
    const question = data.get('question') as string
    const answer = data.get('answer') as string
    const reasoning = data.get('reasoning') as string
    const skill = [data.get('skill') as string]
    const broad_capability = [data.get('broad_capability') as string]
    const specific_capability = [data.get('specific_capability') as string]
    const imagesource = data.get('imagesource') as string
    const sourcelink = data.get('sourcelink') as string
    const liscenced = data.get('liscenced') as string

    // 1. Save the image
    const imageBuffer = Buffer.from(await file.arrayBuffer())
    const imagePath = path.join(process.cwd(), '../data/images', `${id}.png`)
    await fs.writeFile(imagePath, imageBuffer)

    // 2. Update dataset.json
    const datasetPath = path.join(process.cwd(), '../data/dataset.json')
    const datasetRaw = await fs.readFile(datasetPath, 'utf-8')
    const dataset = JSON.parse(datasetRaw)

    dataset[id] = {
      imagename: `${id}.png`,
      question,
      answer,
      reasoning,
      skill,
      broad_capability,
      specific_capability,
      imagesource,
      sourcelink,
      liscenced,
    }

    await fs.writeFile(datasetPath, JSON.stringify(dataset, null, 2))

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
