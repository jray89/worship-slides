import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import TitleCard from './slides/TitleCard';

export default function PrintTitleCardView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    const embedded = (window as any).__PRINT_DATA__;
    if (embedded) {
      setService(embedded);
      return;
    }
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
        sermonTitle={service.sermon_title}
        sermonReference={service.sermon_reference}
      />
    </div>
  );
}
