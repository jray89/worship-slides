import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';
import { AuthContext, type AuthContextType } from '@/hooks/auth-context';
import { renderAt } from '@/test/utils';

function renderLogin(login: AuthContextType['login']) {
  const ctx: AuthContextType = { user: null, loading: false, login, signup: vi.fn(), logout: vi.fn() };
  return renderAt(
    <AuthContext.Provider value={ctx}>
      <LoginPage />
    </AuthContext.Provider>,
  );
}

async function submit() {
  await userEvent.type(screen.getByLabelText('Email'), 'jay@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'secret');
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('LoginPage', () => {
  it('submits the credentials', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    renderLogin(login);

    await submit();

    expect(login).toHaveBeenCalledWith('jay@example.com', 'secret');
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  it('shows the error from a failed login', async () => {
    renderLogin(vi.fn().mockRejectedValue(new Error('Invalid email or password')));

    await submit();

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  it('shows a generic error for non-Error failures', async () => {
    renderLogin(vi.fn().mockRejectedValue('boom'));

    await submit();

    expect(await screen.findByText('Login failed')).toBeInTheDocument();
  });

  it('disables the button while signing in', async () => {
    renderLogin(() => new Promise(() => {}));

    await submit();

    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
  });
});
