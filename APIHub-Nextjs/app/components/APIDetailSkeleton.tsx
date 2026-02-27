export function APIDetailSkeleton() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="animate-pulse space-y-6 w-full max-w-7xl px-4">
        {/* Header Skeleton */}
        <div className="card space-y-4">
          <div className="flex justify-between">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-40"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="flex gap-4">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card space-y-3">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="card space-y-3">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="card space-y-3">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              {[1,2,3].map(i => (
                <div key={i} className="h-8 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}