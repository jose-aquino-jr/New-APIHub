'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Clock, User, Loader2 } from 'lucide-react'
import React from 'react'

const BACKEND_URL = 'https://apihub-br.duckdns.org'

// Interface original mantida
interface Course {
  id: string | number
  slug: string
  title: string
  description: string
  level: 'Iniciante' | 'Intermediário' | 'Avançado'
  is_free: boolean
  full_price: number
  totalDurationMinutes: number
  modules_count: number // Simplificado para contagem vinda do banco
  instructor: string
}

const getLevelColor = (level: string) => {
    switch (level) {
      case 'Iniciante': return 'bg-blue-100 text-blue-600';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-600';
      case 'Avançado': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
}

function CourseCard({ course }: { course: Course }) {
  const courseDetailUrl = `/academy/courses/${course.slug}`;

  return (
    <Link 
      href={courseDetailUrl} 
      className="block bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
          <span className={`font-semibold text-sm ${course.is_free ? 'text-green-600' : 'text-gray-900'}`}>
            {course.is_free ? 'GRATUITO' : `R$ ${course.full_price.toFixed(2)}`}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-700">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-purple-500" />{course.modules_count} Módulos
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-purple-500" />~{course.totalDurationMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <User className="w-4 h-4 text-purple-500" />{course.instructor}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CourseListPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true)
        const res = await fetch(`${BACKEND_URL}/cursos`)
        const data = await res.json()
        
        // Mapeia os dados do banco para a sua interface original
        const formattedCourses = (Array.isArray(data) ? data : []).map((c: any) => ({
          id: c.id,
          slug: c.slug,
          title: c.nome, // campo 'nome' do banco vira 'title'
          description: c.descricao,
          level: c.nivel || 'Iniciante',
          is_free: true, 
          full_price: 0,
          totalDurationMinutes: c.duracao_minutos || 0,
          modules_count: c.total_aulas || 0,
          instructor: c.instrutor || 'José Robério'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} /> 
          ))}
        </div>

        {courses.length === 0 && (
          <p className="text-center text-gray-600 mt-10">Nenhum curso disponível no momento.</p>
        )}
      </div>
    </div>
  )
}