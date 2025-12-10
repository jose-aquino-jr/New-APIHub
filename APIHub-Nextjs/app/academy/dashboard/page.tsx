'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Award,
  TrendingUp,
  PlayCircle,
  ChevronRight,
  Download,
  Share2,
  BarChart
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface Course {
  id: string
  title: string
  description: string
  category: string
  progress: number
  status: 'in_progress' | 'completed' | 'not_started'
  lastAccessed: string
  totalLessons: number
  completedLessons: number
  estimatedHours: number
  timeSpent: number
  certificateUrl?: string
  startedAt: string
  completedAt?: string
}

export default function DashboardPage() {
  const { user } = useAuth()

  const courses: Course[] = [
    {
      id: '1',
      title: 'Introdução às APIs REST',
      description: 'Aprenda os fundamentos das APIs RESTful e como consumi-las',
      category: 'Fundamentos',
      progress: 65,
      status: 'in_progress',
      lastAccessed: 'Hoje, 10:30',
      totalLessons: 12,
      completedLessons: 8,
      estimatedHours: 4,
      timeSpent: 2.5,
      startedAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Autenticação JWT e OAuth 2.0',
      description: 'Métodos avançados de autenticação e autorização',
      category: 'Segurança',
      progress: 100,
      status: 'completed',
      lastAccessed: 'Ontem, 14:20',
      totalLessons: 15,
      completedLessons: 15,
      estimatedHours: 6,
      timeSpent: 5.8,
      certificateUrl: '/certificates/cert-123.pdf',
      startedAt: '2024-01-10',
      completedAt: '2024-01-20'
    },
    {
      id: '3',
      title: 'Consumindo APIs com JavaScript',
      description: 'Use fetch, axios e async/await para integrar APIs',
      category: 'Frontend',
      progress: 30,
      status: 'in_progress',
      lastAccessed: '2 dias atrás',
      totalLessons: 10,
      completedLessons: 3,
      estimatedHours: 3,
      timeSpent: 1.2,
      startedAt: '2024-01-18'
    },
    {
      id: '4',
      title: 'Desenvolvendo APIs com Node.js',
      description: 'Crie suas próprias APIs RESTful do zero',
      category: 'Backend',
      progress: 0,
      status: 'not_started',
      lastAccessed: 'Nunca',
      totalLessons: 20,
      completedLessons: 0,
      estimatedHours: 10,
      timeSpent: 0,
      startedAt: '2024-01-22'
    }
  ]

  const stats = {
    totalCourses: courses.length,
    completedCourses: courses.filter(c => c.status === 'completed').length,
    inProgressCourses: courses.filter(c => c.status === 'in_progress').length,
    totalHours: courses.reduce((sum, c) => sum + c.timeSpent, 0),
    averageProgress: Math.round(courses.filter(c => c.status !== 'not_started').reduce((sum, c) => sum + c.progress, 0) / 
      Math.max(courses.filter(c => c.status !== 'not_started').length, 1))
  }

  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: Course['status']) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'in_progress': return 'Em andamento'
      default: return 'Não iniciado'
    }
  }

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}min`
    return `${hours.toFixed(1)}h`
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Meu Progresso</h2>
        <p className="text-gray-600">
          Acompanhe seus cursos, conquistas e certificados
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{stats.totalCourses}</div>
          <div className="text-sm text-gray-600">Cursos</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-xs font-medium text-green-600">Concluídos</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{stats.completedCourses}</div>
          <div className="text-sm text-gray-600">Cursos finalizados</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-6 h-6 text-orange-600" />
            <span className="text-xs font-medium text-orange-600">Tempo</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{formatTime(stats.totalHours)}</div>
          <div className="text-sm text-gray-600">Total estudado</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <span className="text-xs font-medium text-purple-600">Progresso</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{stats.averageProgress}%</div>
          <div className="text-sm text-gray-600">Média geral</div>
        </div>
      </div>

      {/* Gráfico de Progresso Geral */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Progresso dos Cursos</h3>
          <Link 
            href="/academy/courses" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            Ver todos os cursos
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="space-y-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{course.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(course.status)}`}>
                      {getStatusText(course.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.completedLessons}/{course.totalLessons} aulas
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(course.timeSpent)} / {formatTime(course.estimatedHours)}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart className="w-4 h-4" />
                      Último acesso: {course.lastAccessed}
                    </span>
                  </div>
                </div>
                
                <div className="md:w-48">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progresso</span>
                    <span className="font-semibold">{course.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div 
                      className={`h-full rounded-full ${
                        course.status === 'completed' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600'
                      }`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    {course.status === 'completed' ? (
                      <>
                        <Link
                          href={course.certificateUrl || '#'}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-xl text-center text-sm font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Certificado
                        </Link>
                        <button className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50">
                          <Share2 className="w-4 h-4 text-gray-600" />
                        </button>
                      </>
                    ) : course.status === 'in_progress' ? (
                      <Link
                        href={`/academy/courses/${course.id}`}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl text-center text-sm font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Continuar
                      </Link>
                    ) : (
                      <Link
                        href={`/academy/courses/${course.id}`}
                        className="flex-1 bg-gradient-to-r from-gray-700 to-gray-900 text-white py-2 rounded-xl text-center text-sm font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Começar
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              
              {course.status === 'completed' && course.completedAt && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      Iniciado em: <span className="font-medium">{new Date(course.startedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="text-green-600 font-medium flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Concluído em: {new Date(course.completedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Seção de Certificados */}
      {courses.filter(c => c.status === 'completed').length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Seus Certificados</h3>
              <p className="text-gray-600 text-sm">
                Baixe e compartilhe suas conquistas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium px-4 py-2 rounded-full">
                {courses.filter(c => c.status === 'completed').length} certificado(s)
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses
              .filter(c => c.status === 'completed')
              .map((course) => (
                <div key={course.id} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{course.title}</h4>
                      <p className="text-gray-600 text-sm">Emitido em: {course.completedAt ? new Date(course.completedAt).toLocaleDateString('pt-BR') : '-'}</p>
                    </div>
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      Válido
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={course.certificateUrl || '#'}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl text-center text-sm font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Baixar PDF
                    </Link>
                    <button className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recomendações */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Continue Aprendendo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses
            .filter(c => c.status === 'not_started')
            .slice(0, 3)
            .map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500">{course.category}</span>
                  <span className="text-sm font-medium text-gray-400">Não iniciado</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">{course.title}</h4>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.totalLessons} aulas
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(course.estimatedHours)}
                  </span>
                </div>
                <Link
                  href={`/academy/courses/${course.id}`}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl text-center text-sm font-medium hover:shadow-lg transition-shadow block"
                >
                  Começar Agora
                </Link>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}