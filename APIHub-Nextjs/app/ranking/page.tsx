'use client'

import { Trophy, Medal, Star, ArrowUpRight, Loader2, Users, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { generateSlug } from '@/lib/utils'

type APIItem = {
  id: string
  name: string
  tag: string
  rating: number
  rating_count: number // Número real de avaliações
  tags?: string
  description?: string
  has_minimum_ratings?: boolean
}

interface RankingData {
  success: boolean
  data: APIItem[]
  meta?: {
    total: number
    with_ratings: number
    minimum_ratings: number
  }
  error?: string
}

export default function RankingPage() {
  const [rankingData, setRankingData] = useState<APIItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{total: number, with_ratings: number}>({total: 0, with_ratings: 0})

  useEffect(() => {
    fetchRankingData()
  }, [])

  const fetchRankingData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('http://localhost:8000/ranking')
      
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: RankingData = await response.json()
      
      if (data.success && data.data) {
        // Transformar os dados da API para o formato esperado
        const transformedData = data.data.map(api => ({
          id: api.id,
          name: api.name,
          tag: getFirstTag(api.tags) || 'API',
          rating: api.rating || 0,
          rating_count: api.rating_count || 0,
          votes: api.rating_count || 0, // Mantendo compatibilidade
          tags: api.tags,
          description: api.description,
          has_minimum_ratings: api.has_minimum_ratings
        }))
        
        // Nota: O backend já ordena, mas podemos garantir a ordenação aqui também
        const sortedData = transformedData.sort((a, b) => {
          // Ordenar por rating (média)
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          // Desempate: quem tem mais avaliações
          return b.rating_count - a.rating_count;
        })
        
        setRankingData(sortedData)
        
        // Atualizar estatísticas
        if (data.meta) {
          setStats({
            total: data.meta.total,
            with_ratings: data.meta.with_ratings
          })
        }
      } else {
        throw new Error(data.error || 'Erro ao carregar ranking')
      }
    } catch (error) {
      console.error('Erro ao buscar ranking:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      // Fallback para dados de exemplo se a API falhar
      setRankingData(getFallbackData())
      setStats({total: 4, with_ratings: 4})
    } finally {
      setLoading(false)
    }
  }

  // Função para obter a primeira tag
  const getFirstTag = (tags?: string): string => {
    if (!tags) return 'API'
    const tagList = tags.split(',').map(tag => tag.trim())
    return tagList[0] || 'API'
  }

  // Dados de fallback atualizados
  const getFallbackData = (): APIItem[] => [
    {
      id: '1',
      name: 'OpenWeather API',
      tag: 'Clima',
      rating: 4.9,
      rating_count: 120,
      votes: 120
    },
    {
      id: '2',
      name: 'Stripe API',
      tag: 'Pagamentos',
      rating: 4.9, // Mesmo rating que a primeira, mas menos avaliações
      rating_count: 98,
      votes: 98
    },
    {
      id: '3',
      name: 'Spotify API',
      tag: 'Música',
      rating: 4.8,
      rating_count: 87,
      votes: 87
    },
    {
      id: '4',
      name: 'GitHub API',
      tag: 'Dev',
      rating: 4.7,
      rating_count: 150,
      votes: 150
    }
  ].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating
    return b.rating_count - a.rating_count
  })

  const retryFetch = () => {
    fetchRankingData()
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando ranking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container-custom px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-2xl mb-4">
            <Trophy className="text-yellow-600 w-8 h-8" />
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900">
            Ranking da Comunidade
          </h1>

          <p className="text-gray-600 mt-2 text-lg">
            As APIs mais bem avaliadas pela comunidade
          </p>

          {/* Botão de recarregar */}
          <button
            onClick={retryFetch}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Atualizando...' : 'Atualizar Ranking'}
          </button>
        </motion.div>

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
              <p className="text-xs text-gray-500 mt-1">(mín. 5 avaliações)</p>
            </div>
            <div className="text-center p-3 bg-white rounded-xl">
              <p className="text-2xl font-bold text-gray-900">
                {rankingData.length > 0 ? rankingData[0].rating.toFixed(1) : '0.0'}
              </p>
              <p className="text-sm text-gray-600">Maior nota</p>
            </div>
            <div className="text-center p-3 bg-white rounded-xl">
              <p className="text-2xl font-bold text-gray-900">
                {rankingData.reduce((sum, api) => sum + api.rating_count, 0)}
              </p>
              <p className="text-sm text-gray-600">Total de avaliações</p>
            </div>
          </div>
        </motion.div>

        {/* Lista */}
        <div className="max-w-4xl mx-auto space-y-4">
          {rankingData.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma API no ranking ainda</p>
              <p className="text-gray-400 text-sm mt-1">Seja o primeiro a avaliar uma API!</p>
              <button
                onClick={retryFetch}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            rankingData.map((api, index) => (
              <motion.div
                key={api.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border flex items-center gap-4 hover:shadow-md transition-shadow"
              >

                {/* Posição */}
                <div className="w-12 h-12 flex items-center justify-center font-bold text-xl">
                  {index === 0 ? (
                    <div className="text-center">
                      <Medal className="text-yellow-500 w-8 h-8 mx-auto" />
                      <span className="text-xs text-yellow-600 block mt-1">1º</span>
                    </div>
                  ) : index === 1 ? (
                    <div className="text-center">
                      <Medal className="text-gray-400 w-8 h-8 mx-auto" />
                      <span className="text-xs text-gray-600 block mt-1">2º</span>
                    </div>
                  ) : index === 2 ? (
                    <div className="text-center">
                      <Medal className="text-amber-600 w-8 h-8 mx-auto" />
                      <span className="text-xs text-amber-700 block mt-1">3º</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-2xl text-gray-400">#{index + 1}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-gray-900 text-lg">
                      {api.name}
                    </h2>

                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                      {api.tag}
                    </span>

                    {/* Indicador de empate */}
                    {index > 0 && api.rating === rankingData[index - 1].rating && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        Empate em nota
                      </span>
                    )}
                  </div>

                  {api.description && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-1">
                      {api.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="ml-1 text-lg font-bold text-gray-900">
                          {api.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 ml-2">média</span>
                    </div>

                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="ml-1 text-sm text-gray-700 font-medium">
                        {api.rating_count}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        {api.rating_count === 1 ? 'avaliação' : 'avaliações'}
                      </span>
                    </div>

                    {/* Badge para APIs com muitas avaliações */}
                    {api.rating_count >= 50 && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        ⭐ Popular
                      </span>
                    )}
                  </div>
                </div>

                {/* Ação */}
                <Link
                  href={`/apis/${generateSlug(api.name)}`}
                  className="p-3 hover:bg-orange-50 text-orange-500 rounded-full transition-colors"
                  aria-label={`Ver mais sobre ${api.name}`}
                >
                  <ArrowUpRight className="w-6 h-6" />
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* Informações sobre o ranking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mt-8 p-6 bg-gray-50 rounded-2xl border"
        >
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            ℹ️ Como funciona o ranking?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">📈 Critérios de ordenação:</h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <span><strong>1º Critério:</strong> Média de avaliações (rating)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <span><strong>2º Critério:</strong> Número de avaliações (desempate)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <span>APIs com mesma nota: quem tem mais avaliações fica na frente</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">✅ Requisitos para entrar no ranking:</h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <span>Mínimo de <strong>5 avaliações</strong> para ser considerado</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <span>Atualizado automaticamente a cada nova avaliação</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <span>Qualquer usuário pode avaliar uma API</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Exemplo prático */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-800 mb-2">🎯 Exemplo de desempate:</h5>
            <p className="text-sm text-blue-700">
              Se duas APIs têm nota <strong>4.8</strong>, mas:
            </p>
            <ul className="text-sm text-blue-700 mt-1 ml-4">
              <li>• <strong>API A:</strong> 4.8 com 120 avaliações</li>
              <li>• <strong>API B:</strong> 4.8 com 85 avaliações</li>
            </ul>
            <p className="text-sm text-blue-700 mt-1">
              A <strong>API A ficará na frente</strong> por ter mais avaliações com a mesma nota!
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  )
}