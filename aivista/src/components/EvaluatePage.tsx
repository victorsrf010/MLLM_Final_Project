'use client'
import { useEffect, useState } from 'react'

type SummaryEntry = { name: string; correct: number; total: number }
type Summary = {
  total: { correct: number; total: number }
  skills: SummaryEntry[]
  capabilities: SummaryEntry[]
}

function Table({
  title,
  dataA,
  dataB,
  labelA,
  labelB
}: {
  title: string
  dataA: SummaryEntry[]
  dataB: SummaryEntry[]
  labelA: string
  labelB: string
}) {
  const keys = Array.from(new Set([...dataA.map(d => d.name), ...dataB.map(d => d.name)]))
  return (
    <div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <table className="w-full text-xs border border-gray-300 mb-4">
        <thead>
          <tr>
            <th className="p-1 border-b text-left">Name</th>
            <th className="p-1 border-b text-right">{labelA}</th>
            {labelB && <th className="p-1 border-b text-right">{labelB}</th>}
          </tr>
        </thead>
        <tbody>
          {keys.map(name => {
            const entryA = dataA.find(d => d.name === name) || { name, correct: 0, total: 0 }
            const entryB = dataB.find(d => d.name === name) || { name, correct: 0, total: 0 }
            const percentA = entryA.total ? (entryA.correct / entryA.total) * 100 : 0
            const percentB = entryB.total ? (entryB.correct / entryB.total) * 100 : 0

            return (
              <tr key={name}>
                <td className="p-1 border-b">{name}</td>
                <td className="p-1 border-b text-right">
                  <div className="w-full bg-gray-200 rounded h-3 mb-0.5">
                    <div
                      className="bg-blue-500 h-3 rounded"
                      style={{ width: `${percentA}%` }}
                    />
                  </div>
                  <span className="text-[10px]">{`${entryA.correct}/${entryA.total}`}</span>
                </td>
                {labelB && (
                  <td className="p-1 border-b text-right">
                    <div className="w-full bg-gray-200 rounded h-3 mb-0.5">
                      <div
                        className="bg-green-500 h-3 rounded"
                        style={{ width: `${percentB}%` }}
                      />
                    </div>
                    <span className="text-[10px]">{`${entryB.correct}/${entryB.total}`}</span>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function EvaluatePage() {
  const [logs, setLogs] = useState<{ [model: string]: any }>({})
  const [model, setModel] = useState('gpt-4o')
  const [loading, setLoading] = useState(false)

  const runStep = async (step: 'generate' | 'extract' | 'analyze') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/evaluate?step=${step}&model=${model}`, { method: 'POST' })
      const json = await res.json()
      const output = json.output || json.error || 'No output'

      setLogs(prev => ({
        ...prev,
        [model]: {
          ...(prev[model] || {}),
          [step]: output
        }
      }))
    } catch {
      setLogs(prev => ({
        ...prev,
        [model]: {
          ...(prev[model] || {}),
          [step]: 'Request failed.'
        }
      }))
    }
    setLoading(false)
  }

  const summaryA: Summary | null =
    typeof logs['gpt-4o']?.analyze === 'object' ? logs['gpt-4o'].analyze : null
  const summaryB: Summary | null =
    typeof logs['gemini']?.analyze === 'object' ? logs['gemini'].analyze : null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white shadow-md rounded-xl p-4 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Run Model Evaluation</h2>

        <select
          value={model}
          onChange={e => setModel(e.target.value)}
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

        {loading && <div className="text-sm text-gray-500">Processing...</div>}

        {summaryA && summaryB ? (
          <>
            <div className="text-sm text-gray-800 font-semibold">
              GPT-4o Accuracy: {summaryA.total.correct}/{summaryA.total.total} | Gemini Accuracy:{' '}
              {summaryB.total.correct}/{summaryB.total.total}
            </div>
            <Table
              title="Skills"
              dataA={summaryA.skills}
              dataB={summaryB.skills}
              labelA="GPT-4o"
              labelB="Gemini"
            />
            <Table
              title="Capabilities"
              dataA={summaryA.capabilities}
              dataB={summaryB.capabilities}
              labelA="GPT-4o"
              labelB="Gemini"
            />
          </>
        ) : (summaryA || summaryB) ? (
          <>
            {summaryA ? (
              <>
                <div className="text-sm text-gray-800 font-semibold">
                  GPT-4o Accuracy: {summaryA.total.correct}/{summaryA.total.total}
                </div>
                <Table
                  title="Skills"
                  dataA={summaryA.skills}
                  dataB={[]}
                  labelA="GPT-4o"
                  labelB=""
                />
                <Table
                  title="Capabilities"
                  dataA={summaryA.capabilities}
                  dataB={[]}
                  labelA="GPT-4o"
                  labelB=""
                />
              </>
            ) : summaryB ? (
              <>
                <div className="text-sm text-gray-800 font-semibold">
                  Gemini Accuracy: {summaryB.total.correct}/{summaryB.total.total}
                </div>
                <Table
                  title="Skills"
                  dataA={summaryB.skills}
                  dataB={[]}
                  labelA="Gemini"
                  labelB=""
                />
                <Table
                  title="Capabilities"
                  dataA={summaryB.capabilities}
                  dataB={[]}
                  labelA="Gemini"
                  labelB=""
                />
              </>
            ) : null}

          </>
        ) : (
          <pre className="border border-gray-300 bg-gray-100 rounded-md p-3 text-xs font-mono text-gray-700">
            {typeof logs[model]?.analyze === 'string'
              ? logs[model].analyze
              : JSON.stringify(logs[model]?.analyze, null, 2) || 'No output yet.'}
          </pre>
        )}

      </div>
    </div>
  )
}
