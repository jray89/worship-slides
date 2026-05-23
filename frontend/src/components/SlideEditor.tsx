import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiFetch } from '@/lib/api';

interface SlideEditorProps {
  service: any;
  slides: any[];
  onSlidesChanged: () => void;
  onServiceUpdated: (service: any) => void;
}

export default function SlideEditor({
  service,
  slides,
  onSlidesChanged,
  onServiceUpdated,
}: SlideEditorProps) {
  const [slideType, setSlideType] = useState('psalm');
  const [psalmNumber, setPsalmNumber] = useState('');
  const [verseStart, setVerseStart] = useState('');
  const [verseEnd, setVerseEnd] = useState('');
  const [psalmVersion, setPsalmVersion] = useState('first');
  const [scriptureRef, setScriptureRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState(false);
  const [sermonTitle, setSermonTitle] = useState(service.sermon_title || '');
  const [sermonReference, setSermonReference] = useState(
    service.sermon_reference || '',
  );

  async function addSlide() {
    setLoading(true);
    try {
      const body: any = { slide: { slide_type: slideType } };
      if (slideType === 'psalm') {
        body.slide.psalm_number = parseInt(psalmNumber);
        body.slide.verse_start = parseInt(verseStart);
        body.slide.verse_end = parseInt(verseEnd);
        body.slide.psalm_version = psalmVersion;
      } else if (slideType === 'scripture' || slideType === 'key_verse') {
        body.slide.scripture_reference = scriptureRef;
      }

      const res = await apiFetch(`/services/${service.id}/slides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        onSlidesChanged();
        setPsalmNumber('');
        setVerseStart('');
        setVerseEnd('');
        setScriptureRef('');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add slide');
      }
    } finally {
      setLoading(false);
    }
  }

  async function removeSlide(slideId: number) {
    await apiFetch(`/services/${service.id}/slides/${slideId}`, {
      method: 'DELETE',
    });
    onSlidesChanged();
  }

  async function moveSlide(slideId: number, direction: 'up' | 'down') {
    await apiFetch(`/services/${service.id}/slides/${slideId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    onSlidesChanged();
  }

  async function updateService() {
    const res = await apiFetch(`/services/${service.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: {
          sermon_title: sermonTitle,
          sermon_reference: sermonReference,
        },
      }),
    });
    if (res.ok) {
      onServiceUpdated(await res.json());
      setEditingService(false);
    }
  }

  function slideDescription(slide: any): string {
    switch (slide.slide_type) {
      case 'welcome':
        return 'Welcome Slide';
      case 'closing':
        return 'Closing Slide';
      case 'psalm': {
        const ref = slide.verse_start
          ? `${slide.psalm_number}:${slide.verse_start}-${slide.verse_end}`
          : `${slide.psalm_number}`;
        return `Psalm ${ref} (${slide.psalm_version})`;
      }
      case 'private_prayer':
        return 'Private Prayer';
      case 'scripture':
        return `Scripture: ${slide.scripture_reference}`;
      case 'key_verse':
        return `Key Verse: ${slide.scripture_reference}`;
      default:
        return slide.slide_type;
    }
  }

  function slidePageCount(slide: any): number {
    if (!slide.content_data) return 1;
    if (slide.slide_type === 'psalm')
      return slide.content_data.stanzas?.length || 0;
    if (slide.slide_type === 'scripture')
      return slide.content_data.pages?.length || 0;
    return 1;
  }

  return (
    <>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold'>
          {service.service_date} {service.label}
        </h2>
        {!editingService ? (
          <div className='flex gap-3 items-center mt-2'>
            <span>
              <strong>{service.sermon_title || '(no sermon title)'}</strong> —{' '}
              {service.sermon_reference || '(no reference)'}
            </span>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => setEditingService(true)}
            >
              Edit
            </Button>
          </div>
        ) : (
          <div className='flex gap-3 mt-2 flex-wrap'>
            <Input
              value={sermonTitle}
              onChange={(e) => setSermonTitle(e.target.value)}
              placeholder='Sermon title'
              className='flex-1'
            />
            <Input
              value={sermonReference}
              onChange={(e) => setSermonReference(e.target.value)}
              placeholder='Reference'
            />
            <Button onClick={updateService}>Save</Button>
            <Button
              variant='secondary'
              onClick={() => setEditingService(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      {/* Slide list */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-3'>
          Slides ({slides.reduce((acc, s) => acc + slidePageCount(s), 0)} pages)
        </h3>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className='flex items-center gap-3 p-2.5 border border-border rounded-lg mb-1'
          >
            <span className='font-bold text-muted-foreground w-8'>
              {index + 1}.
            </span>
            <span className='flex-1'>{slideDescription(slide)}</span>
            <Badge variant='outline'>{slidePageCount(slide)} pages</Badge>
            <div className='flex gap-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => moveSlide(slide.id, 'up')}
                disabled={index === 0}
              >
                &uarr;
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => moveSlide(slide.id, 'down')}
                disabled={index === slides.length - 1}
              >
                &darr;
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => removeSlide(slide.id)}
              >
                &times;
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add slide form */}
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Add Slide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4 mb-4 flex-wrap'>
            <div className='flex flex-col gap-1.5'>
              <Label>Type</Label>
              <Select
                value={slideType}
                onValueChange={(v) => v && setSlideType(v)}
              >
                <SelectTrigger className='w-[200px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='welcome'>Welcome</SelectItem>
                  <SelectItem value='psalm'>Psalm</SelectItem>
                  <SelectItem value='scripture'>Scripture Reading</SelectItem>
                  <SelectItem value='private_prayer'>Private Prayer</SelectItem>
                  <SelectItem value='closing'>Closing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {slideType === 'psalm' && (
            <div className='flex gap-4 mb-4 flex-wrap items-end'>
              <div className='flex flex-col gap-1.5'>
                <Label>Psalm #</Label>
                <Input
                  type='number'
                  min={1}
                  max={150}
                  value={psalmNumber}
                  onChange={(e) => setPsalmNumber(e.target.value)}
                  placeholder='23'
                  className='w-24'
                />
              </div>
              <div className='flex flex-col gap-1.5'>
                <Label>
                  From verse{' '}
                  <span className='font-normal text-muted-foreground'>
                    (optional)
                  </span>
                </Label>
                <Input
                  type='number'
                  min={1}
                  value={verseStart}
                  onChange={(e) => setVerseStart(e.target.value)}
                  placeholder='whole psalm'
                  className='w-28'
                />
              </div>
              <div className='flex flex-col gap-1.5'>
                <Label>
                  To verse{' '}
                  <span className='font-normal text-muted-foreground'>
                    (optional)
                  </span>
                </Label>
                <Input
                  type='number'
                  min={1}
                  value={verseEnd}
                  onChange={(e) => setVerseEnd(e.target.value)}
                  placeholder='whole psalm'
                  className='w-28'
                />
              </div>
              <div className='flex flex-col gap-1.5'>
                <Label>Version</Label>
                <Select
                  value={psalmVersion}
                  onValueChange={(v) => v && setPsalmVersion(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='first'>First</SelectItem>
                    <SelectItem value='second'>Second</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {(slideType === 'scripture' || slideType === 'key_verse') && (
            <div className='flex gap-4 mb-4 flex-wrap'>
              <div className='flex flex-col gap-1.5 flex-1 min-w-[200px]'>
                <Label>Reference</Label>
                <Input
                  type='text'
                  value={scriptureRef}
                  onChange={(e) => setScriptureRef(e.target.value)}
                  placeholder='e.g. Titus 2 or Titus 2:1'
                />
              </div>
            </div>
          )}

          <Button onClick={addSlide} disabled={loading}>
            {loading ? 'Fetching content...' : 'Add Slide'}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
