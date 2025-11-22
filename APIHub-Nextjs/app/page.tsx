'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Search, Filter, Star, Shield, Globe, Zap, X, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { generateSlug, getCategoryFromTags } from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'
import type { API, User } from '@/types'

export default function APICatalog() {
  const [apis, setApis] = useState<API[]>([])
  const [filteredApis, setFilteredApis] = useState<API[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const { user, favorites, toggleFavorite } = useAuth()

  useEffect(() => {
    loadAPIs()
  }, [])

  useEffect(() => {
    filterAPIs()
  }, [searchTerm, selectedCategory, apis])

  const loadAPIs = async () => {
    try {
      const { data, error } = await supabase
        .from('apis')
        .select('*')
        .order('name')

      if (error) throw error

      setApis(data || [])
      
      const allCategories = data?.map(api => getCategoryFromTags(api.tags)) || []
      const uniqueCategories = Array.from(new Set(allCategories))
      setCategories(['all', ...uniqueCategories])
    } catch (error) {
      console.error('Erro ao carregar APIs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAPIs = () => {
    let filtered = apis

    if (searchTerm) {
      filtered = filtered.filter(api =>
        api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        api.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        api.tags.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(api => 
        getCategoryFromTags(api.tags) === selectedCategory
      )
    }

    setFilteredApis(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
  }

  if (isLoading) {
    return <LoadingSkeleton />
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Catálogo de <span className="text-gradient">APIs</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubra e integre APIs gratuitas para seus projetos
          </p>
        </motion.div>

        {/* Search and Filters */}
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          showMobileFilters={showMobileFilters}
          setShowMobileFilters={setShowMobileFilters}
          onClearFilters={clearFilters}
          hasActiveFilters={searchTerm !== '' || selectedCategory !== 'all'}
        />

        {/* Results Info */}
        <ResultsInfo 
          count={filteredApis.length}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          onClearFilters={clearFilters}
          hasActiveFilters={searchTerm !== '' || selectedCategory !== 'all'}
        />

        {/* API Grid */}
        <APIGrid 
          apis={filteredApis} 
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          user={user}
        />

        {/* Empty State */}
        {filteredApis.length === 0 && <EmptyState onClearFilters={clearFilters} />}
      </div>
    </div>
  )
}

// Componente de Loading
function LoadingSkeleton() {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-2xl w-1/3 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          
          <div className="card mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-48"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card">
                <div className="flex justify-between mb-4">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-6"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Tipagem para SearchFilters
interface SearchFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  categories: string[]
  showMobileFilters: boolean
  setShowMobileFilters: (show: boolean) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

function SearchFilters({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  categories,
  showMobileFilters,
  setShowMobileFilters,
  onClearFilters,
  hasActiveFilters
}: SearchFiltersProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card mb-6 hidden md:block"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="input-icon-container flex-1 w-full">
            <Search className="input-icon" />
            <input
              type="text"
              placeholder="Buscar APIs por nome, descrição ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-with-icon pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="input-icon-right hover:bg-gray-100 rounded-full p-1 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <span className="text-sm font-medium text-gray-600">Filtrar:</span>
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select pr-8 appearance-none cursor-pointer bg-white hover:bg-gray-50 transition-colors"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas Categorias' : category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="btn-ghost text-xs text-gray-500 hover:text-gray-700 px-3 py-2"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Mobile Filters */}
      <div className="md:hidden mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="btn-secondary flex items-center gap-2 flex-1 justify-center"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white rounded-full w-2 h-2"></span>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="btn-ghost px-4"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card mt-3 overflow-hidden"
            >
              <div className="space-y-4">
                {/* Mobile Search */}
                <div className="input-icon-container">
                  <Search className="input-icon" />
                  <input
                    type="text"
                    placeholder="Buscar APIs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-with-icon"
                  />
                </div>

                {/* Mobile Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="select w-full"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'Todas Categorias' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

interface ResultsInfoProps {
  count: number
  searchTerm: string
  selectedCategory: string
  onClearFilters: () => void
  hasActiveFilters: boolean
}

function ResultsInfo({ count, searchTerm, selectedCategory, onClearFilters, hasActiveFilters }: ResultsInfoProps) {
  if (!hasActiveFilters) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between mb-6 px-2"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-600">
          {count} {count === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </span>
        
        <div className="flex items-center gap-2 flex-wrap">
          {searchTerm && (
            <span className="badge badge-blue flex items-center gap-1 text-xs">
              Busca: "{searchTerm}"
              <button onClick={() => {}} className="hover:text-blue-800">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {selectedCategory !== 'all' && (
            <span className="badge badge-purple flex items-center gap-1 text-xs">
              Categoria: {selectedCategory}
              <button onClick={() => {}} className="hover:text-purple-800">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Limpar todos
        </button>
      )}
    </motion.div>
  )
}

interface APIGridProps {
  apis: API[]
  favorites: string[]
  toggleFavorite: (apiId: string) => void
  user: User | null
}

function APIGrid({ apis, favorites, toggleFavorite, user }: APIGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
    >
      {apis.map((api, index) => (
        <APICard 
          key={api.id} 
          api={api} 
          index={index}
          isFavorited={favorites.includes(api.id)}
          onToggleFavorite={() => toggleFavorite(api.id)}
          user={user}
        />
      ))}
    </motion.div>
  )
}

interface APICardProps {
  api: API
  index: number
  isFavorited: boolean
  onToggleFavorite: () => void
  user: User | null
}
function APICard({ api, index, isFavorited, onToggleFavorite, user }: APICardProps) {
  const category = getCategoryFromTags(api.tags)

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Clima': return 'badge-blue'
      case 'Financeiro': return 'badge-green'
      case 'Notícias': return 'badge-purple'
      case 'IA': return 'badge-orange'
      default: return 'badge-blue'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="card group cursor-pointer relative overflow-hidden"
    >
      {/* Efeito de gradiente sutil no hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-4">
          <span className={`badge ${getCategoryColor(category)} badge-glow`}>
            {category}
          </span>
          
          {user && (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite()
              }}
              className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                isFavorited 
                  ? 'bg-orange-50 text-orange-500 shadow-sm' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-orange-400'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Nome e Descrição */}
        <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
          {api.name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {api.description}
        </p>

        {/* Método HTTP - Mantido por ser informação relevante */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Zap className="w-3 h-3" />
            <span>Método principal:</span>
          </div>
          <code className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 px-3 py-2 rounded-lg text-blue-700 font-mono transition-colors w-full block group-hover:border-blue-300">
            <span className={`font-semibold ${
              api.method === 'GET' ? 'text-green-600' :
              api.method === 'POST' ? 'text-blue-600' :
              api.method === 'PUT' ? 'text-yellow-600' :
              api.method === 'DELETE' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {api.method}
            </span>
            {api.endpoint_path && (
              <span className="text-gray-700"> {api.endpoint_path}</span>
            )}
          </code>
        </div>

        {/* Features */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 flex-wrap">
          {api.https && (
            <span className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-green-700 text-xs font-medium">HTTPS</span>
            </span>
          )}
          {api.cors && (
            <span className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-blue-700 text-xs font-medium">CORS</span>
            </span>
          )}
          <span className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-orange-700 text-xs font-medium">{api.authentication_type}</span>
          </span>
        </div>

        {/* Botão */}
        <Link
          href={`/apis/${generateSlug(api.name)}`}
          className="btn-primary w-full text-center group-hover:scale-105 transition-transform duration-200 inline-flex items-center justify-center gap-2"
        >
          Ver Detalhes
          <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </Link>
      </div>
    </motion.div>
  )
}

function EmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16"
    >
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-2">Nenhuma API encontrada</h3>
      <p className="text-gray-600 mb-6">Tente ajustar sua busca ou filtros</p>
      <button 
        onClick={onClearFilters}
        className="btn-primary"
      >
        Limpar Filtros
      </button>
    </motion.div>
  )
}
