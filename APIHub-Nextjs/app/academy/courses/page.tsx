'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, BookOpen, Clock } from 'lucide-react'
import React from 'react'
import Link from 'next/link'

const BACKEND_URL = 'https://apihub-br.duckdns.org'

interface Course {
  id: string | number
  slug: string
  title: string
  description: string
  level: string
  is_free: boolean
  full_price: number
  totalDurationMinutes: number
  modules_count: number
  instructor: string
  image: string
}

const levelColors: Record<string, string> = {
  'iniciante': 'text-blue-600',
  'intermediario': 'text-yellow-600',
  'avancado': 'text-red-600'
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true)
        const res = await fetch(`${BACKEND_URL}/cursos`)
        const response = await res.json()
        
        // Acessando a propriedade 'data' que contém a lista
        const rawData = response.success && Array.isArray(response.data) ? response.data : []

        const formattedCourses = rawData.map((c: any) => ({
          id: c.id,
          slug: c.slug,
          title: c.titulo, // Ajustado para 'titulo' conforme seu JSON
          description: c.descricao,
          level: c.nivel?.toLowerCase() || 'iniciante',
          is_free: true, 
          full_price: 0,
          totalDurationMinutes: c.duracao_estimada || 0, // Ajustado para 'duracao_estimada'
          modules_count: 0, 
          instructor: 'José Robério',
          image: c.thumbnail_url || `https://via.placeholder.com/400x200`
        }))

        setCourses(formattedCourses)
      } catch (error) {
        console.error("Erro ao carregar cursos:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  // Filtro de busca funcional
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Catálogo de Cursos</h2>
          <p className="text-gray-600">Aprenda APIs na prática com cursos especializados</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cursos..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col"
            >
              <div className="h-40 relative overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                
                {course.is_free && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                    GRATUITO
                  </div>
                )}
                
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm border border-white/20">
                    API
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {course.totalDurationMinutes} min
                  </span>
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Aulas em breve
                  </span>
                </div>
                
                <div className="mt-auto flex items-center justify-between">
                  <div className={`text-sm font-semibold capitalize ${levelColors[course.level] || 'text-gray-600'}`}>
                    {course.level}
                  </div>
                  
                  <Link href={`/academy/courses/${course.slug}`}>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl font-medium hover:shadow-lg transition-all active:scale-95">
                      {course.is_free ? 'Começar' : 'Comprar'}
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Nenhum curso encontrado para "{search}"</p>
          </div>
        )}
      </div>
    </div>
  )
}