import { useNavigate } from 'react-router';
import { getStoredUser } from '../lib/api';

const navigationItems = [
  { label: 'Khám phá', path: '/explore' },
  { label: 'Xếp hạng', path: '/rankings' },
  { label: 'Đóng góp', path: '/request-paper?mode=contribute', requiresAuth: true },
];

export function PublicHeader() {
  const navigate = useNavigate();
  const currentUser = getStoredUser();

  const openPath = (path: string, requiresAuth = false) => {
    navigate(requiresAuth && !currentUser ? '/login' : path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#e2e8f0] bg-[#f8fafc]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-5 md:h-[73px] md:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex shrink-0 items-center gap-2 text-left transition-opacity hover:opacity-70"
        >
          <span className="h-3 w-3 rounded-full bg-[#1e293b]" />
          <span className="text-sm font-bold tracking-tight text-[#1e293b]">LiemResearch</span>
        </button>

        <nav className="hidden items-center gap-5 md:flex">
          {navigationItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => openPath(item.path, item.requiresAuth)}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b] transition-colors hover:text-[#1e293b]"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {currentUser ? (
            <button
              type="button"
              onClick={() => navigate(currentUser.role === 'admin' ? '/admin' : '/dashboard')}
              className="rounded-full bg-[#1e293b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b] transition-colors hover:text-[#1e293b]"
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="hidden rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1e293b] transition-colors hover:bg-[#eff6ff] sm:block"
              >
                Tham gia
              </button>
            </>
          )}
        </div>
      </div>

      <nav className="flex gap-4 overflow-x-auto border-t border-[#e2e8f0] px-5 py-3 md:hidden">
        {navigationItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => openPath(item.path, item.requiresAuth)}
            className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748b]"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
