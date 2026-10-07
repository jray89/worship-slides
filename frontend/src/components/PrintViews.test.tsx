import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PrintSlidesView from './PrintSlidesView';
import PrintTitleCardView from './PrintTitleCardView';
import type { RenderedPage } from '@/lib/types';
import { mockFetch, renderAt, service } from '@/test/utils';
import { allPages } from '@/test/pages';

describe('PrintSlidesView', () => {
  it('renders embedded pages without fetching', () => {
    const fetchMock = mockFetch({});
    window.__PRINT_DATA__ = { pages: allPages };

    const { container } = renderAt(<PrintSlidesView />, { path: '/services/7/print/slides', pattern: '/services/:id/print/slides' });

    expect(fetchMock).not.toHaveBeenCalled();
    const pages = container.querySelectorAll('#print-ready > div');
    expect(pages).toHaveLength(7);
    expect(pages[0]).toHaveStyle({ breakAfter: 'page' });
    expect(pages[6]).toHaveStyle({ breakAfter: 'auto' });
  });

  it('fetches pages with the token from the query string', async () => {
    const fetchMock = mockFetch({
      'GET /api/services/7/preview_data': { pages: [{ slide_type: 'closing', content: {} }] },
    });

    renderAt(<PrintSlidesView />, { path: '/services/7/print/slides?token=abc', pattern: '/services/:id/print/slides' });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText(/Smyrna/)).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ Authorization: 'Bearer abc' });
  });

  it('fetches without auth when there is no token and skips unknown slide types', async () => {
    const fetchMock = mockFetch({
      'GET /api/services/7/preview_data': { pages: [{ slide_type: 'mystery' } as unknown as RenderedPage] },
    });

    const { container } = renderAt(<PrintSlidesView />, { path: '/services/7/print/slides', pattern: '/services/:id/print/slides' });

    expect(await screen.findByText((_, el) => el?.id === 'print-ready')).toBeInTheDocument();
    expect(container.querySelector('#print-ready > div')).toBeEmptyDOMElement();
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({});
  });
});

describe('PrintTitleCardView', () => {
  it('renders embedded title data without fetching', () => {
    const fetchMock = mockFetch({});
    window.__PRINT_DATA__ = { sermon_title: 'Embedded', sermon_reference: null };

    renderAt(<PrintTitleCardView />, { path: '/services/7/print/title_card', pattern: '/services/:id/print/title_card' });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('Embedded')).toBeInTheDocument();
  });

  it('fetches the service with the token from the query string', async () => {
    const fetchMock = mockFetch({ 'GET /api/services/7': service });

    renderAt(<PrintTitleCardView />, { path: '/services/7/print/title_card?token=abc', pattern: '/services/:id/print/title_card' });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('The Good Shepherd')).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ Authorization: 'Bearer abc' });
  });

  it('fetches without auth when there is no token', async () => {
    const fetchMock = mockFetch({ 'GET /api/services/7': { sermon_title: null, sermon_reference: 'Ps 1' } });

    renderAt(<PrintTitleCardView />, { path: '/services/7/print/title_card', pattern: '/services/:id/print/title_card' });

    expect(await screen.findByText('Ps 1')).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({});
  });
});
