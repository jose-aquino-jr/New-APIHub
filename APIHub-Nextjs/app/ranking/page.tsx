// app/ranking/page.tsx - SSR
import { Suspense } from 'react'
import { Trophy } from 'lucide-react'
import { RankingClient } from '@/components/RankingClient'
import { RankingSkeleton } from '@/components/RankingSkeleton'

// Forçar SSR
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidar a cada hora

async function getRankingData() {
  try {
    const response = await fetch('https://apihub-br.duckdns.org/ranking', {
      next: { revalidate: 3600 } // Cache por 1 hora
    })
    
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.data) {
      return {
        ranking: data.data,
        meta: data.meta || { total: data.data.length, with_ratings: data.data.length }
      }
    }
    
    return { ranking: [], meta: { total: 0, with_ratings: 0 } }
  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    return { ranking: [], meta: { total: 0, with_ratings: 0 } }
  }
}

export default async function RankingPage() {
  const { ranking, meta } = await getRankingData()
  
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-2xl mb-4">
            <Trophy className="text-yellow-600 w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Ranking da Comunidade
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            As APIs mais bem avaliadas pela comunidade
          </p>
        </div>

        <Suspense fallback={<RankingSkeleton />}>
          <RankingClient 
            initialRanking={ranking}
            initialMeta={meta}
          />
        </Suspense>
      </div>
    </div>
  )
}