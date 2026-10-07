import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ServiceForm from './ServiceForm';
import { jsonResponse, mockFetch, renderAt } from '@/test/utils';

describe('ServiceForm', () => {
  it('toggles open and closed', async () => {
    renderAt(<ServiceForm onCreated={vi.fn()} />);

    expect(screen.queryByLabelText('Date')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('New Service'));
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    await userEvent.click(screen.getByText('New Service'));
    expect(screen.queryByLabelText('Date')).not.toBeInTheDocument();
  });

  it('keeps the entered values when the API rejects the service', async () => {
    mockFetch({ 'POST /api/services': jsonResponse({ errors: ['bad'] }, 422) });
    const onCreated = vi.fn();
    renderAt(<ServiceForm onCreated={onCreated} />);

    await userEvent.click(screen.getByText('New Service'));
    await userEvent.type(screen.getByLabelText('Date'), '2026-10-04');
    await userEvent.type(screen.getByLabelText('Label'), 'PM');
    await userEvent.click(screen.getByRole('button', { name: 'Create Service' }));

    expect(onCreated).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Label')).toHaveValue('PM');
  });

  it('clears the form after a successful create', async () => {
    mockFetch({ 'POST /api/services': jsonResponse({ id: 1 }, 201) });
    const onCreated = vi.fn();
    renderAt(<ServiceForm onCreated={onCreated} />);

    await userEvent.click(screen.getByText('New Service'));
    await userEvent.type(screen.getByLabelText('Date'), '2026-10-04');
    await userEvent.type(screen.getByLabelText('Label'), 'PM');
    await userEvent.click(screen.getByRole('button', { name: 'Create Service' }));

    expect(onCreated).toHaveBeenCalledWith({ id: 1 });
    expect(screen.getByLabelText('Label')).toHaveValue('');
  });
});
