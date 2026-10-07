import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AppLayout from './AppLayout';
import { AuthContext, type AuthContextType } from '@/hooks/auth-context';
import { setToken } from '@/lib/api';

const user = { id: 1, email: 'jay@example.com', first_name: 'Jay', last_name: 'Ray', name: 'Jay Ray' };

function renderLayout(path: string, authUser: AuthContextType['user'] = user) {
  const logout = vi.fn();
  const ctx: AuthContextType = { user: authUser, loading: false, login: vi.fn(), signup: vi.fn(), logout };
  render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path='/services' element={<p>list outlet</p>} />
            <Route path='/services/:id/edit' element={<p>edit outlet</p>} />
            <Route path='/services/:id/preview' element={<p>preview outlet</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  return { logout };
}

describe('AppLayout', () => {
  it('shows the user and lets them log out on the list page', async () => {
    const { logout } = renderLayout('/services');

    expect(screen.getByText('list outlet')).toBeInTheDocument();
    expect(screen.queryByText('Edit Slides')).not.toBeInTheDocument();
    expect(screen.getByText('Jay Ray')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Jay Ray').querySelector('button')!);
    expect(logout).toHaveBeenCalled();
  });

  it('shows export links and edit/preview tabs for a service', async () => {
    setToken('tok');
    renderLayout('/services/7/edit');

    expect(screen.getByText('edit outlet')).toBeInTheDocument();
    const nav = screen.getByRole('navigation');
    expect(nav.querySelectorAll('a')[0]).toHaveAttribute('href', '/api/services/7/export_pdf?token=tok');
    expect(nav.querySelectorAll('a')[1]).toHaveAttribute('href', '/api/services/7/export_title_card?token=tok');

    await userEvent.click(screen.getByText('Preview'));
    expect(screen.getByText('preview outlet')).toBeInTheDocument();
  });

  it('offers exports and logout in the mobile menu', async () => {
    const { logout } = renderLayout('/services/7/preview');

    const [menuButton] = screen.getAllByRole('button').filter((b) => b.className.includes('md:hidden'));
    await userEvent.click(menuButton);

    const items = await screen.findAllByRole('menuitem');
    expect(items.map((i) => i.textContent?.trim())).toEqual(['Slides', 'Title', 'Jay Ray', 'Logout']);
    expect(items[0]).toHaveAttribute('href', '/api/services/7/export_pdf');

    await userEvent.click(items[3]);
    expect(logout).toHaveBeenCalled();
  });

  it('shows only exports in the menu when nobody is signed in', async () => {
    renderLayout('/services/7/edit', null);

    const [menuButton] = screen.getAllByRole('button').filter((b) => b.className.includes('md:hidden'));
    await userEvent.click(menuButton);

    const items = await screen.findAllByRole('menuitem');
    expect(items.map((i) => i.textContent?.trim())).toEqual(['Slides', 'Title']);
  });

  it('has no menu without a user or a service', () => {
    renderLayout('/services', null);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
