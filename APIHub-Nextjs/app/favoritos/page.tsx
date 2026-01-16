'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, ArrowRight, Heart, X, Shield, Globe, Zap } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { generateSlug, getCategoryFromTags } from '@/lib/utils'
import type { API } from '@/types'

export default function Favoritos() {
  const { user, favorites, toggleFavorite, token } = useAuth()
  const [favoriteApis, setFavoriteApis] = useState<API[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  // Usar valores individuais estáveis para as dependências
  const userId = user?.id
  const authToken = token

  useEffect(() => {
    console.log('useEffect disparado:', { userId, authToken })
    
    if (userId && authToken) {
      loadFavoriteApis()
    } else {
      setFavoriteApis([])
      setIsLoading(false)
    }
  }, [userId, authToken]) // Usar valores estáveis e primitivos

  const loadFavoriteApis = async () => {
    console.log('Carregando favoritos...', { userId, authToken })
    
    if (!userId || !authToken) {
      setFavoriteApis([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // Buscar favoritos do backend com autenticação
      const response = await fetch('https://apihub-br.duckdns.org/user-favorites', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Dados recebidos do backend:', data)
        
        if (data.success && data.data) {
          // Extrair as APIs dos favoritos - CORREÇÃO AQUI
          const apis = data.data
            .filter((fav: any) => fav.apis && fav.apis.id) // Filtrar apenas com APIs válidas
            .map((fav: any) => ({
              ...fav.apis,
              favorite_id: fav.id // Incluir ID do favorito se necessário
            }))
          
          console.log('APIs extraídas:', apis)
          
          // Ordenar por data de criação (mais recentes primeiro)
          apis.sort((a: API, b: API) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          
          setFavoriteApis(apis)
        } else {
          console.warn('Nenhum dado retornado ou formato inesperado:', data)
          setFavoriteApis([])
        }
      } else if (response.status === 401) {
        // Token inválido ou expirado
        console.error('Token inválido ou expirado')
        setFavoriteApis([])
      } else {
        console.error('Erro na resposta:', response.status, response.statusText)
        setFavoriteApis([])
      }
    } catch (error) {
      console.error('Erro ao carregar APIs favoritas:', error)
      setFavoriteApis([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFavorite = async (apiId: string) => {
    if (isRemoving) return // Evitar múltiplos cliques
    
    console.log('Removendo favorito:', apiId)
    setIsRemoving(apiId)
    
    try {
      // Remove do backend usando a função toggleFavorite
      const result = await toggleFavorite(apiId)
      console.log('Resultado da remoção:', result)
      
      // Atualiza a lista localmente
      setFavoriteApis(prev => prev.filter(api => api.id !== apiId))
      
      console.log('Lista atualizada localmente')
      
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
      
      // Mostrar mensagem de erro mais específica
      let errorMessage = 'Erro ao remover dos favoritos'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      alert(`Erro: ${errorMessage}`)
      
      // Recarregar a lista para sincronizar com o backend
      await loadFavoriteApis()
    } finally {
      setIsRemoving(null)
    }
  }

  const getCategoryColor = (cat: string) => {
    const colors = {
      'Clima': 'badge-blue',
      'Financeiro': 'badge-green', 
      'IA': 'badge-purple',
      'Animais': 'badge-orange',
      'Palavras': 'badge-blue',
      'Dados': 'badge-purple',
      'Educação': 'badge-green',
      'Livros': 'badge-orange',
      'Produtos': 'badge-red',
      'Diversão': 'badge-pink',
      'Imagens': 'badge-purple',
      'Tradução': 'badge-blue',
      'Nomes': 'badge-indigo',
      'Localização': 'badge-red',
      'Fotos': 'badge-purple',
      'Redes Sociais': 'badge-blue',
      'Música': 'badge-green',
      'Jogos': 'badge-yellow',
      'Desenvolvimento': 'badge-gray',
      'Email': 'badge-blue',
      'Calendário': 'badge-green',
      'Análises': 'badge-indigo',
      'Mobile': 'badge-purple',
      'default': 'badge-blue'
    }
    return colors[cat as keyof typeof colors] || colors.default
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Heart className="w-10 h-10 text-red-500" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Faça login para acessar seus favoritos e salvar suas APIs preferidas
          </p>
          <Link 
            href="/login" 
            className="btn-primary inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg"
          >
            <Heart className="w-4 h-4" />
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl mx-auto mb-6 shadow-xl"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Heart className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Seus <span className="text-gradient">Favoritos</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {isLoading 
              ? "Carregando suas APIs favoritas..."
              : favoriteApis.length === 0 
                ? "Você ainda não favoritou nenhuma API. Comece explorando nosso catálogo!"
                : `Você tem ${favoriteApis.length} API${favoriteApis.length === 1 ? '' : 's'} favoritada${favoriteApis.length === 1 ? '' : 's'}`
            }
          </p>
        </motion.div>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mb-6"></div>
            <p className="text-gray-600">Carregando seus favoritos...</p>
          </motion.div>
        ) : favoriteApis.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 max-w-2xl mx-auto"
          >
            <div className="text-7xl mb-6">⭐</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Nenhum favorito ainda</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Explore nosso catálogo de APIs gratuitas e salve suas favoritas para acessar rapidamente
            </p>
            <Link 
              href="/apis" 
              className="btn-primary inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Explorar Catálogo</span>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favoriteApis.map((api, index) => (
              <motion.div
                key={api.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="card group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-xl transition-all duration-300"
              >
                {/* Botão de Remover - COM HITBOX AJUSTADA */}
                <button
                  onClick={() => handleRemoveFavorite(api.id)}
                  disabled={isRemoving === api.id}
                  className="absolute top-4 right-4 p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors z-50 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remover dos favoritos"
                >
                  {isRemoving === api.id ? (
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </button>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`badge ${getCategoryColor(getCategoryFromTags(api.tags))} badge-glow`}>
                      {getCategoryFromTags(api.tags)}
                    </span>
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
                    {api.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {api.description}
                  </p>

                  {/* Avaliação da API */}
                  {api.rating && api.rating > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i <= Math.round(api.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-300 text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{(api.rating || 0).toFixed(1)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 flex-wrap">
                    {api.https && (
                      <span className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="text-green-700 text-xs font-medium">HTTPS</span>
                      </span>
                    )}
                    {api.cors && (
                      <span className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-700 text-xs font-medium">CORS</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-700 text-xs font-medium">
                        {api.authentication_type === 'none' ? 'Nenhuma' : 'Com Autenticação'}
                      </span>
                    </span>
                  </div>

                  <Link
                    href={`/apis/${generateSlug(api.name)}`}
                    className="btn-primary w-full text-center group-hover:scale-105 transition-transform duration-200 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
                  >
                    Ver Detalhes
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Efeito de fundo gradiente */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 to-pink-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Botão para forçar recarregamento */}
        {!isLoading && favoriteApis.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8"
          >
            <button
              onClick={loadFavoriteApis}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors hover:bg-blue-50 px-4 py-2 rounded-lg"
            >
              Atualizar Lista
            </button>
          </motion.div>
        )}

        {/* Link para voltar ao catálogo */}
        {favoriteApis.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12 pt-8 border-t border-gray-200/50"
          >
            <Link 
              href="/apis" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors hover:bg-gray-50 px-6 py-3 rounded-xl"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Voltar ao Catálogo</span>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}