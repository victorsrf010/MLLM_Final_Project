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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-xl p-4 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Run Model Evaluation</h2>

        <select
          value={model}
          onChange={(e) => setModel(e.target.value)} // previously disabled
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white text-gray-700"
        >
          <option value="gpt-4o">GPT-4o</option>
          <option value="gemini">Gemini</option>
        </select>


        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => runStep('generate')}
            disabled={loading}
            className="bg-green-600 text-white py-1.5 rounded-md text-sm hover:bg-green-700 transition"
          >
            Generate
          </button>
          <button
            onClick={() => runStep('extract')}
            disabled={loading}
            className="bg-yellow-500 text-white py-1.5 rounded-md text-sm hover:bg-yellow-600 transition"
          >
            Extract
          </button>
          <button
            onClick={() => runStep('analyze')}
            disabled={loading}
            className="bg-blue-600 text-white py-1.5 rounded-md text-sm hover:bg-blue-700 transition"
          >
            Analyze
          </button>
        </div>

        {loading && (
          <div className="text-sm text-gray-500">Processing... please wait.</div>
        )}

        <pre className="border border-gray-300 bg-gray-100 rounded-md p-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs font-mono text-gray-700">
          {log || 'No output yet.'}
        </pre>
      </div>
    </div>

  )
}
