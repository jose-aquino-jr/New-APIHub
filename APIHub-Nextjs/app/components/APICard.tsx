'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, Shield, Globe, Zap, Users, Heart } from 'lucide-react'
import { generateSlug, getCategoryFromTags } from '@/lib/utils'
import type { API } from '@/types'

interface APICardProps {
  api: API
  index: number
  isFavorited: boolean
  toggleFavorite: (apiId: string) => Promise<void>
  user: any | null 
  isAuthenticated: boolean
}

const getCategoryColor = (cat: string) => {
  const colors: Record<string, string> = {
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
  return colors[cat] || colors.default
}

export function APICard({ api, index, isFavorited, toggleFavorite, user, isAuthenticated }: APICardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [favoriteState, setFavoriteState] = useState(isFavorited)
  const category = getCategoryFromTags(api.tags)

  useEffect(() => {
    setFavoriteState(isFavorited)
  }, [isFavorited])

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!isAuthenticated) {
      alert('Faça login para adicionar aos favoritos')
      return
    }
    
    if (!user) {
      alert('Sessão expirada. Por favor, faça login novamente.')
      return
    }
    
    setIsLoading(true)
    try {
      const newFavoriteState = !favoriteState
      setFavoriteState(newFavoriteState)
      await toggleFavorite(api.id)
    } catch (error) {
      console.error('Erro ao favoritar:', error)
      setFavoriteState(!favoriteState)
      alert('Erro ao favoritar/desfavoritar API')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="card group cursor-pointer relative overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-xl transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className={`badge ${getCategoryColor(category)} badge-glow`}>
            {category}
          </span>
          
          <button 
            onClick={handleFavoriteClick}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
              favoriteState 
                ? 'bg-red-50 text-red-500 shadow-sm hover:bg-red-100' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400'
            }`}
            title={favoriteState ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${favoriteState ? 'fill-red-500 text-red-500' : ''}`} />
            )}
          </button>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
          {api.name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {api.description}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  api.rating && i <= Math.round(api.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          
          <span className="text-sm font-medium text-gray-500">
            {api.rating && api.rating > 0 ? api.rating.toFixed(1) : '0 avaliações'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4 text-xs font-medium">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-200">
            <Users className="w-3 h-3 text-gray-500" />
          </div>
          <span className="text-gray-500">Por:</span>
          <span className="text-gray-900 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
            {api.created_by || 'Comunidade'}
          </span>
        </div>

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
          <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </Link>
      </div>
    </motion.div>
  )
  }