import React, { useState } from 'react'

interface ServiceFormProps {
  onCreated: (service: any) => void
}

export default function ServiceForm({ onCreated }: ServiceFormProps) {
  const [date, setDate] = useState('')
  const [label, setLabel] = useState('')
  const [sermonTitle, setSermonTitle] = useState('')
  const [sermonReference, setSermonReference] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCSRFToken() },
      body: JSON.stringify({ service: { service_date: date, label, sermon_title: sermonTitle, sermon_reference: sermonReference } }),
    })
    if (res.ok) {
      onCreated(await res.json())
      setDate(''); setLabel(''); setSermonTitle(''); setSermonReference('')
    }
  }

  return (
    <form className="bg-white p-6 rounded-lg shadow-sm mb-6" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold mb-4">New Service</h2>
      <div className="flex gap-4 mb-4 flex-wrap">
        <label className="flex flex-col gap-1 text-sm font-semibold flex-1 min-w-[150px]">
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            className="p-2 border border-gray-300 rounded text-sm font-normal" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold flex-1 min-w-[150px]">
          Label
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="AM, PM, Wednesday..."
            className="p-2 border border-gray-300 rounded text-sm font-normal" />
        </label>
      </div>
      <div className="flex gap-4 mb-4 flex-wrap">
        <label className="flex flex-col gap-1 text-sm font-semibold flex-1 min-w-[150px]">
          Sermon Title
          <input type="text" value={sermonTitle} onChange={(e) => setSermonTitle(e.target.value)} placeholder="e.g. Spiritually Healthy Old Men"
            className="p-2 border border-gray-300 rounded text-sm font-normal" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold flex-1 min-w-[150px]">
          Sermon Reference
          <input type="text" value={sermonReference} onChange={(e) => setSermonReference(e.target.value)} placeholder="e.g. Titus 2:2"
            className="p-2 border border-gray-300 rounded text-sm font-normal" />
        </label>
      </div>
      <button type="submit" className="px-5 py-2.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-700">
        Create Service
      </button>
    </form>
  )
}

function getCSRFToken(): string {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
}
