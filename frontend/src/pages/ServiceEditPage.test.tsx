import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import ServiceEditPage from './ServiceEditPage';
import { jsonResponse, mockFetch, renderAt, service } from '@/test/utils';

const welcome = {
  id: 1, service_id: 7, position: 1, slide_type: 'welcome', psalm_number: null, psalm_version: null,
  verse_start: null, verse_end: null, scripture_reference: null, content_data: null,
};

describe('ServiceEditPage', () => {
  it('loads the service and its slides, and refreshes after changes', async () => {
    let slides = [welcome];
    mockFetch({
      'GET /api/services/7': service,
      'GET /api/services/7/slides': () => slides,
      'POST /api/services/7/slides': () => {
        slides = [welcome, { ...welcome, id: 2, slide_type: 'closing' }];
        return jsonResponse({}, 201);
      },
      'PATCH /api/services/7': { ...service, sermon_title: 'Renamed' },
    });
    renderAt(<ServiceEditPage />, { path: '/services/7/edit', pattern: '/services/:id/edit' });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('Slides (1 pages)')).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('combobox')[0]);
    await userEvent.click(await screen.findByRole('option', { name: 'Closing' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add Slide' }));
    expect(await screen.findByText('Slides (2 pages)')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Renamed')).toBeInTheDocument();
  });

  it('waits for a service id', () => {
    mockFetch({});
    renderAt(<ServiceEditPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
