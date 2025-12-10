'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, BookOpen, Clock, Star } from 'lucide-react'

const courses = [
  {
    id: 1,
    title: 'Introdução às APIs REST',
    description: 'Aprenda os fundamentos das APIs RESTful e como consumi-las em seus projetos',
    duration: '2 horas',
    level: 'Iniciante',
    lessons: 8,
    rating: 4.8,
    students: 1245,
    isFree: true,
    category: 'Fundamentos',
    image: '/api-course-1.png'
  },
  // Adicione mais cursos...
]

export default function CoursesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  
  const categories = ['all', 'Fundamentos', 'Segurança', 'Frontend', 'Backend', 'DevOps']

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Catálogo de Cursos</h2>
        <p className="text-gray-600">
          Aprenda APIs na prática com cursos especializados
        </p>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cursos..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap ${
                category === cat
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              {course.isFree && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  GRATUITO
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  {course.category}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {course.lessons} aulas
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {course.rating}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">{course.students} estudantes</div>
                  <div className={`text-sm font-semibold ${
                    course.level === 'Iniciante' ? 'text-blue-600' : 
                    course.level === 'Intermediário' ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {course.level}
                  </div>
                </div>
                
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-shadow">
                  {course.isFree ? 'Começar' : 'Comprar'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}