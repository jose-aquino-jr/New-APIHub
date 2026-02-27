export function APICatalogSkeleton() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container-custom py-8">
        <div className="animate-pulse space-y-8">
          <div className="text-center space-y-4">
            <div className="h-6 bg-gray-200 rounded-full w-48 mx-auto"></div>
            <div className="h-12 bg-gray-200 rounded-2xl w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          
          <div className="card">
            <div className="h-16 bg-gray-200 rounded-xl"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="p-3 rounded-xl border-2 border-gray-200 bg-white">
                <div className="w-10 h-10 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card space-y-4">
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-6"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}