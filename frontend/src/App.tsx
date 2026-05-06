import React, { useState, useEffect } from 'react'
import ServiceForm from './components/ServiceForm'
import SlideEditor from './components/SlideEditor'
import SlideCarousel from './components/SlideCarousel'
import TitleCardPreview from './components/TitleCardPreview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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
      <header className="flex justify-between items-center py-4 mb-6">
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => { setCurrentService(null); setView('list') }}
        >
          Worship Slides
        </h1>
        {currentService && (
          <nav className="flex gap-3 items-center">
            <Button
              variant={view === 'edit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('edit')}
            >
              Edit Slides
            </Button>
            <Button
              variant={view === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={handlePreview}
            >
              Preview
            </Button>
            <Button size="sm" render={<a href={`/api/services/${currentService.id}/export_pdf`} />}>
              Export PDF
            </Button>
            <Button size="sm" render={<a href={`/api/services/${currentService.id}/export_title_card`} />}>
              Export Title Card
            </Button>
          </nav>
        )}
      </header>
      <Separator className="mb-6" />

      <main>
        {view === 'list' && (
          <div>
            <ServiceForm onCreated={handleServiceCreated} />
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                {services.length === 0 && <p className="text-muted-foreground">No services yet. Create one above.</p>}
                <div className="flex flex-col gap-2">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 border border-border rounded-lg cursor-pointer hover:bg-accent flex gap-4 items-center"
                      onClick={() => { setCurrentService(s); setView('edit') }}
                    >
                      <strong>{s.service_date}</strong>
                      {s.label && <Badge variant="secondary">{s.label}</Badge>}
                      {s.sermon_title && <span className="text-muted-foreground italic">{s.sermon_title}</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
