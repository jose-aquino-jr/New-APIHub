'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, ArrowRight, Heart } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { generateSlug, getCategoryFromTags } from '@/lib/utils'
import type { API } from '@/types'

export default function Favoritos() {
  const { user, favorites } = useAuth()
  const [favoriteApis, setFavoriteApis] = useState<API[]>([])

  useEffect(() => {
    loadFavoriteApis()
  }, [favorites])

  const loadFavoriteApis = async () => {
    if (favorites.length === 0) {
      setFavoriteApis([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('apis')
        .select('*')
        .in('id', favorites)

      if (error) throw error
      setFavoriteApis(data || [])
    } catch (error) {
      console.error('Erro ao carregar APIs favoritas:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Faça login para acessar seus favoritos</p>
          <Link href="/login" className="btn-primary">
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Seus <span className="text-gradient">Favoritos</span>
          </h1>
          <p className="text-gray-600">
            {favoriteApis.length === 0 
              ? "Você ainda não favoritou nenhuma API"
              : `${favoriteApis.length} API${favoriteApis.length === 1 ? '' : 's'} favoritada${favoriteApis.length === 1 ? '' : 's'}`
            }
          </p>
        </motion.div>

        {favoriteApis.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Nenhum favorito ainda</h3>
            <p className="text-gray-600 mb-6">Explore o catálogo e salve suas APIs favoritas</p>
            <Link href="/apis" className="btn-primary inline-flex items-center gap-2">
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-4 h-4" />
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
                className="card group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="badge badge-blue">
                    {getCategoryFromTags(api.tags)}
                  </span>
                  <Star className="w-5 h-5 text-orange-500 fill-current" />
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {api.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {api.description}
                </p>

                <div className="mb-4">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono border">
                    {api.method} {api.endpoint_path || '/'}
                  </code>
                </div>

                <Link
                  href={`/apis/${generateSlug(api.name)}`}
                  className="btn-primary w-full text-center group-hover:scale-105 transition-transform"
                >
                  Ver Detalhes
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}