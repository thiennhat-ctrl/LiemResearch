import { Calendar, Download, Eye, FileText, Star } from 'lucide-react';
import { formatDisplayDate } from '../lib/date';
import { getPaperAuthors, getPaperType, PublicPaper, getSemesterLabel } from '../lib/papers';
import ExpandableText from './ExpandableText';

type PaperCardProps = {
  paper: PublicPaper;
  onOpen: (paper: PublicPaper) => void;
  onDownload?: (paper: PublicPaper) => void;
  onTagClick?: (tag: string) => void;
  variant?: 'public' | 'dashboard';
};


function PdfStatus({ isPdfAvailable }: { isPdfAvailable: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium ${
        isPdfAvailable
          ? 'border-[#d6e1cf] bg-[#f2f8ee] text-[#5b7d57]'
          : 'border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]'
      }`}
    >
      <FileText size={14} />
      {isPdfAvailable ? 'PDF available' : 'No PDF yet'}
    </span>
  );
}

export function PaperCard({
  paper,
  onOpen,
  onDownload,
  onTagClick,
  variant = 'public',
}: PaperCardProps) {
  const isPdfAvailable = Boolean(paper.pdfPath) && paper.status === 'downloaded';
  const ratingText = paper.averageRating > 0 ? paper.averageRating.toFixed(1) : 'No rating';
  const isDashboard = variant === 'dashboard';

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => onOpen(paper)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onOpen(paper);
      }}
      className="cursor-pointer rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-4 shadow-sm transition-colors hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
    >
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{getPaperAuthors(paper)}</p>
        </div>
        <PdfStatus isPdfAvailable={isPdfAvailable} />
      </div>

      <h3 className="mb-2 text-xl font-semibold leading-snug text-foreground transition-colors hover:text-[#2563eb]">
        {paper.title}
      </h3>

      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar size={15} />
          {paper.publishedYear}
        </span>
        <span>{getPaperType(paper)}</span>
        {paper.applicationDomain && <span>{paper.applicationDomain}</span>}
        {isDashboard && <span>Added {formatDisplayDate(paper.createdAt)}</span>}
      </div>

      <div className="mb-3" onClick={(event) => event.stopPropagation()}>
        <ExpandableText text={paper.abstract} lines={isDashboard ? 2 : 3} expandable={isDashboard} />
      </div>

      {isDashboard && paper.relatedSemesters?.length ? (
        <div className="mb-2 text-sm text-muted-foreground">Semesters: {paper.relatedSemesters.map((s) => getSemesterLabel(s)).join(', ')}</div>
      ) : null}

      <div className="mb-3 flex flex-wrap gap-2">
        {paper.keywords.slice(0, 4).map((keyword) => (
          <button
            key={keyword}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onTagClick?.(keyword);
            }}
            disabled={!onTagClick}
            className="rounded-md bg-[#eff6ff] px-2 py-1 text-xs text-[#1d4ed8] transition-colors hover:bg-[#dbeafe] disabled:cursor-default disabled:hover:bg-[#eff6ff]"
          >
            #{keyword}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] pt-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#64748b]">
          <span className="flex items-center gap-1">
            <Star size={15} className={paper.averageRating > 0 ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-[#cbd5e1]'} />
            {ratingText}
            {paper.totalRatings > 0 ? ` (${paper.totalRatings})` : ''}
          </span>
          <span className="flex items-center gap-1">
            <Download size={15} />
            {paper.downloadCount} downloads
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isDashboard && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpen(paper);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-[#cbd5e1] px-3 py-2 text-sm text-[#1e293b] transition-colors hover:bg-[#eff6ff]"
            >
              <Eye size={16} />
              View
            </button>
          )}
          {onDownload && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDownload(paper);
              }}
              disabled={!isPdfAvailable}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                isPdfAvailable
                  ? 'bg-[#2563eb] text-[#ffffff] hover:bg-[#1e293b]'
                  : 'cursor-not-allowed bg-[#e2e8f0] text-[#94a3b8]'
              }`}
            >
              <Download size={16} />
              Download
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
