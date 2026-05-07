import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import SlideCarousel from '@/components/SlideCarousel'
import TitleCardPreview from '@/components/TitleCardPreview'
import { apiFetch } from '@/lib/api'

interface RenderedPage {
  slide_type: string
  content: any
}

export default function ServicePreviewPage() {
  const { id } = useParams<{ id: string }>()
  const [service, setService] = useState<any>(null)
  const [pages, setPages] = useState<RenderedPage[]>([])

  useEffect(() => {
    if (id) {
      fetchService(id)
      fetchPreview(id)
    }
  }, [id])

  async function fetchService(serviceId: string) {
    const res = await apiFetch(`/services/${serviceId}`)
    setService(await res.json())
  }

  async function fetchPreview(serviceId: string) {
    const res = await apiFetch(`/services/${serviceId}/preview_data`)
    const data = await res.json()
    setPages(data.pages)
  }

  if (!service) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div>
      <SlideCarousel pages={pages} />
      <TitleCardPreview service={service} />
    </div>
  )
}
