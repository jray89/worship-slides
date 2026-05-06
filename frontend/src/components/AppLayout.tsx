import React from 'react'
import { Outlet, Link, NavLink, useMatch } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function AppLayout() {
  const match = useMatch('/services/:id/*')
  const serviceId = match?.params.id

  return (
    <div className="max-w-6xl mx-auto p-5">
      <header className="flex justify-between items-center py-4 mb-6">
        <Link to="/services">
          <h1 className="text-2xl font-bold cursor-pointer">Worship Slides</h1>
        </Link>
        {serviceId && (
          <nav className="flex gap-3 items-center">
            <NavLink to={`/services/${serviceId}/edit`}>
              {({ isActive }) => (
                <Button variant={isActive ? 'default' : 'outline'} size="sm">
                  Edit Slides
                </Button>
              )}
            </NavLink>
            <NavLink to={`/services/${serviceId}/preview`}>
              {({ isActive }) => (
                <Button variant={isActive ? 'default' : 'outline'} size="sm">
                  Preview
                </Button>
              )}
            </NavLink>
            <Button size="sm" render={<a href={`/api/services/${serviceId}/export_pdf`} />}>
              Export PDF
            </Button>
            <Button size="sm" render={<a href={`/api/services/${serviceId}/export_title_card`} />}>
              Export Title Card
            </Button>
          </nav>
        )}
      </header>
      <Separator className="mb-6" />

      <main>
        <Outlet />
      </main>
    </div>
  )
}
