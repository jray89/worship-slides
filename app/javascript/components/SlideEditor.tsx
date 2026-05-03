import React, { useState } from 'react'

interface SlideEditorProps {
  service: any
  slides: any[]
  onSlidesChanged: () => void
  onServiceUpdated: (service: any) => void
}

function getCSRFToken(): string {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
}

export default function SlideEditor({ service, slides, onSlidesChanged, onServiceUpdated }: SlideEditorProps) {
  const [slideType, setSlideType] = useState('psalm')
  const [psalmNumber, setPsalmNumber] = useState('')
  const [verseStart, setVerseStart] = useState('')
  const [verseEnd, setVerseEnd] = useState('')
  const [psalmVersion, setPsalmVersion] = useState('first')
  const [scriptureRef, setScriptureRef] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingService, setEditingService] = useState(false)
  const [sermonTitle, setSermonTitle] = useState(service.sermon_title || '')
  const [sermonReference, setSermonReference] = useState(service.sermon_reference || '')

  async function addSlide() {
    setLoading(true)
    try {
      const body: any = { slide: { slide_type: slideType } }
      if (slideType === 'psalm') {
        body.slide.psalm_number = parseInt(psalmNumber)
        body.slide.verse_start = parseInt(verseStart)
        body.slide.verse_end = parseInt(verseEnd)
        body.slide.psalm_version = psalmVersion
      } else if (slideType === 'scripture' || slideType === 'key_verse') {
        body.slide.scripture_reference = scriptureRef
      }

      const res = await fetch(`/api/services/${service.id}/slides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCSRFToken() },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        onSlidesChanged()
        setPsalmNumber(''); setVerseStart(''); setVerseEnd(''); setScriptureRef('')
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to add slide')
      }
    } finally { setLoading(false) }
  }

  async function removeSlide(slideId: number) {
    await fetch(`/api/services/${service.id}/slides/${slideId}`, {
      method: 'DELETE', headers: { 'X-CSRF-Token': getCSRFToken() },
    })
    onSlidesChanged()
  }

  async function moveSlide(slideId: number, direction: 'up' | 'down') {
    await fetch(`/api/services/${service.id}/slides/${slideId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCSRFToken() },
      body: JSON.stringify({ direction }),
    })
    onSlidesChanged()
  }

  async function updateService() {
    const res = await fetch(`/api/services/${service.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCSRFToken() },
      body: JSON.stringify({ service: { sermon_title: sermonTitle, sermon_reference: sermonReference } }),
    })
    if (res.ok) { onServiceUpdated(await res.json()); setEditingService(false) }
  }

  function slideDescription(slide: any): string {
    switch (slide.slide_type) {
      case 'welcome': return 'Welcome Slide'
      case 'closing': return 'Closing Slide'
      case 'psalm': {
        const ref = slide.verse_start
          ? `${slide.psalm_number}:${slide.verse_start}-${slide.verse_end}`
          : `${slide.psalm_number}`
        return `Psalm ${ref} (${slide.psalm_version})`
      }
      case 'scripture': return `Scripture: ${slide.scripture_reference}`
      case 'key_verse': return `Key Verse: ${slide.scripture_reference}`
      default: return slide.slide_type
    }
  }

  function slidePageCount(slide: any): number {
    if (!slide.content_data) return 1
    if (slide.slide_type === 'psalm') return slide.content_data.stanzas?.length || 0
    if (slide.slide_type === 'scripture') return slide.content_data.pages?.length || 0
    return 1
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{service.service_date} {service.label}</h2>
        {!editingService ? (
          <div className="flex gap-3 items-center mt-2">
            <span><strong>{service.sermon_title || '(no sermon title)'}</strong> — {service.sermon_reference || '(no reference)'}</span>
            <button className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded" onClick={() => setEditingService(true)}>Edit</button>
          </div>
        ) : (
          <div className="flex gap-3 mt-2 flex-wrap">
            <input value={sermonTitle} onChange={(e) => setSermonTitle(e.target.value)} placeholder="Sermon title"
              className="p-2 border border-gray-300 rounded text-sm flex-1" />
            <input value={sermonReference} onChange={(e) => setSermonReference(e.target.value)} placeholder="Reference"
              className="p-2 border border-gray-300 rounded text-sm" />
            <button className="px-4 py-2 bg-gray-800 text-white rounded text-sm" onClick={updateService}>Save</button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm" onClick={() => setEditingService(false)}>Cancel</button>
          </div>
        )}
      </div>

      {/* Slide list */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Slides ({slides.reduce((acc, s) => acc + slidePageCount(s), 0)} pages)</h3>
        {slides.map((slide, index) => (
          <div key={slide.id} className="flex items-center gap-3 p-2.5 border border-gray-100 rounded mb-1">
            <span className="font-bold text-gray-400 w-8">{index + 1}.</span>
            <span className="flex-1">{slideDescription(slide)}</span>
            <span className="text-gray-400 text-sm">({slidePageCount(slide)} pages)</span>
            <div className="flex gap-1">
              <button className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded" onClick={() => moveSlide(slide.id, 'up')} disabled={index === 0}>&uarr;</button>
              <button className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded" onClick={() => moveSlide(slide.id, 'down')} disabled={index === slides.length - 1}>&darr;</button>
              <button className="px-2.5 py-1 bg-red-600 text-white text-sm rounded" onClick={() => removeSlide(slide.id)}>&times;</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add slide form */}
      <div className="border-t-2 border-gray-100 pt-5">
        <h3 className="text-lg font-semibold mb-3">Add Slide</h3>
        <div className="flex gap-4 mb-4 flex-wrap">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Type
            <select value={slideType} onChange={(e) => setSlideType(e.target.value)}
              className="p-2 border border-gray-300 rounded text-sm font-normal">
              <option value="welcome">Welcome</option>
              <option value="psalm">Psalm</option>
              <option value="scripture">Scripture Reading</option>
              <option value="key_verse">Key Verse</option>
              <option value="closing">Closing</option>
            </select>
          </label>
        </div>

        {slideType === 'psalm' && (
          <div className="flex gap-4 mb-4 flex-wrap items-end">
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Psalm #
              <input type="number" min="1" max="150" value={psalmNumber} onChange={(e) => setPsalmNumber(e.target.value)} placeholder="23"
                className="p-2 border border-gray-300 rounded text-sm font-normal w-24" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              From verse <span className="font-normal text-gray-400">(optional)</span>
              <input type="number" min="1" value={verseStart} onChange={(e) => setVerseStart(e.target.value)} placeholder="whole psalm"
                className="p-2 border border-gray-300 rounded text-sm font-normal w-28" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              To verse <span className="font-normal text-gray-400">(optional)</span>
              <input type="number" min="1" value={verseEnd} onChange={(e) => setVerseEnd(e.target.value)} placeholder="whole psalm"
                className="p-2 border border-gray-300 rounded text-sm font-normal w-28" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Version
              <select value={psalmVersion} onChange={(e) => setPsalmVersion(e.target.value)}
                className="p-2 border border-gray-300 rounded text-sm font-normal">
                <option value="first">First</option>
                <option value="second">Second</option>
              </select>
            </label>
          </div>
        )}

        {(slideType === 'scripture' || slideType === 'key_verse') && (
          <div className="flex gap-4 mb-4 flex-wrap">
            <label className="flex flex-col gap-1 text-sm font-semibold flex-1 min-w-[200px]">
              Reference
              <input type="text" value={scriptureRef} onChange={(e) => setScriptureRef(e.target.value)} placeholder="e.g. Titus 2 or Titus 2:1"
                className="p-2 border border-gray-300 rounded text-sm font-normal" />
            </label>
          </div>
        )}

        <button className="px-5 py-2.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-700 disabled:bg-gray-400"
          onClick={addSlide} disabled={loading}>
          {loading ? 'Fetching content...' : 'Add Slide'}
        </button>
      </div>
    </div>
  )
}
