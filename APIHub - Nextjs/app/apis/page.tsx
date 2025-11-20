'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, Filter, Star, Shield, Globe, Zap } from 'lucide-react'
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
      
      // Extrair categorias únicas das tags - CORRIGIDO
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
        />

        {/* API Grid */}
        <APIGrid 
          apis={filteredApis} 
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          user={user}
        />

        {/* Empty State */}
        {filteredApis.length === 0 && <EmptyState />}
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
}


function SearchFilters({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  categories 
}: SearchFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card mb-8"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input - CORRIGIDO COM NOVAS CLASSES */}
        <div className="input-icon-container flex-1">
          <Search className="input-icon" />
          <input
            type="text"
            placeholder="Buscar APIs por nome, descrição ou tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-with-icon"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select w-48"
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

// Tipagem para APICard
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
      className="card group cursor-pointer"
    >
      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-4">
        <span className={`badge ${getCategoryColor(category)}`}>
          {category}
        </span>
        
        {user && (
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className={`p-2 rounded-lg transition-all ${
              isFavorited 
                ? 'bg-orange-50 text-orange-500' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Nome e Descrição */}
      <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
        {api.name}
      </h3>
      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
        {api.description}
      </p>

      {/* Endpoint */}
      <div className="mb-4">
        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono border">
          {api.method} {api.endpoint_path || '/'}
        </code>
      </div>

      {/* Features */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
        {api.https && (
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-green-500" />
            <span>HTTPS</span>
          </span>
        )}
        {api.cors && (
          <span className="flex items-center gap-1">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>CORS</span>
          </span>
        )}
        <span className="flex items-center gap-1">
          <Zap className="w-4 h-4 text-orange-500" />
          <span>{api.authentication_type}</span>
        </span>
      </div>

      {/* Botão */}
      <Link
        href={`/apis/${generateSlug(api.name)}`}
        className="btn-primary w-full text-center group-hover:scale-105 transition-transform"
      >
        Ver Detalhes
      </Link>
    </motion.div>
  )
}

// Componente de Estado Vazio
function EmptyState() {
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
        onClick={() => window.location.reload()}
        className="btn-ghost"
      >
        Limpar Busca
      </button>
    </motion.div>
  )
}