import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ServicePreviewPage from './ServicePreviewPage';
import { mockFetch, renderAt, service } from '@/test/utils';
import { allPages } from '@/test/pages';

function renderPreview() {
  return renderAt(<ServicePreviewPage />, { path: '/services/7/preview', pattern: '/services/:id/preview' });
}

describe('ServicePreviewPage', () => {
  it('shows the slides and the title card', async () => {
    mockFetch({
      'GET /api/services/7': service,
      'GET /api/services/7/preview_data': { pages: allPages },
    });
    renderPreview();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('Slide 1 of 7')).toBeInTheDocument();
    expect(screen.getByText('Title Card')).toBeInTheDocument();
    expect(screen.getByText('The Good Shepherd')).toBeInTheDocument();
    expect(screen.getByText('John 10:1-18')).toBeInTheDocument();
  });

  it('asks for a sermon title before previewing the title card', async () => {
    mockFetch({
      'GET /api/services/7': { ...service, sermon_title: null, sermon_reference: null },
      'GET /api/services/7/preview_data': { pages: [] },
    });
    renderPreview();

    expect(await screen.findByText('Set a sermon title to preview the title card.')).toBeInTheDocument();
  });

  it('renders nothing without a service id', () => {
    mockFetch({});
    renderAt(<ServicePreviewPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
