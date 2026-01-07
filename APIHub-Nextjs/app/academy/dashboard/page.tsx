'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  BookOpen, Clock, CheckCircle, Award, TrendingUp,
  PlayCircle, ChevronRight, Download, Share2, BarChart, Loader2
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

const BACKEND_URL = 'https://apihub-br.duckdns.org'

interface DB_Course {
  id: string | number
  nome: string
  descricao: string
  categoria?: string
  total_aulas?: number
  horas_estimadas?: number
}

interface DB_Progress {
  curso_id: string | number
  progresso: number
  tempo_estudado?: number
  aulas_concluidas?: number
  updated_at?: string
  created_at?: string
}

interface Course extends Omit<DB_Course, 'nome' | 'descricao'> {
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
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user?.id) return
      
      try {
        setLoading(true)
        // Busca cursos e progresso em paralelo
        const [resCursos, resProgresso] = await Promise.all([
          fetch(`${BACKEND_URL}/cursos`),
          fetch(`${BACKEND_URL}/curso-progresso/${user.id}`)
        ])

        const dbCursos: DB_Course[] = await resCursos.json()
        const dbProgresso: DB_Progress[] = await resProgresso.json()

        // Garante que são arrays antes de mapear
        const listaCursos = Array.isArray(dbCursos) ? dbCursos : []
        const listaProgresso = Array.isArray(dbProgresso) ? dbProgresso : []

        // Mapeia e funde os dados
        const merged: Course[] = listaCursos.map((c) => {
          const p = listaProgresso.find((item) => String(item.curso_id) === String(c.id))
          const progressValue = Number(p?.progresso || 0)

          return {
            id: String(c.id),
            title: c.nome,
            description: c.descricao,
            category: c.categoria || 'Geral',
            progress: progressValue,
            status: progressValue === 100 ? 'completed' : (progressValue > 0 ? 'in_progress' : 'not_started'),
            lastAccessed: p?.updated_at ? new Date(p.updated_at).toLocaleDateString('pt-BR') : 'Nunca',
            totalLessons: c.total_aulas || 10,
            completedLessons: p?.aulas_concluidas || 0,
            estimatedHours: c.horas_estimadas || 5,
            timeSpent: Number(p?.tempo_estudado || 0),
            certificateUrl: progressValue === 100 ? `${BACKEND_URL}/gerar-pdf/${c.id}` : undefined,
            startedAt: p?.created_at || new Date().toISOString(),
            completedAt: progressValue === 100 ? p?.updated_at : undefined
          }
        })

        setCourses(merged)
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.id])

  // --- Lógica de Estatísticas Dinâmicas ---
  const stats = {
    totalCourses: courses.length,
    completedCourses: courses.filter(c => c.status === 'completed').length,
    inProgressCourses: courses.filter(c => c.status === 'in_progress').length,
    totalHours: courses.reduce((sum, c) => sum + c.timeSpent, 0),
    averageProgress: courses.length > 0 
      ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length) 
      : 0
  }

  // --- Funções Auxiliares ---
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="animate-spin w-10 h-10 mb-4 text-blue-600" />
        <p className="font-medium">Carregando seu progresso...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Olá, {user?.name || 'Estudante'}!</h2>
        <p className="text-gray-600">Acompanhe seus cursos, conquistas e certificados em tempo real.</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard icon={<BookOpen className="text-blue-600"/>} label="Total" value={stats.totalCourses} unit="Cursos" color="from-blue-50 to-purple-50" border="border-blue-100" />
        <StatCard icon={<CheckCircle className="text-green-600"/>} label="Concluídos" value={stats.completedCourses} unit="Finalizados" color="from-green-50 to-emerald-50" border="border-green-100" />
        <StatCard icon={<Clock className="text-orange-600"/>} label="Tempo" value={formatTime(stats.totalHours)} unit="Total estudado" color="from-orange-50 to-amber-50" border="border-orange-100" />
        <StatCard icon={<TrendingUp className="text-purple-600"/>} label="Progresso" value={`${stats.averageProgress}%`} unit="Média geral" color="from-purple-50 to-pink-50" border="border-purple-100" />
      </div>

      {/* Seção de Cursos com Padding Aumentado */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Seus Cursos</h3>
            <p className="text-gray-500">Gerencie sua jornada de aprendizado</p>
          </div>
          <Link href="/academy/courses" className="text-blue-600 hover:underline text-sm font-bold flex items-center gap-1">
            Explorar todos <ChevronRight size={18} />
          </Link>
        </div>
        
        <div className="space-y-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-8 border border-gray-100 rounded-3xl hover:border-blue-200 hover:shadow-xl transition-all bg-gray-50/30"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-10">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${getStatusColor(course.status)}`}>
                      {getStatusText(course.status)}
                    </span>
                    <span className="text-xs text-gray-400 font-medium tracking-widest">{course.category}</span>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h4>
                    <p className="text-gray-600 leading-relaxed text-sm max-w-2xl">{course.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-gray-400 uppercase tracking-tight">
                    <span className="flex items-center gap-2"><BookOpen size={14} className="text-blue-500"/> {course.completedLessons}/{course.totalLessons} Aulas</span>
                    <span className="flex items-center gap-2"><Clock size={14} className="text-orange-500"/> {formatTime(course.timeSpent)} Estudado</span>
                    <span className="flex items-center gap-2"><BarChart size={14} className="text-purple-500"/> Acesso: {course.lastAccessed}</span>
                  </div>
                </div>

                <div className="lg:w-72 space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-500">Progresso</span>
                      <span className="text-blue-600">{course.progress}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        className={`h-full rounded-full ${course.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={course.status === 'completed' ? (course.certificateUrl || '#') : `/academy/courses/${course.id}`}
                      className={`flex-1 py-4 rounded-2xl text-center text-sm font-bold transition-all shadow-md hover:-translate-y-1 flex items-center justify-center gap-2 ${
                        course.status === 'completed' 
                        ? 'bg-gray-900 text-white hover:bg-black' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {course.status === 'completed' ? <Download size={16}/> : <PlayCircle size={16}/>}
                      {course.status === 'completed' ? 'Baixar Certificado' : 'Continuar'}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- Subcomponente de Card de Stats para limpeza de código ---
function StatCard({ icon, label, value, unit, color, border }: any) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-[2rem] p-8 border ${border} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">{label}</span>
      </div>
      <div className="text-3xl font-black text-gray-800 mb-1">{value}</div>
      <div className="text-xs font-medium text-gray-500">{unit}</div>
    </div>
  )
}