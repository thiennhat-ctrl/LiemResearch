import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { AppHeader } from '../components/AppHeader';
import {
  Award,
  ChevronDown,
  Crown,
  FileText,
  Medal,
  MinusCircle,
  PlusCircle,
  ShieldCheck,
  Star,
  Trophy,
  HelpCircle,
  Upload,
} from 'lucide-react';
import { apiRequest, AuthUser, getStoredUser } from '../lib/api';
import { calculateCurrentRank, RANK_LEVELS } from '../lib/userRanking';
import { getRankImage } from '../lib/rankVisuals';

interface UserRank {
  rank: number;
  user: AuthUser;
  uploadedPapers: number;
  uploadedPdfs: number;
  ratingsGiven: number;
  rejectedPapers: number;
  rejectedPdfs: number;
  penaltyPoints?: number;
  uploadCreditReward?: number;
  points: number;
}

type RuleId = 'paper' | 'pdf' | 'rating';

const pointRules: Array<{
  id: RuleId;
  title: string;
  icon: typeof FileText;
  earn: string;
  lose: string;
  earnDescription: string;
  description: string;
}> = [
  {
    id: 'paper',
    title: 'Approved paper',
    icon: FileText,
    earn: '+1 approved paper',
    lose: 'Rejected papers do not count',
    earnDescription: 'Counts toward the paper requirement used for academic rank levels.',
    description: 'Approved, not-downloaded, and downloaded papers are counted for rank level progress.',
  },
  {
    id: 'pdf',
    title: 'Accepted PDF upload',
    icon: Upload,
    earn: '+100 to +300 score',
    lose: 'Penalty points reduce score',
    earnDescription: 'Added to ranking score when the accepted PDF reaches a valid quality tier.',
    description: 'Rejected-paper penalties are currently set to 0, but manual penalty points still reduce ranking score.',
  },
  {
    id: 'rating',
    title: 'Paper Rating',
    icon: Star,
    earn: '+5 points',
    lose: 'No penalty',
    earnDescription: 'Added once for each paper rating you create.',
    description: 'Every helpful rating contributes a small amount to the research community score.',
  },
];

export function UserRankingPage() {
  const [rankings, setRankings] = useState<UserRank[]>([]);
  const [currentRank, setCurrentRank] = useState<UserRank | null>(null);
  const [openRule, setOpenRule] = useState<RuleId | null>('paper');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContributors, setTotalContributors] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadRankings() {
      setIsLoading(true);
      setError('');

      try {
        const [topData, myData] = await Promise.all([
          apiRequest<{ rankings: UserRank[]; pagination?: { total?: number; totalPages?: number } }>(
            `/rankings/top?page=${page}&limit=5`,
            { auth: true }
          ),
          apiRequest<{ ranking: UserRank }>('/rankings/me', { auth: true }).catch(() => ({ ranking: null })),
        ]);

        if (isMounted) {
          setRankings(topData.rankings);
          setTotalContributors(topData.pagination?.total ?? topData.rankings.length);
          setTotalPages(topData.pagination?.totalPages ?? 1);
          setCurrentRank(myData.ranking ?? null);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Unable to load rankings');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRankings();

    return () => {
      isMounted = false;
    };
  }, [page]);

  const currentUser = getStoredUser();
  const topThree = rankings.slice(0, 3);
  const totalPoints = useMemo(() => rankings.reduce((sum, item) => sum + item.points, 0), [rankings]);
  const currentAcademicRank = currentRank ? calculateCurrentRank(currentRank.points, currentRank.uploadedPapers) : null;
  const [showRankInfo, setShowRankInfo] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowRankInfo(false);
    }

    if (showRankInfo) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showRankInfo]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[#f8fafc] bg-fixed text-[#1e293b]">
      <Sidebar role="user" />

      <div className="min-w-0 flex-1">
        <AppHeader role="user" />
        <div className="p-8">
          <div className="mx-auto max-w-7xl">
          <section className="mb-8">
              <div className="relative rounded-lg border border-[#e2e8f0] bg-[#ffffff] px-8 py-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-4 lg:max-w-xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-3 py-1 text-sm font-medium text-[#1d4ed8]">
                    <Trophy size={16} />
                    Community leaderboard
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight text-[#1e293b]">User Rankings</h1>
                  <p className="mt-2 max-w-2xl text-[#64748b]">
                    Track the strongest contributors by approved papers, accepted PDFs, useful ratings, and review quality.
                  </p>
                </div>

                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[460px] lg:shrink-0">
                  <HeroMetric label="Contributors" value={totalContributors} icon={Award} tone="blue" />
                  <HeroMetric label="Page Points" value={totalPoints} icon={Trophy} tone="emerald" />
                  <HeroMetric
                    label="Your Rank"
                    icon={ShieldCheck}
                    tone="amber"
                    value={currentRank && currentAcademicRank ? `#${currentRank.rank} / Lv. ${currentAcademicRank.level}` : 'N/A'}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowRankInfo((s) => !s)}
                  aria-label="Rank level information"
                  className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cbd5e1] bg-[#ffffff]/90 text-[#2563eb] shadow-sm transition-colors hover:bg-[#eff6ff]"
                >
                  <HelpCircle size={18} />
                </button>
              </div>
            </div>

            {showRankInfo && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/35"
                  onClick={() => setShowRankInfo(false)}
                />

                <div className="relative z-10 w-full max-w-3xl rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[#1e293b]">Rank levels</h2>
                    <button
                      type="button"
                      onClick={() => setShowRankInfo(false)}
                      className="rounded px-2 py-1 text-sm text-[#64748b] hover:bg-[#eff6ff]"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-4 overflow-auto">
                    <div className="grid grid-cols-12 items-center gap-3 text-sm font-medium text-[#64748b]">
                      <div className="col-span-1">&nbsp;</div>
                      <div className="col-span-1">Level</div>
                      <div className="col-span-6">Name</div>
                      <div className="col-span-2 text-right">Min Points</div>
                      <div className="col-span-2 text-right">Min Papers</div>
                    </div>
                    <div className="mt-2 space-y-2">
                      {RANK_LEVELS.map((lvl) => (
                        <div key={lvl.level} className="grid grid-cols-12 items-center rounded-md border border-[#e2e8f0] bg-[#f8fafc] p-2">
                          <div className="col-span-1">
                            <img src={getRankImage(lvl.level)} alt={lvl.name} className="h-8 w-8 object-contain" />
                          </div>
                          <div className="col-span-1 font-semibold text-[#1e293b]">Lv. {lvl.level}</div>
                          <div className="col-span-6 truncate">{lvl.name}</div>
                          <div className="col-span-2 text-right font-medium text-[#1e293b]">{lvl.minPoints.toLocaleString()}</div>
                          <div className="col-span-2 text-right text-[#64748b]">{lvl.minPapers}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-[#64748b]">
                    Users must meet both the points and paper requirements to reach each level.
                  </p>
                </div>
              </div>
            )}
          </section>

          {error && (
            <div className="mb-6 rounded-lg border border-[#efc8c8] bg-[#fff3f3] p-4 text-[#9d3d3d]">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-12 text-center shadow-sm">
              <p className="text-[#64748b]">Loading rankings...</p>
            </div>
          )}

          {!isLoading && rankings.length > 0 && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <main className="space-y-6">
                <section className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-[#1e293b]">Top Contributors</h3>
                      <p className="mt-1 text-sm text-[#64748b]">The current page's highest ranked contributors.</p>
                    </div>
                    <Crown size={24} className="text-[#f59e0b]" />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {topThree.map((item) => (
                      <TopContributorCard key={item.user._id} item={item} isCurrentUser={item.user._id === currentUser?._id} />
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] shadow-sm">
                  <div className="flex flex-col gap-2 border-b border-[#e2e8f0] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-[#1e293b]">Leaderboard</h3>
                      <p className="mt-1 text-sm text-[#64748b]">Score breakdown is shown beside each contributor.</p>
                    </div>
                    <div className="rounded-md bg-[#eff6ff] px-3 py-2 text-sm text-[#64748b]">
                      {rankings.length} shown
                    </div>
                  </div>

                  <div className="divide-y divide-[#e2e8f0]">
                    {rankings.map((item) => (
                      <LeaderboardRow
                        key={item.user._id}
                        item={item}
                        isCurrentUser={item.user._id === currentUser?._id}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between gap-4 border-t border-[#e2e8f0] px-6 py-4">
                      <p className="text-sm text-[#64748b]">
                        Page {page} of {totalPages}
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                          disabled={page === 1 || isLoading}
                          className="rounded-lg border border-[#cbd5e1] px-4 py-2 text-sm font-medium text-[#1e293b] transition-colors hover:bg-[#eff6ff] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                          disabled={page === totalPages || isLoading}
                          className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-[#ffffff] transition-colors hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </main>

              <aside className="space-y-6">
                {currentRank && <MyRankCard item={currentRank} />}

                <section className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-[#f59e0b]" />
                    <h3 className="text-[#1e293b]">Ranking Score Rule</h3>
                  </div>

                  <div className="space-y-3">
                    {pointRules.map((rule) => (
                      <RuleAccordion
                        key={rule.id}
                        rule={rule}
                        isOpen={openRule === rule.id}
                        onToggle={() => setOpenRule(openRule === rule.id ? null : rule.id)}
                      />
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          )}

          {!isLoading && rankings.length === 0 && (
            <div className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-12 text-center shadow-sm">
              <Trophy size={48} className="mx-auto mb-4 text-[#94a3b8]" />
              <h3 className="mb-2 text-[#1e293b]">No rankings yet</h3>
              <p className="text-[#64748b]">Rankings will appear after valid uploads or ratings.</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof FileText;
  label: string;
  value: number | string;
  tone: 'blue' | 'emerald' | 'amber';
}) {
  const toneStyles = {
    blue: 'border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]',
    emerald: 'border-[#bfdbfe] bg-[#f8fafc] text-[#1d4ed8]',
    amber: 'border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]',
  };

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneStyles[tone]}`}>
      <div className="mb-2 flex items-center gap-2">
        <Icon size={18} />
        <p className="text-sm font-medium">{label}</p>
      </div>
      <p className="text-2xl font-semibold text-[#1e293b]">{value}</p>
    </div>
  );
}

function TopContributorCard({ item, isCurrentUser }: { item: UserRank; isCurrentUser: boolean }) {
  const academicRank = calculateCurrentRank(item.points, item.uploadedPapers);
  const rankStyles = {
    1: 'border-[#93c5fd] bg-[#eff6ff]',
    2: 'border-[#cbd5e1] bg-[#f8fafc]',
    3: 'border-[#bfdbfe] bg-[#f8fafc]',
  };

  return (
    <article className={`rounded-lg border-2 p-5 shadow-sm ${rankStyles[item.rank as 1 | 2 | 3] || 'border-[#e2e8f0] bg-[#ffffff]'}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <RankIcon rank={item.rank} />
          <div>
            <p className="font-semibold text-[#1e293b]">{item.user.fullName}</p>
            <p className="text-sm text-[#64748b]">{item.user.university}</p>
          </div>
        </div>
        {isCurrentUser && (
          <span className="rounded-md bg-[#2563eb] px-2 py-1 text-xs font-medium text-[#ffffff]">You</span>
        )}
      </div>

      <AcademicRankBadge rank={academicRank} className="mb-4" />

      <div className="mb-4 border-y border-black/10 py-4">
        <p className="text-sm text-[#64748b]">Total score</p>
        <p className="text-3xl font-semibold text-[#1e293b]">{item.points}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <MiniStat icon={FileText} value={item.uploadedPapers} label="Papers" />
        <MiniStat icon={Upload} value={item.uploadedPdfs} label="PDFs" />
        <MiniStat icon={Star} value={item.ratingsGiven} label="Ratings" />
      </div>
    </article>
  );
}

function LeaderboardRow({ item, isCurrentUser }: { item: UserRank; isCurrentUser: boolean }) {
  const academicRank = calculateCurrentRank(item.points, item.uploadedPapers);
  const positivePoints = (item.uploadCreditReward || 0) + item.ratingsGiven * 5;
  const negativePoints = item.penaltyPoints || 0;
  const rankTone =
    item.rank === 1
      ? 'text-[#b8860b]'
      : item.rank === 2
        ? 'text-[#64748b]'
        : item.rank === 3
          ? 'text-[#2563eb]'
          : 'text-[#94a3b8]';

  return (
    <div className={`grid grid-cols-1 gap-4 px-6 py-5 transition-colors lg:grid-cols-[72px_minmax(0,1fr)_240px_120px] lg:items-center ${
      isCurrentUser ? 'bg-[#dbeafe]' : 'hover:bg-[#f8fafc]'
    }`}>
      <div className="flex items-center gap-3">
        <RankIcon rank={item.rank} compact />
        <span className={`font-semibold ${rankTone}`}>#{item.rank}</span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium text-[#1e293b]">{item.user.fullName}</p>
          {isCurrentUser && <span className="rounded-md bg-[#2563eb] px-2 py-1 text-xs font-medium text-[#ffffff]">You</span>}
        </div>
        <p className="truncate text-sm text-[#64748b]">{item.user.university}</p>
        <div className="mt-2">
          <AcademicRankBadge rank={academicRank} compact />
        </div>
        {/* Student ID removed from ranking display */}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MiniStat icon={FileText} value={item.uploadedPapers} label="Papers" />
        <MiniStat icon={Upload} value={item.uploadedPdfs} label="PDFs" />
        <MiniStat icon={Star} value={item.ratingsGiven} label="Ratings" />
      </div>

      <div className="text-left lg:text-right">
        <p className="text-2xl font-semibold text-[#1e293b]">{item.points}</p>
        <div className="mt-1 flex gap-2 text-xs lg:justify-end">
          <span className="text-[#5b7d57]">+{positivePoints}</span>
          <span className="text-[#b05d52]">-{negativePoints}</span>
        </div>
      </div>
    </div>
  );
}

function MyRankCard({ item }: { item: UserRank }) {
  const academicRank = calculateCurrentRank(item.points, item.uploadedPapers);

  return (
    <section className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#dbeafe] text-[#2563eb]">
          <Trophy size={22} />
        </div>
        <div>
          <h3 className="text-[#1e293b]">Your Position</h3>
          <p className="text-sm text-[#64748b]">Current leaderboard standing</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
          <p className="text-sm text-[#64748b]">Rank</p>
          <p className="text-2xl font-semibold text-[#1e293b]">#{item.rank}</p>
        </div>
        <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
          <p className="text-sm text-[#64748b]">Points</p>
          <p className="text-2xl font-semibold text-[#1e293b]">{item.points}</p>
        </div>
      </div>

      <div className="mt-4">
        <AcademicRankBadge rank={academicRank} />
      </div>
    </section>
  );
}

function AcademicRankBadge({
  rank,
  compact = false,
  className = '',
}: {
  rank: ReturnType<typeof calculateCurrentRank>;
  compact?: boolean;
  className?: string;
}) {
  const image = getRankImage(rank.level);

  return (
    <div
      className={`inline-flex w-fit max-w-full items-center gap-2 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2 text-[#1e40af] shadow-sm ${className}`}
    >
      <img
        src={image}
        alt={rank.name}
        className={compact ? 'h-9 w-9 object-contain' : 'h-12 w-12 object-contain'}
      />
      <div className="min-w-0">
        <p className={compact ? 'text-xs font-semibold leading-4' : 'text-sm font-semibold leading-5'}>
          Lv. {rank.level} · {rank.name}
        </p>
      </div>
    </div>
  );
}

function RuleAccordion({
  rule,
  isOpen,
  onToggle,
}: {
  rule: (typeof pointRules)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = rule.icon;

  return (
    <div className="overflow-hidden rounded-lg border border-[#e2e8f0]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 bg-[#ffffff] px-4 py-3 text-left transition-colors hover:bg-[#f8fafc]"
      >
        <span className="flex items-center gap-3 font-medium text-[#1e293b]">
          <Icon size={18} className="text-[#2563eb]" />
          {rule.title}
        </span>
        <ChevronDown size={18} className={`text-[#64748b] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="border-t border-[#e2e8f0] bg-[#f8fafc] p-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-lg border border-[#d6e1cf] bg-[#f2f8ee] p-4">
              <div className="mb-1 flex items-center gap-2 text-[#5b7d57]">
                <PlusCircle size={18} />
                <span className="font-semibold">{rule.earn}</span>
              </div>
              <p className="text-sm text-[#5b7d57]">{rule.earnDescription}</p>
            </div>

            <div className="rounded-lg border border-[#efc8c8] bg-[#fff3f3] p-4">
              <div className="mb-1 flex items-center gap-2 text-[#b05d52]">
                <MinusCircle size={18} />
                <span className="font-semibold">{rule.lose}</span>
              </div>
              <p className="text-sm text-[#9d3d3d]">{rule.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RankIcon({ rank, compact }: { rank: number; compact?: boolean }) {
  const size = compact ? 20 : 28;

  if (rank === 1) return <Trophy size={size} className="text-[#f59e0b]" />;
  if (rank === 2) return <Medal size={size} className="text-[#6f6256]" />;
  if (rank === 3) return <Award size={size} className="text-[#2563eb]" />;

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8fafc] text-sm font-semibold text-[#64748b]">
      {rank}
    </span>
  );
}

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof FileText;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-lg bg-[#ffffff]/70 p-3">
      <div className="mb-1 flex items-center gap-1 text-[#64748b]">
        <Icon size={14} />
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-semibold text-[#1e293b]">{value}</p>
    </div>
  );
}
