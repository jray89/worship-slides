import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SignupPage from './SignupPage';
import { AuthContext, type AuthContextType } from '@/hooks/auth-context';
import { renderAt } from '@/test/utils';

function renderSignup(signup: AuthContextType['signup']) {
  const ctx: AuthContextType = { user: null, loading: false, login: vi.fn(), signup, logout: vi.fn() };
  return renderAt(
    <AuthContext.Provider value={ctx}>
      <SignupPage />
    </AuthContext.Provider>,
  );
}

async function fill(confirmation = 'secret1') {
  await userEvent.type(screen.getByLabelText('First name'), 'Jay');
  await userEvent.type(screen.getByLabelText('Last name'), 'Ray');
  await userEvent.type(screen.getByLabelText('Email'), 'jay@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'secret1');
  await userEvent.type(screen.getByLabelText('Confirm password'), confirmation);
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
}

describe('SignupPage', () => {
  it('submits the new account details', async () => {
    const signup = vi.fn().mockResolvedValue(undefined);
    renderSignup(signup);

    await fill();

    expect(signup).toHaveBeenCalledWith({
      first_name: 'Jay',
      last_name: 'Ray',
      email: 'jay@example.com',
      password: 'secret1',
      password_confirmation: 'secret1',
    });
  });

  it('rejects mismatched passwords without calling the API', async () => {
    const signup = vi.fn();
    renderSignup(signup);

    await fill('secret2');

    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    expect(signup).not.toHaveBeenCalled();
  });

  it('shows server errors', async () => {
    renderSignup(vi.fn().mockRejectedValue(new Error('Email has already been taken')));

    await fill();

    expect(await screen.findByText('Email has already been taken')).toBeInTheDocument();
  });

  it('shows a generic error for non-Error failures', async () => {
    renderSignup(vi.fn().mockRejectedValue(null));

    await fill();

    expect(await screen.findByText('Signup failed')).toBeInTheDocument();
  });

  it('disables the button while the account is being created', async () => {
    renderSignup(() => new Promise(() => {}));

    await fill();

    expect(screen.getByRole('button', { name: 'Creating account...' })).toBeDisabled();
  });
});
