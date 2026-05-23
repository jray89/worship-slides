import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { Minus, Plus } from 'lucide-react';

interface ServiceFormProps {
  onCreated: (service: any) => void;
}

export default function ServiceForm({ onCreated }: ServiceFormProps) {
  const [date, setDate] = useState('');
  const [label, setLabel] = useState('');
  const [sermonTitle, setSermonTitle] = useState('');
  const [sermonReference, setSermonReference] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiFetch('/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: {
          service_date: date,
          label,
          sermon_title: sermonTitle,
          sermon_reference: sermonReference,
        },
      }),
    });
    if (res.ok) {
      onCreated(await res.json());
      setDate('');
      setLabel('');
      setSermonTitle('');
      setSermonReference('');
    }
  }

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle
          className='flex gap-2 cursor-pointer'
          onClick={() => setFormOpen(!formOpen)}
        >
          {formOpen ? <Minus size={22} /> : <Plus size={22} />}
          New Service
        </CardTitle>
      </CardHeader>
      {formOpen && (
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className='flex gap-4 mb-4 flex-wrap'>
              <div className='flex flex-col gap-1.5 flex-1 min-w-[150px]'>
                <Label htmlFor='service-date'>Date</Label>
                <Input
                  id='service-date'
                  type='date'
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className='flex flex-col gap-1.5 flex-1 min-w-[150px]'>
                <Label htmlFor='service-label'>Label</Label>
                <Input
                  id='service-label'
                  type='text'
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder='AM, PM, Wednesday...'
                />
              </div>
            </div>
            <div className='flex gap-4 mb-4 flex-wrap'>
              <div className='flex flex-col gap-1.5 flex-1 min-w-[150px]'>
                <Label htmlFor='sermon-title'>Sermon Title</Label>
                <Input
                  id='sermon-title'
                  type='text'
                  value={sermonTitle}
                  onChange={(e) => setSermonTitle(e.target.value)}
                  placeholder='e.g. Spiritually Healthy Old Men'
                />
              </div>
              <div className='flex flex-col gap-1.5 flex-1 min-w-[150px]'>
                <Label htmlFor='sermon-ref'>Sermon Reference</Label>
                <Input
                  id='sermon-ref'
                  type='text'
                  value={sermonReference}
                  onChange={(e) => setSermonReference(e.target.value)}
                  placeholder='e.g. Titus 2:2'
                />
              </div>
            </div>
            <Button type='submit'>Create Service</Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
