/**
 * Reusable Loading Spinner Component
 * Sử dụng Tailwind CSS animate-pulse để tạo hiệu ứng loading mượt mà
 */
interface LoadingSpinnerProps {
  fullPage?: boolean;
  label?: string;
}

export function LoadingSpinner({ fullPage = false, label = 'Loading...' }: LoadingSpinnerProps) {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinner animation */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-border"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
      </div>
      {label && <p className="text-sm font-medium text-muted-foreground">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-workspace">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinnerContent}
    </div>
  );
}

/**
 * Loading Skeleton Component
 * Mô phỏng layout của content khi đang load
 * Tránh layout shift khi chuyển từ loading sang dữ liệu thật
 */
interface LoadingSkeletonProps {
  rows?: number;
  variant?: 'card' | 'table' | 'profile' | 'stats';
}

export function LoadingSkeleton({ rows = 3, variant = 'card' }: LoadingSkeletonProps) {
  if (variant === 'profile') {
    return (
      <div className="space-y-6">
        {/* Avatar skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Form fields skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Button skeleton */}
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (variant === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-white p-5 shadow-sm animate-pulse">
            <div className="h-4 w-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  // Default card variant
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-white p-5 shadow-sm space-y-3">
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}
