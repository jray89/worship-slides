import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from './AuthProvider';
import { GuestRoute, ProtectedRoute } from './RouteGuards';
import { useAuth } from '@/hooks/useAuth';
import { getToken, setToken } from '@/lib/api';
import { jsonResponse, mockFetch } from '@/test/utils';

const user = { id: 1, email: 'jay@example.com', first_name: 'Jay', last_name: 'Ray', name: 'Jay Ray' };

function Controls() {
  const { user, login, signup, logout } = useAuth();
  return (
    <>
      <p>user: {user?.name ?? 'none'}</p>
      <button onClick={() => login('jay@example.com', 'pw')}>login</button>
      <button
        onClick={() =>
          signup({ first_name: 'Jay', last_name: 'Ray', email: 'jay@example.com', password: 'pw', password_confirmation: 'pw' })
        }
      >
        signup
      </button>
      <button onClick={logout}>logout</button>
    </>
  );
}

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path='/login' element={<GuestRoute><p>login page</p></GuestRoute>} />
          <Route path='/services' element={<ProtectedRoute><p>services page</p></ProtectedRoute>} />
          <Route path='/controls' element={<Controls />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('useAuth', () => {
  it('throws outside an AuthProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Controls />)).toThrow('useAuth must be used within an AuthProvider');
  });
});

describe('AuthProvider and route guards', () => {
  it('sends signed-out visitors from protected pages to login', () => {
    renderApp('/services');

    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('restores the session from a stored token', async () => {
    setToken('good');
    mockFetch({ 'GET /api/me': { user } });

    renderApp('/services');

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('services page')).toBeInTheDocument();
  });

  it('sends signed-in users away from guest pages', async () => {
    setToken('good');
    mockFetch({ 'GET /api/me': { user } });

    renderApp('/login');

    expect(await screen.findByText('services page')).toBeInTheDocument();
  });

  it('drops a stored token the API rejects', async () => {
    setToken('bad');
    window.history.replaceState(null, '', '/login');
    mockFetch({ 'GET /api/me': jsonResponse({}, 401) });

    renderApp('/services');

    expect(await screen.findByText('login page')).toBeInTheDocument();
    expect(getToken()).toBeNull();
    window.history.replaceState(null, '', '/');
  });

  it('logs in, signs up and logs out', async () => {
    mockFetch({
      'POST /api/login': { token: 'from-login', user },
      'POST /api/signup': { token: 'from-signup', user },
    });
    renderApp('/controls');

    await userEvent.click(screen.getByText('login'));
    expect(await screen.findByText('user: Jay Ray')).toBeInTheDocument();
    expect(getToken()).toBe('from-login');

    await userEvent.click(screen.getByText('logout'));
    expect(screen.getByText('user: none')).toBeInTheDocument();
    expect(getToken()).toBeNull();

    await userEvent.click(screen.getByText('signup'));
    expect(await screen.findByText('user: Jay Ray')).toBeInTheDocument();
    expect(getToken()).toBe('from-signup');
  });
});
