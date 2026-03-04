'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  BookOpen, Clock, CheckCircle, Trophy, TrendingUp,
  PlayCircle, Loader2
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

const BACKEND_URL = 'https://apihub-br.duckdns.org'

// Interfaces alinhadas com a Doc e a UI
interface CourseUI {
  id: string
  slug: string // Adicionado para navegação correta
  title: string
  description: string
  category: string
  progress: number
  status: 'in_progress' | 'completed' | 'not_started'
  totalLessons: number
  completedLessons: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<CourseUI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      // Sincronização de nome de chave de token
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // 1. Busca cursos (Doc 6.1)
        const resCursos = await fetch(`${BACKEND_URL}/cursos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const cursosData = await resCursos.json()
        const listaCursos = cursosData.success ? cursosData.data : []

        // 2. Busca Progresso em paralelo (Doc 7.1)
        const merged: CourseUI[] = await Promise.all(listaCursos.map(async (curso: any) => {
          try {
            const resProg = await fetch(`${BACKEND_URL}/curso-progresso/${curso.id}`, { 
  headers: { 'Authorization': `Bearer ${token}` }
            })
            const progData = await resProg.json()
            const progInfo = progData.success ? progData.data : { porcentagem: 0, detalhes: [] }
            
            const percent = Math.round(Number(progInfo.porcentagem || 0))

            return {
              id: curso.id,
              slug: curso.slug || '', // Garantindo o slug para a URL
              title: curso.titulo || curso.nome,
              description: curso.descricao,
              category: curso.categoria || 'Geral',
              progress: percent,
              status: percent === 100 ? 'completed' : (percent > 0 ? 'in_progress' : 'not_started'),
              totalLessons: curso.total_aulas || 0,
              completedLessons: progInfo.detalhes?.length || 0
            }
          } catch {
            // Fallback se falhar um curso específico
            return {
              id: curso.id,
              slug: curso.slug || '',
              title: curso.titulo,
              description: curso.descricao,
              category: 'Geral',
              progress: 0,
              status: 'not_started' as const,
              totalLessons: 0,
              completedLessons: 0
            }
          }
        }))

        setCourses(merged)
      } catch (error) {
        console.error("Erro no Dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const stats = {
    total: courses.length,
    concluidos: courses.filter(c => c.status === 'completed').length,
    emAndamento: courses.filter(c => c.status === 'in_progress').length,
    media: courses.length > 0 ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length) : 0
  }

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-blue-600 mb-6" size={48} />
      <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Sincronizando sua conta</h2>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
      {/* Saudação com Identidade Visual */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
            Meu <span className="text-blue-600">Painel</span>
          </h1>
          <p className="text-gray-500 mt-4 font-medium text-lg">
            Que bom ver você de novo, <span className="text-gray-900 font-bold">{user?.name.split(' ')[0]}</span>.
          </p>
        </div>
        <div className="hidden md:block bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Seu Score Geral</p>
          <p className="text-2xl font-black text-blue-700">{stats.media}%</p>
        </div>
      </header>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={<BookOpen size={20}/>} label="Cursos" value={stats.total} variant="blue" />
        <StatCard icon={<CheckCircle size={20}/>} label="Concluídos" value={stats.concluidos} variant="green" />
        <StatCard icon={<TrendingUp size={20}/>} label="Ativos" value={stats.emAndamento} variant="orange" />
        <StatCard icon={<Trophy size={20}/>} label="Nível" value="Pro" variant="purple" />
      </div>

      {/* Lista de Cursos com Design Card-based */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Cursos na sua trilha</h3>
          <Link href="/academy" className="text-xs font-bold text-blue-600 hover:underline">Explorar mais</Link>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {courses.length === 0 ? (
            <div className="bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 p-20 text-center">
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-4">Nenhum curso iniciado</p>
              <Link href="/academy" className="bg-gray-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest">
                Começar agora
              </Link>
            </div>
          ) : (
            courses.map(course => (
              <div key={course.id} className="bg-white p-2 rounded-[2rem] border border-gray-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group">
                <div className="p-6 flex flex-col lg:flex-row gap-8 lg:items-center">
                  <div className="flex-1 space-y-3">
                    <span className="inline-block px-3 py-1 bg-gray-50 text-[9px] font-black text-gray-500 uppercase tracking-widest rounded-lg">
                      {course.category}
                    </span>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-gray-400 text-sm font-medium line-clamp-1 italic">
                      {course.description}
                    </p>
                  </div>

                  <div className="w-full lg:w-72 space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                        <p className="text-xs font-bold text-gray-900">{course.progress === 100 ? 'Concluído' : 'Em andamento'}</p>
                      </div>
                      <span className="text-2xl font-black text-blue-600 tracking-tighter">{course.progress}%</span>
                    </div>
                    
                    <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${course.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                      />
                    </div>

                    <Link 
                      href={`/academy/courses/${course.slug}`}
                      className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        course.progress === 100 
                        ? 'bg-gray-50 text-gray-900 hover:bg-gray-100' 
                        : 'bg-gray-900 text-white hover:bg-blue-600 shadow-lg shadow-gray-200'
                      }`}
                    >
                      {course.progress === 100 ? 'Revisar Conteúdo' : 'Continuar Aprendendo'} <PlayCircle size={14}/>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon, label, value, variant }: any) {
  const styles = {
    blue: "bg-blue-50/50 text-blue-600 border-blue-100",
    green: "bg-emerald-50/50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50/50 text-orange-600 border-orange-100",
    purple: "bg-purple-50/50 text-purple-600 border-purple-100"
  }

  return (
    <div className={`p-6 rounded-[2rem] border transition-all hover:scale-[1.02] ${styles[variant as keyof typeof styles]}`}>
      <div className="flex flex-col gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-current">
          {icon}
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{label}</p>
          <p className="text-3xl font-black tracking-tighter">{value}</p>
        </div>
      </div>
    </div>
  )
}