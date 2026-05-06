import React, { useState, useEffect } from 'react'
import ServiceForm from './components/ServiceForm'
import SlideEditor from './components/SlideEditor'
import SlideCarousel from './components/SlideCarousel'
import TitleCardPreview from './components/TitleCardPreview'

interface Service {
  id: number
  service_date: string
  label: string
  sermon_title: string
  sermon_reference: string
}

interface RenderedPage {
  slide_type: string
  content: any
}

export default function App() {
  const [services, setServices] = useState<Service[]>([])
  const [currentService, setCurrentService] = useState<Service | null>(null)
  const [slides, setSlides] = useState<any[]>([])
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([])
  const [view, setView] = useState<'list' | 'edit' | 'preview'>('list')

  useEffect(() => { fetchServices() }, [])
  useEffect(() => { if (currentService) fetchSlides(currentService.id) }, [currentService])

  async function fetchServices() {
    const res = await fetch('/api/services')
    setServices(await res.json())
  }

  async function fetchSlides(serviceId: number) {
    const res = await fetch(`/api/services/${serviceId}/slides`)
    setSlides(await res.json())
  }

  async function fetchPreview(serviceId: number) {
    const res = await fetch(`/api/services/${serviceId}/preview_data`)
    const data = await res.json()
    setRenderedPages(data.pages)
  }

  async function handleServiceCreated(service: Service) {
    setCurrentService(service)
    setView('edit')
    await fetchServices()
  }

  async function handlePreview() {
    if (currentService) {
      await fetchPreview(currentService.id)
      setView('preview')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-5">
      <header className="flex justify-between items-center py-4 border-b-2 border-gray-200 mb-6">
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => { setCurrentService(null); setView('list') }}
        >
          Worship Slides
        </h1>
        {currentService && (
          <nav className="flex gap-3 items-center">
            <button
              className={`px-4 py-2 border rounded text-sm ${view === 'edit' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300'}`}
              onClick={() => setView('edit')}
            >
              Edit Slides
            </button>
            <button
              className={`px-4 py-2 border rounded text-sm ${view === 'preview' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300'}`}
              onClick={handlePreview}
            >
              Preview
            </button>
            <a
              href={`/api/services/${currentService.id}/export_pdf`}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm no-underline"
            >
              Export PDF
            </a>
            <a
              href={`/api/services/${currentService.id}/export_title_card`}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm no-underline"
            >
              Export Title Card
            </a>
          </nav>
        )}
      </header>

      <main>
        {view === 'list' && (
          <div>
            <ServiceForm onCreated={handleServiceCreated} />
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Services</h2>
              {services.length === 0 && <p className="text-gray-500">No services yet. Create one above.</p>}
              {services.map((s) => (
                <div
                  key={s.id}
                  className="p-3 border border-gray-100 rounded mb-2 cursor-pointer hover:bg-gray-50 flex gap-4 items-center"
                  onClick={() => { setCurrentService(s); setView('edit') }}
                >
                  <strong>{s.service_date}</strong>
                  {s.label && <span className="bg-gray-200 px-2 py-0.5 rounded text-xs">{s.label}</span>}
                  {s.sermon_title && <span className="text-gray-500 italic">{s.sermon_title}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'edit' && currentService && (
          <SlideEditor
            service={currentService}
            slides={slides}
            onSlidesChanged={() => fetchSlides(currentService.id)}
            onServiceUpdated={(s) => { setCurrentService(s); fetchServices() }}
          />
        )}

        {view === 'preview' && currentService && (
          <div>
            <SlideCarousel pages={renderedPages} />
            <TitleCardPreview service={currentService} />
          </div>
        )}
      </main>
    </div>
  )
}
