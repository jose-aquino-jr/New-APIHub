'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Star, 
  Shield, 
  Globe, 
  Zap, 
  X, 
  ChevronDown, 
  Sparkles,
  Cloud,
  Database,
  Book,
  ShoppingCart,
  GraduationCap,
  Image,
  Smile,
  DollarSign,
  Languages,
  PawPrint,
  Users,
  MapPin,
  Camera,
  MessageCircle,
  Music,
  Gamepad2,
  Brain,
  Code,
  Mail,
  Calendar,
  BarChart3,
  Smartphone
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { generateSlug, getCategoryFromTags } from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'
import type { API, User } from '@/types'

// Mapeamento de ícones para categorias COMPLETO
const CATEGORY_ICONS: { [key: string]: any } = {
  'Animais': PawPrint,
  'Palavras': Languages,
  'Dados': Database,
  'Educação': GraduationCap,
  'Livros': Book,
  'Produtos': ShoppingCart,
  'Clima': Cloud,
  'Diversão': Smile,
  'Imagens': Image,
  'Financeiro': DollarSign,
  'Tradução': Languages,
  'Nomes': Users,
  'Localização': MapPin,
  'Fotos': Camera,
  'Redes Sociais': MessageCircle,
  'Música': Music,
  'Jogos': Gamepad2,
  'IA': Brain,
  'Desenvolvimento': Code,
  'Email': Mail,
  'Calendário': Calendar,
  'Análises': BarChart3,
  'Mobile': Smartphone
}

// Cores específicas para cada categoria
const CATEGORY_COLORS: { [key: string]: string } = {
  'Animais': 'from-orange-500 to-pink-500',
  'Palavras': 'from-blue-500 to-cyan-500',
  'Dados': 'from-purple-500 to-indigo-500',
  'Educação': 'from-green-500 to-emerald-500',
  'Livros': 'from-amber-500 to-orange-500',
  'Produtos': 'from-red-500 to-rose-500',
  'Clima': 'from-cyan-500 to-blue-500',
  'Diversão': 'from-pink-500 to-rose-500',
  'Imagens': 'from-violet-500 to-purple-500',
  'Financeiro': 'from-emerald-500 to-green-500',
  'Tradução': 'from-sky-500 to-blue-500',
  'Nomes': 'from-indigo-500 to-purple-500',
  'Localização': 'from-red-500 to-orange-500',
  'Fotos': 'from-purple-500 to-pink-500',
  'Redes Sociais': 'from-blue-500 to-indigo-500',
  'Música': 'from-green-500 to-teal-500',
  'Jogos': 'from-yellow-500 to-orange-500',
  'IA': 'from-purple-500 to-blue-500',
  'Desenvolvimento': 'from-gray-600 to-gray-800',
  'Email': 'from-blue-500 to-cyan-500',
  'Calendário': 'from-green-500 to-emerald-500',
  'Análises': 'from-indigo-500 to-purple-500',
  'Mobile': 'from-blue-500 to-purple-500'
}

// Categorias populares adicionais
const POPULAR_CATEGORIES = ['IA', 'Redes Sociais', 'Música', 'Localização', 'Desenvolvimento']

export default function APICatalog() {
  const [apis, setApis] = useState<API[]>([])
  const [filteredApis, setFilteredApis] = useState<API[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [searchType, setSearchType] = useState<'all' | 'name' | 'description' | 'tags'>('all')
  const { user, favorites, toggleFavorite } = useAuth()

  useEffect(() => {
    loadAPIs()
  }, [])

  useEffect(() => {
    filterAPIs()
  }, [searchTerm, selectedCategories, apis, searchType])

  const loadAPIs = async () => {
    try {
      const { data, error } = await supabase
        .from('apis')
        .select('*')
        .order('name')

      if (error) throw error

      setApis(data || [])
      
      const allCategories = data?.map(api => getCategoryFromTags(api.tags)) || []
      const uniqueCategories = Array.from(new Set(allCategories)).filter(Boolean)
      
      // Combinar categorias existentes com as populares
      const allUniqueCategories = Array.from(new Set([...uniqueCategories, ...POPULAR_CATEGORIES]))
      setCategories(['all', ...allUniqueCategories])
    } catch (error) {
      console.error('Erro ao carregar APIs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAPIs = () => {
    let filtered = apis

    if (searchTerm) {
      filtered = filtered.filter(api => {
        const searchLower = searchTerm.toLowerCase()
        
        switch (searchType) {
          case 'name':
            return api.name.toLowerCase().includes(searchLower)
          case 'description':
            return api.description.toLowerCase().includes(searchLower)
          case 'tags':
            return api.tags.toLowerCase().includes(searchLower)
          case 'all':
          default:
            return (
              api.name.toLowerCase().includes(searchLower) ||
              api.description.toLowerCase().includes(searchLower) ||
              api.tags.toLowerCase().includes(searchLower)
            )
        }
      })
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
    setSearchType('all')
  }

  const hasActiveFilters = searchTerm !== '' || selectedCategories.length > 0

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
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
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
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

        {/* Barra de Pesquisa Dinâmica */}
        <DynamicSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchType={searchType}
          setSearchType={setSearchType}
          selectedCategories={selectedCategories}
          onRemoveCategory={removeCategory}
          onClearAll={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Category Grid */}
        <CategoryGrid
          categories={categories.filter(cat => cat !== 'all')}
          selectedCategories={selectedCategories}
          onCategorySelect={toggleCategory}
        />

        {/* Results Info */}
        <ResultsInfo 
          count={filteredApis.length}
          searchTerm={searchTerm}
          selectedCategories={selectedCategories}
          onClearAll={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* API Grid */}
        <APIGrid 
          apis={filteredApis} 
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          user={user}
        />

        {/* Empty State */}
        {filteredApis.length === 0 && <EmptyState onClearFilters={clearAllFilters} />}
      </div>
    </div>
  )
}

// Novo Componente: Barra de Pesquisa Dinâmica
interface DynamicSearchProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  searchType: 'all' | 'name' | 'description' | 'tags'
  setSearchType: (type: 'all' | 'name' | 'description' | 'tags') => void
  selectedCategories: string[]
  onRemoveCategory: (category: string) => void
  onClearAll: () => void
  hasActiveFilters: boolean
}

function DynamicSearch({
  searchTerm,
  setSearchTerm,
  searchType,
  setSearchType,
  selectedCategories,
  onRemoveCategory,
  onClearAll,
  hasActiveFilters
}: DynamicSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card mb-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg"
    >
      <div className="flex flex-col gap-4">
        {/* Linha Principal */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Campo de Pesquisa */}
          <div className="input-icon-container flex-1 w-full relative">
            <Search className="input-icon text-gray-400" />
            <input
              type="text"
              placeholder="Buscar APIs... (nome, descrição, tags)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsExpanded(true)}
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

          {/* Botão Expandir Filtros */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filtros</span>
            {hasActiveFilters && (
              <span className="bg-white text-blue-600 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                {selectedCategories.length + (searchTerm ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filtros Expandidos */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Tipo de Busca */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { value: 'all', label: '🔍 Tudo', icon: Search },
                  { value: 'name', label: '📛 Nome', icon: Users },
                  { value: 'description', label: '📝 Descrição', icon: Book },
                  { value: 'tags', label: '🏷️ Tags', icon: Tag }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSearchType(value as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      searchType === value
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Filtros Ativos */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      <span>Busca: "{searchTerm}"</span>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="hover:text-blue-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {selectedCategories.map(category => (
                    <div key={category} className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                      <span>{category}</span>
                      <button
                        onClick={() => onRemoveCategory(category)}
                        className="hover:text-purple-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={onClearAll}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Limpar Tudo
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Componente: Grade de Categorias
interface CategoryGridProps {
  categories: string[]
  selectedCategories: string[]
  onCategorySelect: (category: string) => void
}

function CategoryGrid({ categories, selectedCategories, onCategorySelect }: CategoryGridProps) {
  const isSelected = (category: string) => selectedCategories.includes(category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Categorias Populares</h2>
        <button
          onClick={() => onCategorySelect('all')}
          className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
            selectedCategories.includes('all') 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {selectedCategories.length === 0 ? 'Ver Todas' : 'Limpar Filtros'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {categories.map((category) => {
          const IconComponent = CATEGORY_ICONS[category] || Database
          const selected = isSelected(category)
          
          return (
            <motion.button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden ${
                selected
                  ? `border-transparent bg-gradient-to-r ${CATEGORY_COLORS[category] || 'from-blue-500 to-purple-500'} text-white shadow-lg scale-105`
                  : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:shadow-md'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity ${
                CATEGORY_COLORS[category] || 'from-blue-500 to-purple-500'
              }`} />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg mb-2 ${
                  selected 
                    ? 'bg-white/20' 
                    : `bg-gradient-to-r ${CATEGORY_COLORS[category] || 'from-blue-500 to-purple-500'}`
                }`}>
                  <IconComponent className={`w-5 h-5 ${selected ? 'text-white' : 'text-white'}`} />
                </div>
                <span className={`text-xs font-medium text-center leading-tight ${
                  selected ? 'text-white' : 'text-gray-700'
                }`}>
                  {category}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// Componente de Loading (mantido similar)
function LoadingSkeleton() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container-custom py-8">
        <div className="animate-pulse space-y-8">
          {/* Header Skeleton */}
          <div className="text-center space-y-4">
            <div className="h-6 bg-gray-200 rounded-full w-48 mx-auto"></div>
            <div className="h-12 bg-gray-200 rounded-2xl w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          
          {/* Search Skeleton */}
          <div className="card">
            <div className="h-16 bg-gray-200 rounded-xl"></div>
          </div>

          {/* Categories Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="p-3 rounded-xl border-2 border-gray-200 bg-white">
                <div className="w-10 h-10 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>

          {/* Grid Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card space-y-4">
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-6"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ResultsInfo atualizado
interface ResultsInfoProps {
  count: number
  searchTerm: string
  selectedCategories: string[]
  onClearAll: () => void
  hasActiveFilters: boolean
}

function ResultsInfo({ count, searchTerm, selectedCategories, onClearAll, hasActiveFilters }: ResultsInfoProps) {
  if (!hasActiveFilters) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-4 bg-white/50 rounded-xl border border-gray-200/50"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-600 font-medium">
          {count} {count === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </span>
        
        <div className="flex items-center gap-2 flex-wrap">
          {searchTerm && (
            <span className="badge badge-blue flex items-center gap-2 text-xs px-3 py-1.5">
              🔍 "{searchTerm}"
              <button 
                onClick={() => {/* Implementar limpar busca específica */}} 
                className="hover:text-blue-800 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {selectedCategories.map(category => (
            <span key={category} className="badge badge-purple flex items-center gap-2 text-xs px-3 py-1.5">
              {category}
              <button 
                onClick={() => {/* Implementar limpar categoria específica */}} 
                className="hover:text-purple-800 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={onClearAll}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors hover:bg-blue-50 px-3 py-1.5 rounded-lg self-start sm:self-auto"
      >
        Limpar todos os filtros
      </button>
    </motion.div>
  )
}

// APIGrid e APICard (mantidos similares, mas vou incluir para completar)
interface APIGridProps {
  apis: API[]
  favorites: string[]
  toggleFavorite: (apiId: string) => void
  user: User | null
}

function APIGrid({ apis, favorites, toggleFavorite, user }: APIGridProps) {
  if (apis.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12"
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

        <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
          {api.name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {api.description}
        </p>

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
            <span className="text-orange-700 text-xs font-medium">{api.authentication_type}</span>
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
        className="btn-primary bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
      >
        Limpar Filtros
      </button>
    </motion.div>
  )
}

// Componente Tag para completar
function Tag(props: any) {
  return <span {...props}>🏷️</span>
}
