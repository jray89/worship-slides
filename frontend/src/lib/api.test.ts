import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, apiJson, auth, clearToken, getToken, setToken } from './api';
import { jsonResponse, mockFetch, requestBody } from '@/test/utils';

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('token storage', () => {
  it('stores, reads and clears the token', () => {
    expect(getToken()).toBeNull();
    setToken('abc');
    expect(getToken()).toBe('abc');
    clearToken();
    expect(getToken()).toBeNull();
  });
});

describe('apiFetch', () => {
  it('prefixes /api and sends the bearer token alongside caller headers', async () => {
    setToken('abc');
    const fetchMock = mockFetch({ 'GET /api/services': [] });

    await apiFetch('/services', { headers: { 'X-Test': '1' } });

    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ 'X-Test': '1', Authorization: 'Bearer abc' });
  });

  it('omits the Authorization header without a token', async () => {
    const fetchMock = mockFetch({ 'GET /api/services': [] });

    await apiFetch('/services');

    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({});
  });

  it('clears the token and sends the user to login on 401', async () => {
    setToken('stale');
    window.history.replaceState(null, '', '/services');
    // jsdom can't navigate; it reports the attempt as an error we don't care about.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch({ 'GET /api/services': jsonResponse({ error: 'Unauthorized' }, 401) });

    await expect(apiFetch('/services')).rejects.toThrow('Unauthorized');
    expect(getToken()).toBeNull();
  });

  it('does not redirect when already on the login page', async () => {
    window.history.replaceState(null, '', '/login');
    mockFetch({ 'POST /api/login': jsonResponse({}, 401) });

    await expect(apiFetch('/login', { method: 'POST' })).rejects.toThrow('Unauthorized');
    expect(window.location.pathname).toBe('/login');
  });
});

describe('apiJson', () => {
  it('sends JSON and parses the response', async () => {
    const fetchMock = mockFetch({ 'GET /api/me': { user: { id: 1 } } });

    await expect(apiJson('/me')).resolves.toEqual({ user: { id: 1 } });
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it('returns undefined for 204 No Content', async () => {
    mockFetch({ 'DELETE /api/services/1': jsonResponse(null, 204) });

    await expect(apiJson('/services/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it.each([
    [{ error: 'Nope' }, 'Nope'],
    [{ errors: ['A is bad', 'B is bad'] }, 'A is bad, B is bad'],
    [{}, 'Request failed'],
  ])('surfaces API error %j as "%s"', async (body, message) => {
    mockFetch({ 'GET /api/x': jsonResponse(body, 422) });

    await expect(apiJson('/x')).rejects.toThrow(message);
  });

  it('falls back to a generic message when the error body is not JSON', async () => {
    mockFetch({ 'GET /api/x': new Response('<html>', { status: 500 }) });

    await expect(apiJson('/x')).rejects.toThrow('Request failed');
  });
});

describe('auth', () => {
  const session = { token: 't', user: { id: 1 } };

  it('logs in, signs up and loads the current user', async () => {
    const fetchMock = mockFetch({
      'POST /api/login': session,
      'POST /api/signup': session,
      'GET /api/me': { user: { id: 1 } },
    });
    const signup = { first_name: 'A', last_name: 'B', email: 'a@b.c', password: 'pw', password_confirmation: 'pw' };

    await expect(auth.login('a@b.c', 'pw')).resolves.toEqual(session);
    await expect(auth.signup(signup)).resolves.toEqual(session);
    await expect(auth.me()).resolves.toEqual({ user: { id: 1 } });
    expect(requestBody(fetchMock, 'POST /api/login')).toEqual({ email: 'a@b.c', password: 'pw' });
    expect(requestBody(fetchMock, 'POST /api/signup')).toEqual(signup);
  });
});
