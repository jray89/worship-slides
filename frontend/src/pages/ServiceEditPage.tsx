import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SlideEditor from '@/components/SlideEditor';
import { apiFetch } from '@/lib/api';

export default function ServiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [slides, setSlides] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchService(id);
      fetchSlides(id);
    }
  }, [id]);

  async function fetchService(serviceId: string) {
    const res = await apiFetch(`/services/${serviceId}`);
    setService(await res.json());
  }

  async function fetchSlides(serviceId: string) {
    const res = await apiFetch(`/services/${serviceId}/slides`);
    setSlides(await res.json());
  }

  if (!service) return <p className='text-muted-foreground'>Loading...</p>;

  return (
    <SlideEditor
      service={service}
      slides={slides}
      onSlidesChanged={() => fetchSlides(id!)}
      onServiceUpdated={(s) => setService(s)}
    />
  );
}
