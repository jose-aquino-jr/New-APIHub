'use client'

import { motion } from 'framer-motion'
import {
  Database,
  Cloud,
  GraduationCap,
  Book,
  ShoppingCart,
  Smile,
  Image,
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

// Mapeamento de ícones para categorias
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

interface CategoryGridProps {
  categories: string[]
  selectedCategories: string[]
  onCategorySelect: (category: string) => void
}

export function CategoryGrid({ categories, selectedCategories, onCategorySelect }: CategoryGridProps) {
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