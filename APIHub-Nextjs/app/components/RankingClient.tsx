'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Trophy, Medal, Star, ArrowUpRight, Loader2, Users, BarChart3 } from 'lucide-react'
import { generateSlug } from '@/lib/utils'

type APIItem = {
  id: string;
  name: string;
  tag: string;
  rating: number;
  rating_count: number;
  tags?: string;
  description?: string | null;
  has_minimum_ratings?: boolean;
}

interface RankingClientProps {
  initialRanking: APIItem[]
  initialMeta: {
    total: number
    with_ratings: number
  }
}

export function RankingClient({ initialRanking, initialMeta }: RankingClientProps) {
  // Inicializamos tratando possíveis nulos nos dados iniciais do SSR
  const [rankingData, setRankingData] = useState<APIItem[]>(() => 
    initialRanking.map(api => ({
      ...api,
      rating: Number(api.rating) || 0,
      rating_count: Number(api.rating_count) || 0
    }))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState(initialMeta)

  const retryFetch = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // CORREÇÃO URL: Conforme página 14 da documentação (/apis/ranking)
      const response = await fetch('https://apihub-br.duckdns.org/apis/ranking?limit=50')
      
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        const transformedData = data.data.map((api: any) => ({
          id: api.id,
          name: api.name,
          tag: getFirstTag(api.tags) || 'API',
          // BLINDAGEM: Garante que rating nunca seja null antes do .toFixed
          rating: Number(api.rating) || 0,
          rating_count: Number(api.rating_count) || 0,
          tags: api.tags,
          description: api.description,
          has_minimum_ratings: (Number(api.rating_count) || 0) >= 5
        }))
        
        // Ordenação robusta
        const sortedData = transformedData.sort((a: APIItem, b: APIItem) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return b.rating_count - a.rating_count;
        })
        
        setRankingData(sortedData)
        
        if (data.meta) {
          setStats({
            total: data.meta.total || transformedData.length,
            with_ratings: data.meta.with_ratings || transformedData.length
          })
        }
      }
    } catch (error) {
      console.error('Erro ao buscar ranking:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const getFirstTag = (tags?: string): string => {
    if (!tags) return 'API'
    const tagList = tags.split(',').map(tag => tag.trim())
    return tagList[0] || 'API'
  }

  return (
    <>
      {/* Mensagem de erro */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 font-medium">Erro ao carregar ranking</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={retryFetch}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        </motion.div>
      )}

      {/* Botão de recarregar */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-end">
        <button
          onClick={retryFetch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Atualizando...' : 'Atualizar Ranking'}
        </button>
      </div>

      {/* Estatísticas gerais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
      >
        <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          📊 Estatísticas do Ranking
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total de APIs</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{stats.with_ratings}</p>
            <p className="text-sm text-gray-600">APIs no ranking</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-bold text-gray-900">
              {/* FIX: Adicionado Number() e fallback 0 para evitar erro de .toFixed */}
              {rankingData.length > 0 ? (Number(rankingData[0].rating) || 0).toFixed(1) : '0.0'}
            </p>
            <p className="text-sm text-gray-600">Maior nota</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-bold text-gray-900">
              {rankingData.reduce((sum, api) => sum + (Number(api.rating_count) || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Total avaliações</p>
          </div>
        </div>
      </motion.div>

      {/* Lista de APIs */}
      <div className="max-w-4xl mx-auto space-y-4">
        {rankingData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum dado disponível</p>
          </div>
        ) : (
          rankingData.map((api, index) => (
            <motion.div
              key={api.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border flex items-center gap-4 hover:shadow-md transition-all"
            >
              {/* Posição com Medalhas */}
              <div className="w-12 h-12 flex items-center justify-center font-bold text-xl">
                {index === 0 ? <Medal className="text-yellow-500 w-8 h-8" /> : 
                 index === 1 ? <Medal className="text-gray-400 w-8 h-8" /> :
                 index === 2 ? <Medal className="text-amber-600 w-8 h-8" /> :
                 <span className="text-gray-400">#{index + 1}</span>}
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-gray-900 text-lg">{api.name}</h2>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{api.tag}</span>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="ml-1 text-lg font-bold text-gray-900">
                      {(Number(api.rating) || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    {api.rating_count} avaliações
                  </div>
                </div>
              </div>

              {/* Link */}
              <Link
                href={`/apis/${generateSlug(api.name)}`}
                className="p-3 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
              >
                <ArrowUpRight className="w-6 h-6" />
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </>
  )
}