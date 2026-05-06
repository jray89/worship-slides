import React from 'react'
import TitleCard from './slides/TitleCard'

export default function TitleCardPreview({ service }: { service: { sermon_title: string; sermon_reference: string } }) {
  if (!service.sermon_title) return <p className="text-muted-foreground mt-6">Set a sermon title to preview the title card.</p>

  return (
    <div className="mt-6 text-center">
      <h3 className="text-lg font-semibold mb-3">Title Card</h3>
      <div className="inline-block border border-dashed border-border origin-top-center" style={{ transform: 'scale(0.45)' }}>
        <TitleCard sermonTitle={service.sermon_title} sermonReference={service.sermon_reference} />
      </div>
    </div>
  )
}
