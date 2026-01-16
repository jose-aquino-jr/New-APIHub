// app/apis/[slug]/page.tsx - VERSÃO COMPLETA CORRIGIDA
'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Star,
  Shield,
  Globe,
  Zap,
  Flag,
  Share2,
  Copy,
  Check,
  Send,
  AlertCircle,
  Loader2,
  MessageSquare,
  Heart,
  Users,
  BarChart3
} from 'lucide-react'
import {
  getCategoryFromTags,
  parseParameters,
  getApiBySlug,
  generateSlug,
  getRelatedApis,
} from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'
import type { API } from '@/types'

interface PageProps {
  params: {
    slug: string
  }
}

interface RatingStats {
  average: number
  total: number
  ratingCounts: Record<number, number>
  ratingPercentages: Record<number, number>
  distribution: Array<{
    stars: number
    count: number
    percentage: number
  }>
}

// Funções auxiliares para lidar com rating
const getRatingStars = (rating?: number) => {
  if (!rating || rating === 0) return 0
  return Math.round(rating)
}

const formatRating = (rating?: number) => {
  if (!rating || rating === 0) return 'Sem avaliações'
  return rating.toFixed(1)
}

const getRatingDescription = (rating: number) => {
  switch (rating) {
    case 1: return 'Péssima'
    case 2: return 'Ruim'
    case 3: return 'Regular'
    case 4: return 'Boa'
    case 5: return 'Excelente'
    default: return 'Selecione uma nota'
  }
}

export default function APIDetail({ params }: PageProps) {
  const [api, setApi] = useState<API | null>(null)
  const [relatedApis, setRelatedApis] = useState<API[]>([])
  const [copied, setCopied] = useState(false)
  const auth = useAuth()
  const { user, token, favorites, toggleFavorite, isAuthenticated } = auth

  const [showReportMenu, setShowReportMenu] = useState(false)
  const [showRateMenu, setShowRateMenu] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportCustomReason, setReportCustomReason] = useState('')
  const [rating, setRating] = useState<number>(0)
  const [ratingComment, setRatingComment] = useState('')
  const [loading, setLoading] = useState(false)
  // CORREÇÃO: Adicionar 'info' ao tipo
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoadingApi, setIsLoadingApi] = useState(true)
  
  // Novos estados para estatísticas
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [userHasRated, setUserHasRated] = useState(false)

  useEffect(() => {
    loadAPI()
  }, [params.slug])

  useEffect(() => {
    if (api && favorites) {
      setIsFavorite(favorites.includes(api.id))
    }
  }, [api, favorites])

  const loadAPI = async () => {
    try {
      setIsLoadingApi(true)
      const foundApi = await getApiBySlug(params.slug)
      if (!foundApi) {
        notFound()
        return
      }

      setApi(foundApi)
      
      const related = await getRelatedApis(foundApi, 4)
      setRelatedApis(related)
      
      // Carregar avaliação do usuário atual se estiver logado
      if (user && foundApi.id) {
        await loadUserRating(foundApi.id)
      }
      
      // Carregar estatísticas da API (público)
      if (foundApi.id) {
        await loadRatingStats(foundApi.id)
      }
    } catch (error) {
      console.error('Erro ao carregar API:', error)
      notFound()
    } finally {
      setIsLoadingApi(false)
    }
  }

  const loadUserRating = async (apiId: string) => {
    try {
      if (!user || !token) {
        setUserHasRated(false)
        return
      }
      
      const response = await fetch(`http://localhost:8000/avaliacao/user/${apiId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('DEBUG loadUserRating response:', {
        status: response.status,
        statusText: response.statusText
      })
      
      // Se for 401, o token pode estar expirado
      if (response.status === 401) {
        console.log('Token expirado ou inválido')
        setUserHasRated(false)
        // Tentar renovar a sessão
        const refreshed = await auth.checkSession()
        if (!refreshed) {
          // Se não conseguir renovar, o usuário precisa fazer login novamente
          setMessage({type: 'info', text: 'Sessão expirada. Faça login novamente para avaliar.'})
        }
        return
      }
      
      // Se for 404, o usuário ainda não avaliou
      if (response.status === 404) {
        setUserHasRated(false)
        return
      }
      
      if (!response.ok) {
        console.warn('Resposta não OK ao carregar avaliação do usuário:', response.status)
        setUserHasRated(false)
        return
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        setRating(data.data.rating)
        setRatingComment(data.data.comment || '')
        setUserHasRated(true)
      } else {
        setUserHasRated(false)
      }
    } catch (error) {
      console.error('Erro ao carregar avaliação do usuário:', error)
      setUserHasRated(false)
    }
  }

  const loadRatingStats = async (apiId: string) => {
    try {
      setLoadingStats(true)
      
      const response = await fetch(`http://localhost:8000/avaliacao/stats/${apiId}`)
      
      console.log('DEBUG loadRatingStats response:', {
        status: response.status,
        statusText: response.statusText
      })
      
      // Se não conseguir carregar estatísticas, apenas continua
      if (!response.ok) {
        console.log('API ainda não tem avaliações ou erro no servidor')
        setRatingStats(null)
        return
      }
      
      const data = await response.json()
      
      if (data.success && data.stats) {
        setRatingStats(data.stats)
      } else {
        setRatingStats(null)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      setRatingStats(null)
    } finally {
      setLoadingStats(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAuthError = () => {
    setMessage({type: 'error', text: 'Sessão expirada. Redirecionando para login...'})
    setTimeout(() => {
      const redirectPath = encodeURIComponent(window.location.pathname)
      window.location.href = `/login?redirect=${redirectPath}`
    }, 2000)
    return false
  }

  const handleReport = async (reason: string) => {
  if (!user || !token) {
    setMessage({type: 'error', text: 'Você precisa estar logado para denunciar uma API'})
    setTimeout(() => {
      const redirectPath = encodeURIComponent(window.location.pathname)
      window.location.href = `/login?redirect=${redirectPath}`
    }, 1500)
    return
  }

  if (!api) return

  setLoading(true)
  setMessage(null)

  try {
    const finalReason = reason === 'Outros' ? reportCustomReason : reason
    
    if (!finalReason.trim()) {
      setMessage({type: 'error', text: 'Por favor, informe o motivo da denúncia'})
      setLoading(false)
      return
    }

    console.log('DEBUG: Enviando denúncia...', {
      api_id: api.id,
      reason: finalReason,
      token: token?.substring(0, 20) + '...'
    })

    const response = await fetch('http://localhost:8000/api-reports', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_id: api.id,
        reason: finalReason
      })
    })

    // DEBUG: Log da resposta
    console.log('DEBUG handleReport response:', {
      status: response.status,
      statusText: response.statusText
    })

    // Se for 401, token expirado
    if (response.status === 401) {
      console.log('Token expirado, tentando renovar...')
      const refreshed = await auth.checkSession()
      if (!refreshed) {
        handleAuthError()
        setLoading(false)
        return
      }
      // Se renovou, tenta novamente
      return handleReport(reason)
    }

    const data = await response.json()
    console.log('DEBUG handleReport data:', data)

    if (!response.ok) {
      // Verificar se há erro específico
      if (data.message) {
        throw new Error(data.message)
      } else {
        throw new Error(`Erro HTTP ${response.status}`)
      }
    }

    if (data.success) {
      setMessage({type: 'success', text: 'Denúncia enviada com sucesso! Nossa equipe analisará o caso.'})
      setShowReportMenu(false)
      setReportReason('')
      setReportCustomReason('')
    } else {
      setMessage({type: 'error', text: data.message || 'Erro ao enviar denúncia'})
    }
  } catch (error) {
    console.error('Erro completo ao denunciar:', error)
    setMessage({type: 'error', text: error instanceof Error ? error.message : 'Erro ao enviar denúncia'})
  } finally {
    setLoading(false)
  }
}
  const handleRate = async () => {
    if (!user) {
      setMessage({type: 'error', text: 'Você precisa estar logado para avaliar uma API'})
      setTimeout(() => {
        const redirectPath = encodeURIComponent(window.location.pathname)
        window.location.href = `/login?redirect=${redirectPath}`
      }, 1500)
      return
    }

    if (!api) return

    // Verificar se o usuário já avaliou esta API
    if (userHasRated) {
      // CORREÇÃO: Use 'info' em vez de 'error' se quiser mensagem informativa
      setMessage({type: 'info', text: 'Você já avaliou esta API. Cada usuário pode avaliar uma API apenas uma vez.'})
      return
    }

    if (rating === 0) {
      setMessage({type: 'error', text: 'Por favor, selecione uma avaliação'})
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('http://localhost:8000/avaliacao', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_id: api.id,
          rating: rating,
          comment: ratingComment
        })
      })

      console.log('DEBUG handleRate response:', {
        status: response.status,
        statusText: response.statusText
      })

      // Se for 401, token expirado
      if (response.status === 401) {
        handleAuthError()
        setLoading(false)
        return
      }

      const data = await response.json()

      if (data.success) {
        setMessage({type: 'success', text: 'Avaliação enviada com sucesso!'})
        setShowRateMenu(false)
        setUserHasRated(true)
        
        // Recarregar estatísticas
        if (api.id) {
          await loadRatingStats(api.id)
        }
        
        // Resetar formulário
        setRating(0)
        setRatingComment('')
      } else {
        // Verificar se é erro de duplicação (usuário já avaliou)
        if (data.message?.includes('já está') || data.message?.includes('duplicada')) {
          setMessage({type: 'info', text: 'Você já avaliou esta API anteriormente.'})
          setUserHasRated(true)
        } else {
          setMessage({type: 'error', text: data.message || 'Erro ao enviar avaliação'})
        }
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Erro ao conectar com o servidor'})
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = async () => {
    if (!api) return
    
    if (!user) {
      setMessage({type: 'error', text: 'Você precisa estar logado para favoritar APIs'})
      setTimeout(() => {
        const redirectPath = encodeURIComponent(window.location.pathname)
        window.location.href = `/login?redirect=${redirectPath}`
      }, 1500)
      return
    }

    try {
      await toggleFavorite(api.id)
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error('Erro ao favoritar:', error)
      setMessage({type: 'error', text: 'Erro ao favoritar API'})
    }
  }

  const reportOptions = [
    { id: 'api_offline', label: '⚠️ API Inútil / Fora do ar', description: 'API não está funcionando ou retorna erros' },
    { id: 'offensive_content', label: '🚫 Conteúdo Ofensivo', description: 'Conteúdo impróprio, ofensivo ou inadequado' },
    { id: 'fake_data', label: '❌ Dados Falsos', description: 'API retorna informações incorretas ou falsas' },
    { id: 'terms_violation', label: '🛡️ Violação de Termos', description: 'API viola nossos termos de serviço' },
    { id: 'other', label: '📝 Outros', description: 'Outro motivo não listado' }
  ]

  if (isLoadingApi) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!api) {
    notFound()
    return null
  }

  const fullUrl = `${api.base_url}${api.endpoint_path || ''}`
  const parameters = api.parameters ? parseParameters(api.parameters) : {}
  const apiRating = api.rating || 0
  const starCount = getRatingStars(api.rating)

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container-custom py-6 px-4">

        {/* Mensagem de feedback */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : message.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : message.type === 'error' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-blue-600" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </motion.div>
        )}

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          <div className="flex flex-col gap-4">

            {/* LINHA SUPERIOR */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`badge ${getCategoryColor(getCategoryFromTags(api.tags))}`}>
                  {getCategoryFromTags(api.tags)}
                </span>
                <span className="text-orange-600 font-semibold">GRATUITA</span>
              </div>

              {/* AÇÕES */}
              <div className="flex items-center gap-3 relative">
                {/* FAVORITO */}
                <button
                  onClick={handleFavoriteToggle}
                  className={`p-2.5 rounded-xl shadow-sm transition-all ${
                    isFavorite
                      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                      : 'bg-white border hover:bg-gray-50'
                  }`}
                  title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <Heart 
                    size={18} 
                    className={isFavorite ? "fill-red-600" : ""}
                  />
                </button>

                {/* DENUNCIAR */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowReportMenu(!showReportMenu)
                      setShowRateMenu(false)
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Flag size={16} />
                    )}
                    Denunciar
                  </button>

                  {showReportMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 top-full mt-3 w-80 bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b">
                        <h3 className="font-bold text-gray-900">Denunciar API</h3>
                        <p className="text-sm text-gray-600 mt-1">Selecione o motivo da denúncia</p>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {reportOptions.map((option) => (
                          <div
                            key={option.id}
                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                              reportReason === option.id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => {
                              if (option.id === 'other') {
                                setReportReason('other')
                              } else {
                                const reasonText = option.label.replace(/^[^\s]+\s/, '')
                                handleReport(reasonText)
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded-full border flex items-center justify-center mt-0.5 ${
                                reportReason === option.id 
                                  ? 'border-blue-600 bg-blue-600' 
                                  : 'border-gray-300'
                              }`}>
                                {reportReason === option.id && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{option.label}</div>
                                <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {reportReason === 'other' && (
                        <div className="p-4 border-t">
                          <textarea
                            value={reportCustomReason}
                            onChange={(e) => setReportCustomReason(e.target.value)}
                            placeholder="Descreva o motivo da denúncia..."
                            className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-3">
                            <button
                              onClick={() => {
                                setShowReportMenu(false)
                                setReportReason('')
                                setReportCustomReason('')
                              }}
                              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleReport('Outros')}
                              disabled={!reportCustomReason.trim() || loading}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                              Enviar Denúncia
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* AVALIAR */}
                <div className="relative">
                  <button
                    onClick={() => {
                      if (userHasRated) {
                        setMessage({type: 'info', text: 'Você já avaliou esta API. Cada usuário pode avaliar apenas uma vez.'})
                        return
                      }
                      setShowRateMenu(!showRateMenu)
                      setShowReportMenu(false)
                    }}
                    disabled={loading || userHasRated}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-lg ${
                      userHasRated
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-amber-400 hover:bg-amber-500 text-amber-950'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : userHasRated ? (
                      <Check size={16} />
                    ) : (
                      <Star size={16} className="fill-amber-950" />
                    )}
                    {userHasRated ? 'Já avaliou' : 'Avaliar'}
                  </button>

                  {showRateMenu && !userHasRated && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 top-full mt-3 w-96 bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b">
                        <h3 className="font-bold text-gray-900">Avaliar API</h3>
                        <p className="text-sm text-gray-600 mt-1">Como foi sua experiência com esta API?</p>
                      </div>
                      
                      <div className="p-4">
                        {/* Estrelas */}
                        <div className="flex justify-center gap-1 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="p-2 hover:scale-110 transition-transform"
                            >
                              <Star
                                size={32}
                                className={`${
                                  star <= rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'fill-gray-300 text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        
                        <div className="text-center mb-4">
                          <span className="text-lg font-semibold text-gray-900">
                            {getRatingDescription(rating)}
                          </span>
                          <div className="flex items-center justify-center gap-2 mt-1">
                            {[...Array(rating)].map((_, i) => (
                              <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            ))}
                          </div>
                        </div>

                        {/* Comentário */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MessageSquare className="inline w-4 h-4 mr-1" />
                            Comentário (opcional)
                          </label>
                          <textarea
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            placeholder="Compartilhe sua experiência..."
                            className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setShowRateMenu(false)
                              setRating(0)
                              setRatingComment('')
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleRate}
                            disabled={rating === 0 || loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Enviar Avaliação
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* COMPARTILHAR */}
                <button
                  aria-label="Compartilhar API"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: api.name,
                        text: api.description,
                        url: window.location.href,
                      })
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                      setMessage({type: 'success', text: 'Link copiado para a área de transferência!'})
                    }
                  }}
                  className="p-2.5 bg-white border rounded-xl hover:bg-gray-50 shadow-sm"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* TÍTULO + ESTRELAS */}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{api.name}</h1>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i <= starCount
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-300 text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm font-semibold text-yellow-600">
                  {formatRating(api.rating)}
                </span>
                {apiRating > 0 && (
                  <span className="text-sm text-gray-500">
                    ({apiRating.toFixed(2)})
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-lg">{api.description}</p>

            {/* INFO */}
            <div className="flex gap-4 text-sm">
              {api.https && (
                <span className="flex items-center gap-1 text-green-600">
                  <Shield size={14} /> HTTPS
                </span>
              )}
              {api.cors && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Globe size={14} /> CORS
                </span>
              )}
              <span className="flex items-center gap-1 text-orange-600">
                <Zap size={14} /> {api.authentication_type}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ESTATÍSTICAS DA API */}
        {loadingStats ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Carregando estatísticas...</span>
            </div>
          </motion.div>
        ) : ratingStats && ratingStats.total > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Média e total */}
              <div className="lg:w-1/3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={24}
                        className={`${
                          i <= Math.round(ratingStats.average)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-300 text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {ratingStats.average.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{ratingStats.total} avaliações</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 size={16} />
                      <span>Média: {ratingStats.average.toFixed(1)}/5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribuição */}
              <div className="lg:w-2/3">
                <h3 className="font-semibold text-gray-900 mb-4">Distribuição de avaliações</h3>
                <div className="space-y-3">
                  {ratingStats.distribution.map((item) => (
                    <div key={item.stars} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-sm text-gray-700">{item.stars} estrelas</span>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-right">
                        <span className="text-sm text-gray-700">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <div className="text-center py-6">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma avaliação ainda
              </h3>
              <p className="text-gray-600 mb-4">
                Seja o primeiro a avaliar esta API!
              </p>
              {user && !userHasRated && (
                <button
                  onClick={() => setShowRateMenu(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Star size={16} />
                  Avaliar API
                </button>
              )}
              {!user && (
                <p className="text-gray-500 text-sm">
                  Faça login para avaliar esta API
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* CONTEÚDO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* URL BASE */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-3">URL Base</h2>
              <div className="flex gap-2">
                <code className="flex-1 bg-gray-900 text-white p-3 rounded-lg text-sm overflow-x-auto">
                  {api.base_url}
                </code>
                <button
                  onClick={() => copyToClipboard(api.base_url)}
                  className="p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* ENDPOINT */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-3">Endpoint</h2>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded font-medium ${
                  api.method === 'GET' ? 'bg-green-100 text-green-800' :
                  api.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                  api.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                  api.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {api.method}
                </span>
                <code className="flex-1 bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                  {fullUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(fullUrl)}
                  className="p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* PARÂMETROS */}
            {Object.keys(parameters).length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-3">Parâmetros</h2>
                <div className="space-y-2">
                  {Object.entries(parameters).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center py-2 px-3 border rounded-lg hover:bg-gray-50"
                    >
                      <code className="text-blue-600 font-medium">{key}</code>
                      <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* Resumo da API */}
            <div className="card">
              <h3 className="font-semibold mb-4 text-lg">Resumo da API</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Categoria</span>
                  <span className="font-medium text-gray-900">{getCategoryFromTags(api.tags)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Método</span>
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    api.method === 'GET' ? 'bg-green-100 text-green-800' :
                    api.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    api.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                    api.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {api.method}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Autenticação</span>
                  <span className="font-medium text-gray-900">{api.authentication_type}</span>
                </div>
                {ratingStats && ratingStats.total > 0 && (
                  <>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Avaliações</span>
                        <span className="font-medium text-gray-900">{ratingStats.total}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-600">Média</span>
                        <span className="font-medium text-gray-900">{ratingStats.average.toFixed(1)}/5</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {relatedApis.length > 0 && (
              <div className="card">
                <h3 className="font-semibold mb-3 text-lg">APIs Relacionadas</h3>
                <div className="space-y-3">
                  {relatedApis.map((r) => {
                    const relatedRating = r.rating || 0
                    const relatedStarCount = getRatingStars(r.rating)
                    
                    return (
                      <Link
                        key={r.id}
                        href={`/apis/${generateSlug(r.name)}`}
                        className="block p-4 border rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                      >
                        <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                          {r.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {r.description}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {relatedRating > 0 && (
                            <>
                              <Star size={14} className="fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-700">{formatRating(r.rating)}</span>
                            </>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* Cores de categoria */
function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    Palavras: 'badge-blue',
    IA: 'badge-purple',
    Financeiro: 'badge-green',
    default: 'badge-blue',
  }
  return colors[category] || colors.default
}