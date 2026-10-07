import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ServiceListPage from './ServiceListPage';
import { setToken } from '@/lib/api';
import { jsonResponse, mockFetch, renderAt, requestBody, service } from '@/test/utils';

const evening = { id: 8, service_date: '2026-10-04', label: null, sermon_title: null, sermon_reference: null };

function renderList() {
  return renderAt(<ServiceListPage />, {
    path: '/services',
    pattern: '/services',
    extraRoutes: { '/services/:id/edit': <p>edit page</p> },
  });
}

describe('ServiceListPage', () => {
  it('explains what to do when there are no services', async () => {
    mockFetch({ 'GET /api/services': [] });
    renderList();

    expect(await screen.findByText('No services yet. Create one above.')).toBeInTheDocument();
  });

  it('lists services with token-authenticated download links', async () => {
    setToken('a b');
    mockFetch({ 'GET /api/services': [service, evening] });
    renderList();

    expect(await screen.findByText('The Good Shepherd')).toBeInTheDocument();
    expect(screen.getByText('AM')).toBeInTheDocument();
    const [slides] = screen.getAllByRole('link', { name: 'Download slides' });
    expect(slides).toHaveAttribute('href', '/api/services/7/export_pdf?token=a%20b');
    expect(screen.getAllByRole('link', { name: 'Download title card' })[1]).toHaveAttribute(
      'href',
      '/api/services/8/export_title_card?token=a%20b',
    );
  });

  it('download links do not open the service', async () => {
    mockFetch({ 'GET /api/services': [service] });
    renderList();

    const link = await screen.findByRole('link', { name: 'Download slides' });
    expect(link).toHaveAttribute('href', '/api/services/7/export_pdf');
    link.addEventListener('click', (e) => e.preventDefault());
    await userEvent.click(link);
    await userEvent.click(screen.getByRole('link', { name: 'Download title card' }));

    expect(screen.queryByText('edit page')).not.toBeInTheDocument();
  });

  it('opens a service when its row is clicked', async () => {
    mockFetch({ 'GET /api/services': [service] });
    renderList();

    await userEvent.click(await screen.findByText('2026-10-04'));

    expect(screen.getByText('edit page')).toBeInTheDocument();
  });

  it('deletes a service after confirmation', async () => {
    let services = [service, evening];
    const fetchMock = mockFetch({
      'GET /api/services': () => services,
      'DELETE /api/services/7': () => {
        services = [evening];
        return jsonResponse(null, 204);
      },
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderList();

    const rows = await screen.findAllByRole('button', { name: 'Delete service' });
    await userEvent.click(rows[0]);

    await waitFor(() => expect(screen.queryByText('The Good Shepherd')).not.toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith('/api/services/7', expect.objectContaining({ method: 'DELETE' }));
    expect(screen.queryByText('edit page')).not.toBeInTheDocument();
  });

  it('keeps the service when deletion is cancelled', async () => {
    const fetchMock = mockFetch({ 'GET /api/services': [service] });
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderList();

    await userEvent.click(await screen.findByRole('button', { name: 'Delete service' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('creates a service and opens it', async () => {
    const fetchMock = mockFetch({
      'GET /api/services': [],
      'POST /api/services': jsonResponse(service, 201),
    });
    renderList();

    await userEvent.click(screen.getByText('New Service'));
    const form = screen.getByRole('button', { name: 'Create Service' }).closest('form')!;
    await userEvent.type(within(form).getByLabelText('Date'), '2026-10-04');
    await userEvent.type(within(form).getByLabelText('Label'), 'AM');
    await userEvent.type(within(form).getByLabelText('Sermon Title'), 'The Good Shepherd');
    await userEvent.type(within(form).getByLabelText('Sermon Reference'), 'John 10:1-18');
    await userEvent.click(screen.getByRole('button', { name: 'Create Service' }));

    expect(await screen.findByText('edit page')).toBeInTheDocument();
    expect(requestBody(fetchMock, 'POST /api/services')).toEqual({
      service: {
        service_date: '2026-10-04',
        label: 'AM',
        sermon_title: 'The Good Shepherd',
        sermon_reference: 'John 10:1-18',
      },
    });
  });
});
