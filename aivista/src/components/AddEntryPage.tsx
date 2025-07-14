'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PhotoIcon } from '@heroicons/react/24/solid'

const skills = ['inductive', 'deductive', 'numerical', 'spatial', 'mechanical']
const broadCapabilities = ['diagram', 'ocr', 'patterns', 'graphs', 'tables', '3d shapes', 'puzzles', 'sequences', 'physics']
const specificCapabilities = ['pattern', 'rotation', 'exclusion', 'analogies', 'completion']
const imageSources = ['manual', 'textbook', 'dataset', 'web', 'synthetic']
const licenseOptions = ['true', 'false']

export default function AddEntryForm() {
  const router = useRouter()
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    id: '',
    question: '',
    answer: '',
    reasoning: '',
    skill: 'inductive',
    broad_capability: 'diagram',
    specific_capability: 'pattern',
    sourcelink: '',
    imagesource: 'manual',
    liscenced: 'false',
  })
  const [image, setImage] = useState<File | null>(null)
  const [status, setStatus] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image) return setStatus('Image required')

    const data = new FormData()
    Object.entries(formData).forEach(([k, v]) => data.append(k, v))
    data.append('image', image)

    const res = await fetch('/api/add-entry', {
      method: 'POST',
      body: data,
    })

    if (res.ok) {
      alert('Entry added successfully.')
      router.back()
    } else {
      const text = await res.text()
      setStatus(`Error: ${text}`)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-xl p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Dataset Entry</h2>
          <p className="mt-1 text-xs text-gray-600">Fill in the information to add a new dataset entry.</p>
          <div className="border-b border-gray-200 pb-8">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-3">
                <label htmlFor="image" className="block font-medium text-gray-700">Image</label>
                <div className="mt-1 flex flex-col items-center rounded-md border border-dashed border-gray-300 p-2">
                  {image ? (
                    <img src={URL.createObjectURL(image)} alt="preview" className="h-24 w-auto object-contain mb-1" />
                  ) : (
                    <PhotoIcon className="h-8 w-8 text-gray-300" aria-hidden="true" />
                  )}
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Choose File
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setImage(file)
                        if (file) {
                          const baseName = file.name.split('.').slice(0, -1).join('.')
                          setFormData((prev) => ({ ...prev, id: baseName }))
                        }
                      }}
                      className="sr-only"
                    />
                  </label>
                  {image && <p className="mt-1 text-xs text-gray-500">{image.name}</p>}
                </div>
              </div>


              <div className="sm:col-span-3">
                <label htmlFor="id" className="block font-medium text-gray-700">Id</label>
                <input
                  type="text"
                  name="id"
                  id="id"
                  value={formData.id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {["question", "answer", "reasoning", "sourcelink"].map((field) => (
                <div key={field} className="sm:col-span-3">
                  <label htmlFor={field} className="block font-medium text-gray-700">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {["question", "answer", "reasoning"].includes(field) ? (
                    <textarea
                      name={field}
                      id={field}
                      value={formData[field as keyof typeof formData] || ''}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  ) : (
                    <input
                      type="text"
                      name={field}
                      id={field}
                      value={formData[field as keyof typeof formData] || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  )}
                </div>
              ))}

              {[{
                id: 'imagesource', label: 'Image Source', options: imageSources
              }, {
                id: 'liscenced', label: 'Licensed', options: licenseOptions
              }, {
                id: 'skill', label: 'Skill', options: skills
              }, {
                id: 'broad_capability', label: 'Broad Capability', options: broadCapabilities
              }, {
                id: 'specific_capability', label: 'Specific Capability', options: specificCapabilities
              }].map(({ id, label, options }) => (
                <div key={id} className="sm:col-span-3">
                  <label htmlFor={id} className="block font-medium text-gray-700">
                    {label}
                  </label>
                  <select
                    id={id}
                    name={id}
                    value={formData[id as keyof typeof formData] || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => router.back()} className="w-full bg-red-500 text-white py-1.5 rounded-md text-sm hover:bg-red-600">Cancel</button>
            <button type="submit" className="w-full bg-black text-white py-1.5 rounded-md text-sm hover:bg-gray-900">Submit</button>
          </div>


          {status && (
            <div className="border border-gray-300 bg-gray-100 rounded-md p-3 text-xs font-mono text-gray-700 whitespace-pre-wrap">
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}