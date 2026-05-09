export function PropertyCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="skeleton h-4 w-2/3 rounded-lg" />
          <div className="skeleton h-5 w-16 rounded-lg" />
        </div>
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-6 w-16 rounded-lg" />)}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="skeleton w-6 h-6 rounded-full" />
            <div className="skeleton h-3 w-20 rounded-lg" />
          </div>
          <div className="skeleton h-3 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => <PropertyCardSkeleton key={i} />)}
    </div>
  );
}

export function TextSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 rounded-lg ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function AvatarSkeleton({ size = 'md' }) {
  const s = size === 'lg' ? 'w-16 h-16' : size === 'sm' ? 'w-8 h-8' : 'w-12 h-12';
  return <div className={`skeleton ${s} rounded-full`} />;
}