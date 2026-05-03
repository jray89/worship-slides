import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TitleCard from './slides/TitleCard';

export default function PrintTitleCardView() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/services/${id}`)
      .then((r) => r.json())
      .then((data) => setService(data));
  }, [id]);

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
