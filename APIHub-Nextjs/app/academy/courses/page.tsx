'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, Clock, LayoutGrid } from 'lucide-react'
import React from 'react'
import Link from 'next/link'

const BACKEND_URL = 'https://apihub-br.duckdns.org'

interface Course {
  id: string | number
  slug: string
  title: string
  description: string
  level: 'iniciante' | 'intermediario' | 'avancado'
  is_free: boolean
  totalDurationMinutes: number
  image: string
  published: boolean
}

const levelConfig: Record<string, { color: string, bg: string }> = {
  'iniciante': { color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'intermediario': { color: 'text-amber-600', bg: 'bg-amber-50' },
  'avancado': { color: 'text-rose-600', bg: 'bg-rose-50' }
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
        
        if (response.success && Array.isArray(response.data)) {
          const formattedCourses = response.data.map((c: any) => ({
            id: c.id,
            slug: c.slug,
            title: c.titulo, 
            description: c.descricao,
            // Normalização do nível para bater com o Record de cores
            level: (c.nivel?.toLowerCase().trim() || 'iniciante') as Course['level'],
            is_free: c.is_free !== false, // Assume true se for null/undefined
            totalDurationMinutes: Number(c.duracao_estimada) || 0,
            image: c.thumbnail_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&h=200&auto=format&fit=crop`,
            published: c.published
          }))

          // Filtra apenas os publicados
          setCourses(formattedCourses.filter((c: Course) => c.published !== false))
        }
      } catch (error) {
        console.error("Erro ao carregar cursos:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  // Otimização: Só refaz o filtro se 'search' ou 'courses' mudar
  const filteredCourses = useMemo(() => {
    return courses.filter(course =>
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, courses])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
       <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 mb-4"></div>
       <p className="text-gray-400 font-medium animate-pulse">Carregando catálogo...</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 bg-[#F8FAFC] pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest mb-2">
              <LayoutGrid size={16} />
              <span>Academy</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Cursos Disponíveis</h1>
            <p className="text-gray-500 mt-2 text-lg">Evolua suas habilidades com trilhas focadas em APIs.</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar curso..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredCourses.map((course, index) => {
              const config = levelConfig[course.level] || levelConfig.iniciante;
              
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                >
                  <div className="h-48 relative">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                    
                    {course.is_free && (
                      <span className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                        Gratuito
                      </span>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${config.bg} ${config.color}`}>
                        {course.level}
                      </span>
                      <div className="flex items-center gap-2 text-white/90 text-xs font-bold bg-black/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                        <Clock size={12} />
                        {course.totalDurationMinutes} min
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                    
                    <Link href={`/academy/courses/${course.slug}`} className="block">
                      <button className="w-full py-4 bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-900 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98]">
                        Acessar Conteúdo
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100"
          >
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Nenhum curso encontrado</h3>
            <p className="text-gray-400 mt-1">Tente pesquisar por outros termos.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}