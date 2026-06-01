import { Link } from 'react-router';
import { NotificationBell } from './NotificationBell';

interface AppHeaderProps {
  role?: 'user' | 'admin';
}

export function AppHeader({ role = 'user' }: AppHeaderProps) {
  const workspacePath = role === 'admin' ? '/admin' : '/dashboard';
  const logo = new URL('../../imports/Gemini_Generated_Image_s2fnqas2fnqas2fn.png', import.meta.url).href;

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link
          to={workspacePath}
          onClick={() => window.scrollTo(0, 0)}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <img src={logo} alt="LiemResearch" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <p className="text-lg font-semibold text-foreground">LiemResearch</p>
            <p className="text-sm text-muted-foreground">
              {role === 'admin' ? 'Administration workspace' : 'Research workspace'}
            </p>
          </div>
        </Link>

        <NotificationBell />
      </div>
    </header>
  );
}
