import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import SlideCarousel from '@/components/SlideCarousel'
import TitleCardPreview from '@/components/TitleCardPreview'
import { apiFetch } from '@/lib/api'
import type { RenderedPage, Service } from '@/lib/types'

export default function ServicePreviewPage() {
  const { id } = useParams<{ id: string }>()
  const [service, setService] = useState<Service | null>(null)
  const [pages, setPages] = useState<RenderedPage[]>([])

  useEffect(() => {
    if (!id) return
    apiFetch(`/services/${id}`)
      .then((res) => res.json())
      .then(setService)
    apiFetch(`/services/${id}/preview_data`)
      .then((res) => res.json())
      .then((data: { pages: RenderedPage[] }) => setPages(data.pages))
  }, [id])

  if (!service) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div>
      <SlideCarousel pages={pages} />
      <TitleCardPreview service={service} />
    </div>
  )
}
