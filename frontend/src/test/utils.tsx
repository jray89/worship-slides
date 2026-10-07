import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

type Handler = (init: RequestInit | undefined, url: string) => unknown;
type RouteTable = Record<string, unknown | Handler>;

export function jsonResponse(body: unknown, status = 200): Response {
  if (status === 204) return new Response(null, { status });
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Stubs global fetch with a table keyed by "METHOD /path" (method defaults to GET).
// Values are response bodies, Responses, or functions returning either.
export function mockFetch(routes: RouteTable) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    const key = `${method} ${url}`;
    if (!(key in routes)) throw new Error(`Unexpected fetch: ${key}`);
    let value = routes[key];
    if (typeof value === 'function') value = await (value as Handler)(init, url);
    return value instanceof Response ? value : jsonResponse(value);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function requestBody(fetchMock: ReturnType<typeof mockFetch>, key: string) {
  const call = fetchMock.mock.calls.find(([url, init]) => `${init?.method ?? 'GET'} ${url}` === key);
  return call ? JSON.parse(String(call[1]?.body)) : undefined;
}

// Renders `ui` at `path`, matched against `pattern` so useParams works.
export function renderAt(ui: ReactElement, { path = '/', pattern = '*', extraRoutes = {} as Record<string, ReactElement> } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={pattern} element={ui} />
        {Object.entries(extraRoutes).map(([p, el]) => (
          <Route key={p} path={p} element={el} />
        ))}
      </Routes>
    </MemoryRouter>,
  );
}

export const service = {
  id: 7,
  service_date: '2026-10-04',
  label: 'AM',
  sermon_title: 'The Good Shepherd',
  sermon_reference: 'John 10:1-18',
};
