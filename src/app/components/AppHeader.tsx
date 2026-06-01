import { Link } from 'react-router';
import { Home, FileText, LogOut, BarChart3, Users, Trophy, User as UserIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { clearAuth } from '../lib/api';
import { NotificationBell } from './NotificationBell';

interface AppHeaderProps {
  role?: 'user' | 'admin';
}

export function AppHeader({ role = 'user' }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const workspacePath = role === 'admin' ? '/admin' : '/dashboard';
  const logo = new URL('../../imports/Gemini_Generated_Image_s2fnqas2fnqas2fn.png', import.meta.url).href;

  const handleNavigate = (item: { path: string; isLogout?: boolean }) => {
    if (item.isLogout) {
      clearAuth();
    }

    navigate(item.path);
  };

  const userMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'My Requests', path: '/my-requests' },
    { icon: Trophy, label: 'Rankings', path: '/rankings' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
    { icon: LogOut, label: 'Logout', path: '/login', isLogout: true },
  ];

  const adminMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: BarChart3, label: 'Statistics', path: '/admin/stats' },
    { icon: FileText, label: 'Paper Management', path: '/admin/papers' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: UserIcon, label: 'Profile', path: '/admin/profile' },
    { icon: LogOut, label: 'Logout', path: '/login', isLogout: true },
  ];

  const menuItems = role === 'admin' ? adminMenuItems : userMenuItems;
  const logoutItem = menuItems.find((item) => item.isLogout);
  const navigationItems = menuItems.filter((item) => !item.isLogout);

  return (
    <header className="sticky top-0 z-20 border-b border-[#d8c8b7] bg-[#fbf4ea]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        <Link
          to={workspacePath}
          onClick={() => window.scrollTo(0, 0)}
          className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-[#d7c3ad] bg-[#fff8ef]">
            <img src={logo} alt="LiemResearch" className="h-full w-full object-contain p-1.5" />
          </div>
          <div className="hidden sm:block min-w-0 leading-tight">
            <p className="truncate text-base text-[#2f251f] lg:text-lg">LiemResearch</p>
            <p className="truncate text-sm text-[#8a7766]">
              {role === 'admin' ? 'Administration workspace' : 'Research workspace'}
            </p>
          </div>
        </Link>

        <nav className="flex flex-1 justify-center px-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#3a2c24] text-[#fffaf4] shadow-sm'
                      : 'text-[#2f251f] hover:bg-[#f2e4d2] hover:text-[#1f1a17]'
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="min-w-0">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell />

          {logoutItem ? (
            <button
              onClick={() => handleNavigate(logoutItem)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap text-[#c75f2d] transition-all hover:bg-[#f7e7d5] hover:text-[#a84920]"
            >
              <logoutItem.icon size={18} className="flex-shrink-0" />
              <span className="min-w-0">{logoutItem.label}</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
