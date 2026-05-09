import React from 'react'
import { Outlet, Link, NavLink, useMatch } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { getToken } from '@/lib/api'

export default function AppLayout() {
  const match = useMatch('/services/:id/*')
  const serviceId = match?.params.id
  const { user, logout } = useAuth()
  const token = getToken()
  const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : ''

  return (
    <div className="max-w-6xl mx-auto p-5">
      <header className="flex justify-between items-center py-4 mb-6">
        <Link to="/services">
          <h1 className="text-2xl font-bold cursor-pointer">Worship Slides</h1>
        </Link>
        <div className="flex gap-3 items-center">
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
              <Button size="sm" render={<a href={`/api/services/${serviceId}/export_pdf${tokenQuery}`} />}>
                Export PDF
              </Button>
              <Button size="sm" render={<a href={`/api/services/${serviceId}/export_title_card${tokenQuery}`} />}>
                Export Title Card
              </Button>
            </nav>
          )}
          {user && (
            <>
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          )}
        </div>
      </header>
      <Separator className="mb-6" />

      <main>
        <Outlet />
      </main>
    </div>
  )
}
