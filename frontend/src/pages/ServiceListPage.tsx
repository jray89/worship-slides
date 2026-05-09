import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ServiceForm from '@/components/ServiceForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { apiFetch } from '@/lib/api'

interface Service {
  id: number
  service_date: string
  label: string
  sermon_title: string
  sermon_reference: string
}

export default function ServiceListPage() {
  const [services, setServices] = useState<Service[]>([])
  const navigate = useNavigate()

  useEffect(() => { fetchServices() }, [])

  async function fetchServices() {
    const res = await apiFetch('/services')
    setServices(await res.json())
  }

  async function handleServiceCreated(service: Service) {
    await fetchServices()
    navigate(`/services/${service.id}/edit`)
  }

  async function deleteService(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    if (!window.confirm('Delete this service and all its slides?')) return
    await apiFetch(`/services/${id}`, { method: 'DELETE' })
    await fetchServices()
  }

  return (
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
                onClick={() => navigate(`/services/${s.id}/edit`)}
              >
                <strong>{s.service_date}</strong>
                {s.label && <Badge variant="secondary">{s.label}</Badge>}
                {s.sermon_title && <span className="text-muted-foreground italic">{s.sermon_title}</span>}
                <span className="ml-auto">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => deleteService(e, s.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
