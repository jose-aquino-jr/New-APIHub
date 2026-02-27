export function RankingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
      {/* Stats Skeleton */}
      <div className="max-w-4xl mx-auto mb-8 p-6 bg-gray-100 rounded-2xl">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="text-center p-3 bg-white rounded-xl">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* List Skeleton */}
      <div className="space-y-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Skeleton */}
      <div className="mt-8 p-6 bg-gray-50 rounded-2xl border">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}