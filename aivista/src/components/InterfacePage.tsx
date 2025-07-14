'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PhotoIcon } from '@heroicons/react/24/solid'

export default function InterfacePage() {
  const router = useRouter()
  const [image, setImage] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('gpt-4o')
  const [openaiKey, setOpenaiKey] = useState('')
  const [googleKey, setGoogleKey] = useState('')
  const [compare, setCompare] = useState<string | false>(false)
  const [response, setResponse] = useState<any>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const storedModel = localStorage.getItem('model')
    const storedOpenai = localStorage.getItem('openai') || ''
    const storedGoogle = localStorage.getItem('google') || ''
    if (storedModel) setModel(storedModel)
    setOpenaiKey(storedOpenai)
    setGoogleKey(storedGoogle)
  }, [])

  const buildFormData = (model: string, apiKey: string) => {
    const formData = new FormData()
    if (image) formData.append('image', image)
    formData.append('prompt', prompt)
    formData.append('model', model)
    formData.append('apiKey', apiKey)
    return formData
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!image || (!openaiKey && !googleKey)) {
      setResponse('Missing image or API key.')
      return
    }

    setLoading(true)
    setResponse('')

    if (!compare) {
      try {
        const res = await fetch('/api/infer', {
          method: 'POST',
          body: buildFormData(model, model === 'gpt-4o' ? openaiKey : googleKey)
        })
        const out = await res.json()
        setResponse(out.output || out.error || 'No output')
      } catch {
        setResponse('Request failed.')
      }
    }

    if (compare) {
      try {
        const [res1, res2] = await Promise.all([
          fetch('/api/infer', { method: 'POST', body: buildFormData(model, model === 'gpt-4o' ? openaiKey : googleKey) }),
          fetch('/api/infer', { method: 'POST', body: buildFormData(compare, compare === 'gpt-4o' ? openaiKey : googleKey) })
        ])
        const out1 = await res1.json()
        const out2 = await res2.json()
        setResponse({
          [model]: out1.output || out1.error || 'No output',
          [compare]: out2.output || out2.error || 'No output'
        })
      } catch {
        setResponse({ [model]: 'Request failed.', [compare]: 'Request failed.' })
      }
    }

    setLoading(false)
  }

  const handleSaveSettings = async () => {
    localStorage.setItem('model', model)
    localStorage.setItem('openai', openaiKey)
    localStorage.setItem('google', googleKey)

    await fetch('/api/config', {
      method: 'POST',
      body: JSON.stringify({ model, openai: openaiKey, google: googleKey }),
      headers: { 'Content-Type': 'application/json' }
    })
  }

  function sanitizeText(text: unknown): string {
    return typeof text === 'string'
      ? text.replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\uFFFF]/g, '')
      : JSON.stringify(text, null, 2)
  }

  const clearForm = () => {
    setImage(null)
    setPrompt('')
    setResponse('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-xl p-4 space-y-4">
        <div className="flex justify-between gap-2">
          <button
            onClick={() => router.push('/create')}
            className="w-full bg-blue-600 text-white py-1.5 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Add Entry
          </button>
          <button
            onClick={() => router.push('/evaluate')}
            className="w-full bg-green-600 text-white py-1.5 rounded-md text-sm font-medium hover:bg-green-700"
          >
            Evaluate
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center">
              {image ? (
                <img src={URL.createObjectURL(image)} alt="preview" className="h-24 w-auto object-contain mb-1" />
              ) : (
                <PhotoIcon className="h-8 w-8 text-gray-300" aria-hidden="true" />
              )}
              <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 mt-2">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="sr-only"
                />
              </label>
              {image && <p className="mt-1 text-xs text-gray-500">{image.name}</p>}
            </div>

            <div className="space-y-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt..."
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring focus:ring-blue-300"
                rows={3}
              />
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring focus:ring-blue-300"
                disabled={!!compare}
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gemini">Gemini</option>
              </select>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Compare with:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1 text-sm rounded-md border ${compare === 'gemini'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    onClick={() => setCompare(compare === 'gemini' ? false : 'gemini')}
                  >
                    Gemini
                  </button>
                  {/* Add more models here as needed */}
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4">
            <label className="block font-medium text-gray-700 mb-1">Model API Keys</label>
            <div className="space-y-2">
              <div className="border border-gray-200 rounded-md p-3">
                <div className="text-sm font-semibold text-gray-700 mb-1">GPT-4o</div>
                <input
                  type="text"
                  value={openaiKey}
                  onChange={(e) => {
                    const val = e.target.value
                    setOpenaiKey(val)
                    localStorage.setItem('openai', val)
                  }}
                  placeholder="sk-..."
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                />
              </div>
              <div className="border border-gray-200 rounded-md p-3">
                <div className="text-sm font-semibold text-gray-700 mb-1">Gemini</div>
                <input
                  type="text"
                  value={googleKey}
                  onChange={(e) => {
                    const val = e.target.value
                    setGoogleKey(val)
                    localStorage.setItem('google', val)
                  }}
                  placeholder="AIza..."
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="w-full bg-gray-800 text-white py-1.5 rounded-md text-sm hover:bg-gray-900 transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="w-full bg-red-500 text-white py-1.5 rounded-md text-sm hover:bg-red-600 transition"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-1.5 rounded-md text-sm hover:bg-gray-900 transition"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

        {compare && typeof response === 'object' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(response).map(([modelName, output]) => (
              <div key={modelName} className="border border-gray-300 bg-gray-100 rounded-md p-3 max-h-64 overflow-y-auto whitespace-pre-wrap text-xs font-mono text-gray-700 break-words">
                <h3 className="font-bold mb-1">{modelName}</h3>
                <pre className="whitespace-pre-wrap break-words">{sanitizeText(String(output))}</pre>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-gray-300 bg-gray-100 rounded-md p-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs font-mono text-gray-700">
            {typeof response === 'string'
              ? sanitizeText(response || 'No response yet.')
              : 'No response yet.'}
          </div>
        )}
      </div>
    </div>
  )
}
