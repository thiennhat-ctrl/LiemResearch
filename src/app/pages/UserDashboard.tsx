import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { AppHeader } from '../components/AppHeader';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';
import { PaperCard } from '../components/PaperCard';
import { LoadingSkeleton } from '../components/LoadingSpinner';
import { SuccessToast } from '../components/SuccessToast';
import { apiRequest, resolveFileUrl } from '../lib/api';
import { PublicPaper } from '../lib/papers';
import { Search, Plus, Download as DownloadIcon, Filter } from 'lucide-react';

type FeedTab = 'newest' | 'rating' | 'downloads' | 'hasPdf';

const feedTabs: Array<{ label: string; value: FeedTab }> = [
  { label: 'Latest', value: 'newest' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Downloaded', value: 'downloads' },
  { label: 'Has PDF', value: 'hasPdf' },
];

export function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<FeedTab>('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [papers, setPapers] = useState<PublicPaper[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!message) return;

    const timeoutId = window.setTimeout(() => {
      setMessage('');
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  useEffect(() => {
    if (location.state?.loginSuccess) {
      setMessage('Logged in successfully.');
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    if (typeof location.state?.headerSearch === 'string') {
      setSearchTerm(location.state.headerSearch);
      setPage(1);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!message) return;

    const timeoutId = window.setTimeout(() => {
      setMessage('');
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  async function loadPapers() {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (yearFilter !== 'all') params.set('year', yearFilter);
      if (activeTab === 'hasPdf') {
        params.set('hasPdf', 'true');
        params.set('sortBy', 'newest');
      } else {
        params.set('sortBy', activeTab);
      }
      params.set('page', String(page));
      params.set('limit', '5');

      const data = await apiRequest<{ papers: PublicPaper[]; pagination?: { totalPages?: number } }>(`/public-papers?${params.toString()}`, {
        auth: true,
      });
      setPapers(data.papers);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load papers');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadPapers();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [page, searchTerm, yearFilter, activeTab]);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (activeTab === 'hasPdf') params.set('hasPdf', 'true');

        const data = await apiRequest<{ years: string[] }>(`/public-papers/years?${params.toString()}`, {
          auth: true,
        });
        setYears(data.years);
      } catch {
        setYears([]);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm, activeTab]);

  const handleDownload = async (paper: PublicPaper) => {
    try {
      const data = await apiRequest<{ downloadUrl: string }>(`/public-papers/${paper._id}/download`, {
        method: 'POST',
        auth: true,
      });

      const fileUrl = resolveFileUrl(data.downloadUrl);
      const resp = await fetch(fileUrl);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper.doi || paper.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to download PDF');
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[#f8fafc] bg-fixed">
      <Sidebar role="user" />

      <div className="min-w-0 flex-1">
        <AppHeader role="user" hideAction />
        <div className="p-5">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-foreground min-w-0 shrink-0 text-3xl font-bold">Dashboard</h1>
                
                <div className="flex w-full flex-col sm:w-auto sm:flex-row sm:items-center gap-3 shrink-0">
                  <div className="relative w-full sm:w-80 md:w-96">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#94a3b8]" size={18} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setPage(1);
                        setSearchTerm(e.target.value);
                      }}
                      placeholder="Search papers..."
                      maxLength={128}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#e2e8f0] rounded-full focus:outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 bg-[#ffffff] transition-all text-sm shadow-sm"
                    />
                  </div>
                  <button
                    onClick={() => navigate('/request-paper')}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-[#ffffff] transition-all hover:bg-[#1e40af] hover:shadow-md"
                  >
                    <Plus size={18} />
                    Request Paper
                  </button>
                </div>
              </div>
              <p className="text-[#64748b]">Browse research papers and request what you need.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            {message && (
              <SuccessToast message={message} onDismiss={() => setMessage('')} />
            )}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-[#ffffff] p-1.5 shadow-sm self-start">
                {feedTabs.map((item) => {
                  const isActive = activeTab === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setPage(1);
                        setActiveTab(item.value);
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#2563eb] text-[#ffffff] shadow-md'
                          : 'bg-transparent text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:w-40">
                <Filter className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#94a3b8]" size={18} />
                <select
                  value={yearFilter}
                  onChange={(e) => {
                    setPage(1);
                    setYearFilter(e.target.value);
                  }}
                  className="w-full pl-10 pr-8 py-2.5 border border-[#e2e8f0] rounded-full focus:outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 bg-[#ffffff] appearance-none transition-all text-sm shadow-sm cursor-pointer"
                >
                  <option value="all">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-[#64748b]">
                {isLoading ? 'Loading papers...' : `Showing ${papers.length} paper${papers.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {isLoading ? (
              <LoadingSkeleton rows={5} />
            ) : papers.length === 0 ? (
              <div className="bg-[#ffffff] rounded-lg border border-[#e2e8f0] shadow-sm p-12 text-center">
                <Search size={48} className="mx-auto text-[#94a3b8] mb-4" />
                <h3 className="text-[#1e293b] mb-2">No papers found</h3>
                <p className="text-[#64748b]">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {papers.map((paper) => (
                    <PaperCard
                      key={paper._id}
                      paper={paper}
                      variant="dashboard"
                      onOpen={(selectedPaper) => navigate(`/paper/${selectedPaper._id}`)}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-[#e2e8f0] bg-[#ffffff] px-3 py-2 shadow-sm">
                    <p className="text-sm text-[#64748b]">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                        disabled={page === 1 || isLoading}
                        className="rounded-lg border border-[#cbd5e1] px-3 py-2 text-sm font-medium text-[#1e293b] transition-colors hover:bg-[#eff6ff] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                        disabled={page === totalPages || isLoading}
                        className="rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-medium text-[#ffffff] transition-colors hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
