import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { CreditCard, LayoutDashboard, LogOut, Plus, Search, Settings, User } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { apiRequest, clearAuth, getStoredUser } from '../lib/api';
import { calculateCurrentRank } from '../lib/userRanking';
import { getRankImage } from '../lib/rankVisuals';

interface AppHeaderProps {
  role?: 'user' | 'admin';
  hideAction?: boolean;
}

export function AppHeader({ role = 'user', hideAction = false }: AppHeaderProps) {
  const logo = new URL('../../imports/liemresearch-logo.png', import.meta.url).href;
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const workspacePath = role === 'admin' ? '/admin' : '/dashboard';
  const actionPath = role === 'admin' ? '/admin/post-paper' : '/request-paper';
  const actionLabel = role === 'admin' ? 'Post Paper' : 'Request Paper';
  const profilePath = role === 'admin' ? '/admin/profile' : '/profile';
  const settingsPath = role === 'admin' ? '/admin/profile' : '/settings/profile';
  const [query, setQuery] = useState('');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [ranking, setRanking] = useState<{ points: number; uploadedPapers: number } | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const academicRank = useMemo(
    () => (ranking ? calculateCurrentRank(ranking.points, ranking.uploadedPapers) : null),
    [ranking]
  );

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate(workspacePath, { state: { headerSearch: query.trim() } });
  };

  const initials = user?.fullName
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsAccountOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (role !== 'user') return;

    apiRequest<{ ranking: { points: number; uploadedPapers: number } }>('/rankings/me', { auth: true })
      .then((data) => setRanking(data.ranking))
      .catch(() => setRanking(null));
  }, [role]);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#e2e8f0] bg-[#ffffff]/95 backdrop-blur">
        <div className="flex h-16 w-full items-center gap-3 px-4 md:h-[73px] md:px-6">
          <Link
            to={workspacePath}
            onClick={() => window.scrollTo(0, 0)}
            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <img src={logo} alt="LiemResearch" className="h-9 w-9 rounded-lg border border-[#e2e8f0] bg-white object-contain p-1 md:h-10 md:w-10" />
            <span className="hidden text-base font-semibold text-[#1e293b] sm:block">LiemResearch</span>
          </Link>

          <form onSubmit={handleSearch} className="relative hidden min-w-0 flex-1 sm:block md:max-w-3xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search papers..."
              className="w-full rounded-lg border border-[#e2e8f0] bg-white py-2 pl-10 pr-3 text-sm text-[#1e293b] outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
            />
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            {!hideAction && location.pathname !== actionPath && (
              <Link
                to={actionPath}
                className="hidden items-center gap-2 rounded-lg border border-[#2563eb] px-3 py-2 text-sm font-semibold text-[#2563eb] transition-colors hover:bg-[#2563eb] hover:text-[#ffffff] sm:inline-flex"
              >
                <Plus size={17} />
                {actionLabel}
              </Link>
            )}

            <NotificationBell />

            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsAccountOpen((current) => !current)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-xs font-semibold text-white transition-opacity hover:opacity-85"
                aria-label="Open account menu"
                aria-expanded={isAccountOpen}
              >
                {initials}
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 top-12 w-64 rounded-lg border border-[#e2e8f0] bg-white p-2 text-sm shadow-xl">
                  <div className="border-b border-[#e2e8f0] px-3 py-2.5">
                    <p className="font-semibold text-[#1e293b]">{user?.fullName || 'LiemResearch user'}</p>
                    <p className="mt-0.5 truncate text-xs text-[#64748b]">{user?.email}</p>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      <CreditCard size={14} />
                      {user?.credits ?? 0} credits
                    </span>
                    {academicRank && (
                      <span className="ml-1.5 mt-2 inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">
                        <img src={getRankImage(academicRank.level)} alt="" className="h-4 w-4 object-contain" />
                        Lv. {academicRank.level} · {academicRank.name}
                      </span>
                    )}
                  </div>

                  <div className="py-2">
                    <Link
                      to={profilePath}
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-[#1e293b] transition-colors hover:bg-[#eff6ff]"
                    >
                      <User size={17} />
                      Profile
                    </Link>
                    <Link
                      to={workspacePath}
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-[#1e293b] transition-colors hover:bg-[#eff6ff]"
                    >
                      <LayoutDashboard size={17} />
                      Dashboard
                    </Link>
                    <Link
                      to={settingsPath}
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-[#1e293b] transition-colors hover:bg-[#eff6ff]"
                    >
                      <Settings size={17} />
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-[#e2e8f0] pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="hidden md:block md:h-[73px]" />
    </>
  );
}
