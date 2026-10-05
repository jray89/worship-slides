import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import TitleCard from './slides/TitleCard';
import type { PrintData } from '@/lib/types';

type TitleCardData = Pick<PrintData, 'sermon_title' | 'sermon_reference'>;

export default function PrintTitleCardView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  // During PNG export the backend embeds the title data, so no fetch is needed.
  const [service, setService] = useState<TitleCardData | null>(
    () => window.__PRINT_DATA__ ?? null,
  );

  useEffect(() => {
    if (window.__PRINT_DATA__) return;
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`/api/services/${id}`, { headers })
      .then((r) => r.json())
      .then((data) => setService(data));
  }, [id, token]);

  if (!service) return <div id="print-loading">Loading...</div>;

  return (
    <div
      id="print-ready"
      data-print-ready="true"
      style={{ background: 'transparent' }}
    >
      <TitleCard
        sermonTitle={service.sermon_title ?? ''}
        sermonReference={service.sermon_reference ?? ''}
      />
    </div>
  );
}
