import { createEvent, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SlideEditor from './SlideEditor';
import type { Slide } from '@/lib/types';
import { jsonResponse, mockFetch, renderAt, requestBody, service } from '@/test/utils';

function slide(id: number, overrides: Partial<Slide> = {}): Slide {
  return {
    id,
    service_id: service.id,
    position: id,
    slide_type: 'welcome',
    psalm_number: null,
    psalm_version: null,
    verse_start: null,
    verse_end: null,
    scripture_reference: null,
    content_data: null,
    ...overrides,
  };
}

const slides = [
  slide(1),
  slide(2, { slide_type: 'psalm', psalm_number: 23, content_data: { stanzas: [{}, {}] } }),
  slide(3, { slide_type: 'closing' }),
];

function renderEditor(props: Partial<Parameters<typeof SlideEditor>[0]> = {}) {
  const callbacks = { onSlidesChanged: vi.fn(), onServiceUpdated: vi.fn() };
  renderAt(<SlideEditor service={service} slides={slides} {...callbacks} {...props} />);
  return callbacks;
}

async function chooseOption(trigger: HTMLElement, name: string) {
  await userEvent.click(trigger);
  await userEvent.click(await screen.findByRole('option', { name }));
}

describe('SlideEditor', () => {
  it('lists slides with descriptions and a total page count', () => {
    renderEditor();

    expect(screen.getByText('Slides (4 pages)')).toBeInTheDocument();
    expect(screen.getByText('Psalm 23')).toBeInTheDocument();
    expect(screen.getAllByText(/^\d+ pages$/).map((b) => b.textContent)).toEqual(['1 pages', '2 pages', '1 pages']);
  });

  it('shows placeholders for a service without sermon details', () => {
    renderEditor({ service: { ...service, sermon_title: null, sermon_reference: null } });

    expect(screen.getByText('(no sermon title)')).toBeInTheDocument();
    expect(screen.getByText('(no reference)', { exact: false })).toBeInTheDocument();
  });

  it('edits the sermon title and reference', async () => {
    const updated = { ...service, sermon_title: 'New Title', sermon_reference: 'Ps 1' };
    const fetchMock = mockFetch({ 'PATCH /api/services/7': updated });
    const { onServiceUpdated } = renderEditor();

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const title = screen.getByPlaceholderText('Sermon title');
    await userEvent.clear(title);
    await userEvent.type(title, 'New Title');
    const ref = screen.getByPlaceholderText('Reference');
    await userEvent.clear(ref);
    await userEvent.type(ref, 'Ps 1');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onServiceUpdated).toHaveBeenCalledWith(updated);
    expect(requestBody(fetchMock, 'PATCH /api/services/7')).toEqual({
      service: { sermon_title: 'New Title', sermon_reference: 'Ps 1' },
    });
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('stays in edit mode when saving fails, and can be cancelled', async () => {
    mockFetch({ 'PATCH /api/services/7': jsonResponse({ errors: ['x'] }, 422) });
    const { onServiceUpdated } = renderEditor();

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onServiceUpdated).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('adds a psalm slide with its verse range and version', async () => {
    const fetchMock = mockFetch({ 'POST /api/services/7/slides': jsonResponse({}, 201) });
    const { onSlidesChanged } = renderEditor();

    await userEvent.type(screen.getByPlaceholderText('23'), '23');
    const [from, to] = screen.getAllByPlaceholderText('whole psalm');
    await userEvent.type(from, '1');
    await userEvent.type(to, '3');
    await chooseOption(screen.getAllByRole('combobox')[1], 'Second');
    await userEvent.click(screen.getByRole('button', { name: 'Add Slide' }));

    await waitFor(() => expect(onSlidesChanged).toHaveBeenCalled());
    expect(requestBody(fetchMock, 'POST /api/services/7/slides')).toEqual({
      slide: { slide_type: 'psalm', psalm_number: 23, verse_start: 1, verse_end: 3, psalm_version: 'second' },
    });
    expect(screen.getByPlaceholderText('23')).toHaveValue(null);
  });

  it('adds a scripture reading by reference', async () => {
    const fetchMock = mockFetch({ 'POST /api/services/7/slides': jsonResponse({}, 201) });
    renderEditor();

    await chooseOption(screen.getAllByRole('combobox')[0], 'Scripture Reading');
    await userEvent.type(screen.getByPlaceholderText('e.g. Titus 2 or Titus 2:1'), 'Titus 2');
    await userEvent.click(screen.getByRole('button', { name: 'Add Slide' }));

    await waitFor(() =>
      expect(requestBody(fetchMock, 'POST /api/services/7/slides')).toEqual({
        slide: { slide_type: 'scripture', scripture_reference: 'Titus 2' },
      }),
    );
  });

  it('adds a fixed slide with only its type', async () => {
    const fetchMock = mockFetch({ 'POST /api/services/7/slides': jsonResponse({}, 201) });
    renderEditor();

    await chooseOption(screen.getAllByRole('combobox')[0], 'Closing');
    expect(screen.queryByPlaceholderText('23')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Add Slide' }));

    await waitFor(() =>
      expect(requestBody(fetchMock, 'POST /api/services/7/slides')).toEqual({ slide: { slide_type: 'closing' } }),
    );
  });

  it('alerts with the API error when a slide cannot be added', async () => {
    let resolve!: (r: Response) => void;
    mockFetch({ 'POST /api/services/7/slides': () => new Promise<Response>((r) => (resolve = r)) });
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { onSlidesChanged } = renderEditor();

    await userEvent.click(screen.getByRole('button', { name: 'Add Slide' }));
    expect(screen.getByRole('button', { name: 'Fetching content...' })).toBeDisabled();
    resolve(jsonResponse({ error: 'Psalm 999 not present' }, 422));

    await waitFor(() => expect(alert).toHaveBeenCalledWith('Psalm 999 not present'));
    expect(onSlidesChanged).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Add Slide' })).toBeEnabled();
  });

  it('falls back to a generic alert when the API gives no reason', async () => {
    mockFetch({ 'POST /api/services/7/slides': jsonResponse({}, 422) });
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderEditor();

    await userEvent.click(screen.getByRole('button', { name: 'Add Slide' }));

    await waitFor(() => expect(alert).toHaveBeenCalledWith('Failed to add slide'));
  });

  it('removes a slide', async () => {
    const fetchMock = mockFetch({ 'DELETE /api/services/7/slides/2': jsonResponse(null, 204) });
    const { onSlidesChanged } = renderEditor();

    await userEvent.click(screen.getAllByRole('button', { name: '×' })[1]);

    await waitFor(() => expect(onSlidesChanged).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith('/api/services/7/slides/2', expect.objectContaining({ method: 'DELETE' }));
  });

  it('moves slides up and down with the arrow buttons', async () => {
    const fetchMock = mockFetch({
      'PATCH /api/services/7/slides/2/move': jsonResponse(null, 200),
    });
    const { onSlidesChanged } = renderEditor();

    const up = screen.getAllByRole('button', { name: 'Move up' });
    const down = screen.getAllByRole('button', { name: 'Move down' });
    expect(up[0]).toBeDisabled();
    expect(down[2]).toBeDisabled();

    await userEvent.click(up[1]);
    await waitFor(() => expect(onSlidesChanged).toHaveBeenCalledTimes(1));
    expect(requestBody(fetchMock, 'PATCH /api/services/7/slides/2/move')).toEqual({ position: 1 });

    await userEvent.click(down[1]);
    await waitFor(() => expect(onSlidesChanged).toHaveBeenCalledTimes(2));
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({ position: 3 });
  });

  describe('drag and drop', () => {
    function rows() {
      return screen.getAllByText(/^\d\.$/).map((n) => n.parentElement as HTMLElement);
    }

    function dragOver(row: HTMLElement, below: boolean) {
      vi.spyOn(row, 'getBoundingClientRect').mockReturnValue({ top: 0, height: 40 } as DOMRect);
      // jsdom has no DragEvent, so clientY must be attached by hand.
      const event = createEvent.dragOver(row, { dataTransfer: { dropEffect: '' } });
      Object.defineProperty(event, 'clientY', { value: below ? 30 : 10 });
      fireEvent(row, event);
    }

    it('makes a row draggable only while its grip is held', () => {
      renderEditor();
      const grip = screen.getAllByRole('button', { name: 'Drag to reorder' })[0];

      fireEvent.pointerDown(grip);
      expect(rows()[0]).toHaveAttribute('draggable', 'true');
      fireEvent.pointerUp(grip);
      expect(rows()[0]).toHaveAttribute('draggable', 'false');
    });

    it('drops a slide below the hovered row', async () => {
      const fetchMock = mockFetch({ 'PATCH /api/services/7/slides/1/move': jsonResponse(null, 200) });
      const { onSlidesChanged } = renderEditor();
      const [first, , third] = rows();

      fireEvent.dragStart(first, { dataTransfer: { effectAllowed: '' } });
      expect(first.className).toContain('opacity-50');
      dragOver(third, true);
      expect(third.className).toContain('after:border-b-2');
      fireEvent.drop(third);

      await waitFor(() => expect(onSlidesChanged).toHaveBeenCalled());
      expect(requestBody(fetchMock, 'PATCH /api/services/7/slides/1/move')).toEqual({ position: 3 });
      expect(first.className).not.toContain('opacity-50');
    });

    it('drops a slide above the hovered row', async () => {
      const fetchMock = mockFetch({ 'PATCH /api/services/7/slides/3/move': jsonResponse(null, 200) });
      renderEditor();
      const [first, , third] = rows();

      fireEvent.dragStart(third, { dataTransfer: {} });
      dragOver(first, false);
      expect(first.className).toContain('before:border-t-2');
      fireEvent.drop(first);

      await waitFor(() =>
        expect(requestBody(fetchMock, 'PATCH /api/services/7/slides/3/move')).toEqual({ position: 1 }),
      );
    });

    it('skips the API call when the slide lands where it started', () => {
      const fetchMock = mockFetch({});
      renderEditor();
      const [first, second] = rows();

      fireEvent.dragStart(second, { dataTransfer: {} });
      dragOver(first, true);
      dragOver(first, true); // repeated hover over the same half is a no-op
      fireEvent.drop(first);

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('ignores drag-overs and drops that did not start from a row', () => {
      const fetchMock = mockFetch({});
      renderEditor();
      const [first, second] = rows();

      dragOver(first, true);
      expect(first.className).not.toContain('after:border-b-2');
      fireEvent.drop(first);

      fireEvent.dragStart(second, { dataTransfer: {} });
      fireEvent.drop(second);
      fireEvent.dragEnd(second);

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
