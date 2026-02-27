'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Star, 
  Shield, 
  Globe,
  Zap, 
  X, 
  Sparkles,
  Heart
} from 'lucide-react'
import { generateSlug, getCategoryFromTags } from '@/lib/utils'
import { useAuth } from './AuthProvider'
import type { API } from '@/types'
import { APICard } from './APICard'
import { CategoryGrid } from './CategoryGrid'

interface APICatalogClientProps {
  initialApis: API[]
}

export function APICatalogClient({ initialApis }: APICatalogClientProps) {
  const [apis, setApis] = useState<API[]>(initialApis)
  const [filteredApis, setFilteredApis] = useState<API[]>(initialApis)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const { user, favorites, toggleFavorite, isAuthenticated } = useAuth()

  useEffect(() => {
    const allCategories = apis.map(api => getCategoryFromTags(api.tags)) || []
    const uniqueCategories = Array.from(new Set(allCategories)).filter(Boolean)
    setCategories(['all', ...uniqueCategories])
  }, [apis])

  useEffect(() => {
    filterAPIs()
  }, [searchTerm, selectedCategories, apis])

  const filterAPIs = () => {
    let filtered = apis

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(api => 
        api.name.toLowerCase().includes(searchLower) ||
        api.description.toLowerCase().includes(searchLower) ||
        api.tags.toLowerCase().includes(searchLower)
      )
    }

    if (selectedCategories.length > 0 && !selectedCategories.includes('all')) {
      filtered = filtered.filter(api => 
        selectedCategories.includes(getCategoryFromTags(api.tags))
      )
    }

    setFilteredApis(filtered)
  }

  const toggleCategory = (category: string) => {
    if (category === 'all') {
      setSelectedCategories(['all'])
    } else {
      setSelectedCategories(prev => {
        const newSelection = prev.filter(cat => cat !== 'all')
        if (newSelection.includes(category)) {
          return newSelection.filter(cat => cat !== category)
        } else {
          return [...newSelection, category]
        }
      })
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    setSelectedCategories(prev => prev.filter(cat => cat !== categoryToRemove))
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedCategories([])
  }

  const hasActiveFilters = searchTerm !== '' || selectedCategories.length > 0

  return (
    <div className="container-custom py-6 md:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 md:mb-12"
      >
        <motion.div 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg"
          whileHover={{ scale: 1.05 }}
        >
          <Sparkles className="w-4 h-4" />
          Catálogo de APIs Gratuitas
        </motion.div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
          Descubra <span className="text-gradient">APIs Incríveis</span>
        </h1>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Explore {apis.length} APIs gratuitas organizadas por categoria para seus projetos
        </p>
      </motion.div>

      {/* Barra de Pesquisa */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 w-full relative">
              <div className="input-icon-container">
                <Search className="input-icon text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar APIs por nome, descrição ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-with-icon pr-12 bg-white/50 backdrop-blur-sm border-gray-200/50 focus:border-blue-300 focus:bg-white text-lg"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={clearAllFilters}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all shadow-lg whitespace-nowrap"
              >
                Limpar Filtros
              </motion.button>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50">
            <div className="text-sm text-gray-600">
              {hasActiveFilters ? (
                <span>
                  Mostrando <strong>{filteredApis.length}</strong> de <strong>{apis.length}</strong> APIs
                </span>
              ) : (
                <span>
                  <strong>{apis.length}</strong> APIs disponíveis
                </span>
              )}
            </div>
            
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {searchTerm && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    <span>Busca: "{searchTerm}"</span>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="hover:text-blue-900 transition-colors ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {selectedCategories.map(category => (
                  <div key={category} className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    <span>{category}</span>
                    <button
                      onClick={() => removeCategory(category)}
                      className="hover:text-purple-900 transition-colors ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Grade de Categorias */}
      <CategoryGrid
        categories={categories.filter(cat => cat !== 'all')}
        selectedCategories={selectedCategories}
        onCategorySelect={toggleCategory}
      />

      {/* Results Info */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-4 bg-white/50 rounded-xl border border-gray-200/50"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">
              {filteredApis.length} {filteredApis.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </span>
          </div>

          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors hover:bg-blue-50 px-3 py-1.5 rounded-lg self-start sm:self-auto"
          >
            Limpar todos os filtros
          </button>
        </motion.div>
      )}

      {/* API Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12"
      >
        {filteredApis.map((api, index) => (
          <APICard 
            key={api.id} 
            api={api} 
            index={index}
            isFavorited={favorites.includes(api.id)}
            toggleFavorite={toggleFavorite}
            user={user}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredApis.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Nenhuma API encontrada</h3>
          <p className="text-gray-600 mb-6">Tente ajustar sua busca ou filtros</p>
          <button 
            onClick={clearAllFilters}
            className="btn-primary bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
          >
            Limpar Filtros
          </button>
        </motion.div>
      )}
    </div>
  )
}