import { Outlet, Link, NavLink, useMatch } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '@/lib/api';
import { ButtonGroup } from './ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Download, LogOut, Menu, User } from 'lucide-react';

export default function AppLayout() {
  const match = useMatch('/services/:id/*');
  const serviceId = match?.params.id;
  const { user, logout } = useAuth();
  const token = getToken();
  const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
  const hasMobileMenu = Boolean(serviceId || user);
  const exportActions = serviceId
    ? [
        {
          label: 'Slides',
          href: `/api/services/${serviceId}/export_pdf${tokenQuery}`,
        },
        {
          label: 'Title',
          href: `/api/services/${serviceId}/export_title_card${tokenQuery}`,
        },
      ]
    : [];

  return (
    <div className='max-w-6xl mx-auto p-5'>
      <header className='flex justify-between items-center md:py-4'>
        <Link to='/services'>
          <h1 className='text-2xl font-bold cursor-pointer'>Worship Slides</h1>
        </Link>
        <div className='flex gap-3 items-center'>
          {serviceId && (
            <>
              <nav className='hidden gap-3 items-center md:flex'>
                {exportActions.map((action) => (
                  <Button key={action.href} render={<a href={action.href} />}>
                    <Download /> {action.label}
                  </Button>
                ))}
              </nav>
            </>
          )}
          {hasMobileMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button className='md:hidden' variant='ghost' />}
              >
                <Menu />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {exportActions.map((action) => (
                  <DropdownMenuItem
                    key={action.href}
                    render={<a href={action.href} />}
                  >
                    <Download /> {action.label}
                  </DropdownMenuItem>
                ))}
                {exportActions.length > 0 && user && <DropdownMenuSeparator />}
                {user && (
                  <>
                    <DropdownMenuItem>
                      <User /> {user.name}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant='destructive' onClick={logout}>
                      <LogOut /> Logout
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {user && (
            <>
              <span className='hidden items-center text-sm text-muted-foreground md:flex'>
                {user.name}
                <Button variant='ghost' onClick={logout}>
                  <LogOut />
                </Button>
              </span>
            </>
          )}
        </div>
      </header>

      <Separator className='my-4' />

      {serviceId && (
        <ButtonGroup className='mb-4 w-full'>
          <Button
            className='w-[50%]'
            variant='outline'
            render={<NavLink to={`/services/${serviceId}/edit`} />}
          >
            Edit Slides
          </Button>
          <Button
            className='w-[50%]'
            variant='outline'
            render={<NavLink to={`/services/${serviceId}/preview`} />}
          >
            Preview
          </Button>
        </ButtonGroup>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
}
