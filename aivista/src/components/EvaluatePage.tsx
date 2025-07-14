'use client'
import { useEffect, useState } from 'react'

export default function EvaluatePage() {
  const [log, setLog] = useState('')
  const [model, setModel] = useState('gpt-4o')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.MODEL) setModel(data.MODEL)
      })
      .catch(() => setModel('gpt-4o'))
  }, [])

  const runStep = async (step: 'generate' | 'extract' | 'analyze') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/evaluate?step=${step}&model=${model}`, { method: 'POST' })
      const json = await res.json()
      const output = json.output || json.error || 'No output'
      setLog((prev) => `${prev}\n\n[${step.toUpperCase()}]:\n${output}`)
    } catch (err) {
      setLog((prev) => `${prev}\n\n[${step.toUpperCase()}]:\nError during request.`)
      console.error('Fetch error:', err)
    }
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Run Model Evaluation</h2>

      <select value={model} disabled className="border p-2 bg-gray-200 text-gray-600">
        <option>{model}</option>
      </select>

      <div className="space-x-2">
        <button
          onClick={() => runStep('generate')}
          className="bg-green-600 text-white px-3 py-1"
          disabled={loading}
        >
          Generate
        </button>
        <button
          onClick={() => runStep('extract')}
          className="bg-yellow-500 text-white px-3 py-1"
          disabled={loading}
        >
          Extract
        </button>
        <button
          onClick={() => runStep('analyze')}
          className="bg-blue-600 text-white px-3 py-1"
          disabled={loading}
        >
          Analyze
        </button>
      </div>

      {loading && (
        <div className="text-sm text-gray-600">Processing... please wait.</div>
      )}

      <pre className="whitespace-pre-wrap border p-4 bg-gray-100">{log}</pre>
    </div>
  )
}
