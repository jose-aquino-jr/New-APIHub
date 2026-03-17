'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  BookOpen, CheckCircle, Trophy, TrendingUp,
  PlayCircle, Loader2, Lock, Star
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

const BACKEND_URL = 'https://apihub-br.duckdns.org'

interface CourseUI {
  id: string
  slug: string
  title: string
  description: string
  category: string
  progress: number
  status: 'in_progress' | 'completed' | 'not_started'
  totalLessons: number
  completedLessons: number
  ultimaAulaId: string | null
}

// Extrai o bloco mais recentemente acessado do objeto "detailed"
// que o backend retorna em GET /curso-progresso/{id}
function getUltimaAulaId(detailed: Record<string, any>): string | null {
  let ultimoBloco: { bloco_id: string; updated_at: string } | null = null

  Object.values(detailed).forEach((modulo: any) => {
    modulo.blocos?.forEach((bloco: any) => {
      if (!ultimoBloco || bloco.updated_at > ultimoBloco.updated_at) {
        ultimoBloco = { bloco_id: bloco.bloco_id, updated_at: bloco.updated_at }
      }
    })
  })

  return ultimoBloco ? (ultimoBloco as any).bloco_id : null
}

// Calcula o nível do usuário com base nos cursos concluídos e progresso médio
function calcularNivel(concluidos: number, media: number): {
  label: string
  cor: string
  proximoNivel: string
  progresso: number
} {
  if (concluidos === 0 && media === 0) {
    return { label: 'Iniciante', cor: 'text-gray-600', proximoNivel: 'Aprendiz', progresso: 0 }
  }
  if (concluidos < 2 || media < 25) {
    return { label: 'Aprendiz', cor: 'text-blue-600', proximoNivel: 'Desenvolvedor', progresso: Math.min(media * 2, 100) }
  }
  if (concluidos < 5 || media < 50) {
    return { label: 'Desenvolvedor', cor: 'text-indigo-600', proximoNivel: 'Especialista', progresso: Math.min(media, 100) }
  }
  if (concluidos < 10 || media < 75) {
    return { label: 'Especialista', cor: 'text-purple-600', proximoNivel: 'Expert', progresso: Math.min(media + 10, 100) }
  }
  if (concluidos < 20 || media < 90) {
    return { label: 'Expert', cor: 'text-orange-600', proximoNivel: 'Mestre', progresso: Math.min(media + 15, 100) }
  }
  return { label: 'Mestre', cor: 'text-yellow-600', proximoNivel: '—', progresso: 100 }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<CourseUI[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todos' | 'in_progress' | 'completed' | 'not_started'>('todos')

  useEffect(() => {
    async function fetchDashboardData() {
      const token = localStorage.getItem('authToken')
      if (!token) { setLoading(false); return }

      try {
        setLoading(true)

        // 1. Busca lista de cursos — GET /cursos (seção 6.1)
        const resCursos = await fetch(`${BACKEND_URL}/cursos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const cursosData = await resCursos.json()
        const listaCursos = cursosData.success ? cursosData.data : []

        // 2. Busca progresso de cada curso em paralelo — GET /curso-progresso/{id} (seção 7.2)
        const merged: CourseUI[] = await Promise.all(listaCursos.map(async (curso: any) => {
          try {
            const resProg = await fetch(`${BACKEND_URL}/curso-progresso/${curso.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            const progData = await resProg.json()

            // Estrutura real da resposta:
            // data.general.progresso_percentual — percentual geral
            // data.detailed — objeto com módulos e blocos acessados
            const progInfo = progData.success ? progData.data : null
            const general = progInfo?.general || null
            const detailed = progInfo?.detailed || {}

            const percent = Math.round(Number(general?.progresso_percentual || 0))

            // Conta blocos concluídos somando os blocos de todos os módulos
            const completedLessons = Object.values(detailed).reduce(
              (acc: number, mod: any) => acc + (mod.blocos?.length || 0), 0
            ) as number

            // Pega o bloco com updated_at mais recente para o botão "Continuar"
            const ultimaAulaId = getUltimaAulaId(detailed)

            return {
              id: curso.id,
              slug: curso.slug || '',
              title: curso.titulo || curso.nome,
              description: curso.descricao,
              category: curso.categoria || 'Geral',
              progress: percent,
              status: percent === 100 ? 'completed' : (percent > 0 ? 'in_progress' : 'not_started'),
              totalLessons: curso.total_aulas || 0,
              completedLessons,
              ultimaAulaId
            }
          } catch {
            return {
              id: curso.id,
              slug: curso.slug || '',
              title: curso.titulo,
              description: curso.descricao,
              category: 'Geral',
              progress: 0,
              status: 'not_started' as const,
              totalLessons: 0,
              completedLessons: 0,
              ultimaAulaId: null
            }
          }
        }))

        setCourses(merged)
      } catch (error) {
        console.error('Erro no Dashboard:', error)
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
    naoIniciados: courses.filter(c => c.status === 'not_started').length,
    media: courses.length > 0
      ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)
      : 0
  }

  const nivel = calcularNivel(stats.concluidos, stats.media)

  const cursosFiltrados = filtro === 'todos'
    ? courses
    : courses.filter(c => c.status === filtro)

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-blue-600 mb-6" size={48} />
      <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Sincronizando sua conta</h2>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">

      {/* Cabeçalho com Nível */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
            Meu <span className="text-blue-600">Painel</span>
          </h1>
          <p className="text-gray-500 mt-4 font-medium text-lg">
            Que bom ver você de novo,{' '}
            <span className="text-gray-900 font-bold">{user?.name.split(' ')[0]}</span>.
          </p>
        </div>

        {/* Card de Nível */}
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm min-w-[220px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Star size={18} className="text-yellow-500 fill-yellow-400" />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Seu Nível</p>
              <p className={`text-xl font-black ${nivel.cor}`}>{nivel.label}</p>
            </div>
          </div>
          {nivel.proximoNivel !== '—' && (
            <>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                  Próximo: {nivel.proximoNivel}
                </p>
                <p className="text-[9px] font-black text-gray-500">{nivel.progresso}%</p>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${nivel.progresso}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
              </div>
            </>
          )}
          {nivel.proximoNivel === '—' && (
            <p className="text-[10px] text-yellow-600 font-bold">🏆 Nível máximo atingido!</p>
          )}
        </div>
      </header>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={<BookOpen size={20} />} label="Total de Cursos" value={stats.total} variant="blue" />
        <StatCard icon={<CheckCircle size={20} />} label="Concluídos" value={stats.concluidos} variant="green" />
        <StatCard icon={<TrendingUp size={20} />} label="Em Andamento" value={stats.emAndamento} variant="orange" />
        <StatCard icon={<Trophy size={20} />} label="Progresso Médio" value={`${stats.media}%`} variant="purple" />
      </div>

      {/* Filtros + Lista */}
      <section>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
            Cursos na sua trilha
          </h3>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'todos', label: `Todos (${stats.total})` },
              { key: 'in_progress', label: `Ativos (${stats.emAndamento})` },
              { key: 'completed', label: `Concluídos (${stats.concluidos})` },
              { key: 'not_started', label: `Não iniciados (${stats.naoIniciados})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFiltro(key as typeof filtro)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filtro === key
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {cursosFiltrados.length === 0 ? (
            <div className="bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 p-20 text-center">
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-4">
                Nenhum curso nessa categoria
              </p>
              <Link
                href="/academy"
                className="bg-gray-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest"
              >
                Explorar cursos
              </Link>
            </div>
          ) : (
            cursosFiltrados.map(course => (
              <div
                key={course.id}
                className="bg-white p-2 rounded-[2rem] border border-gray-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group"
              >
                <div className="p-6 flex flex-col lg:flex-row gap-8 lg:items-center">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-block px-3 py-1 bg-gray-50 text-[9px] font-black text-gray-500 uppercase tracking-widest rounded-lg">
                        {course.category}
                      </span>
                      {course.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-[9px] font-black text-emerald-600 uppercase tracking-widest rounded-lg">
                          <CheckCircle size={10} /> Concluído
                        </span>
                      )}
                      {course.status === 'in_progress' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-[9px] font-black text-blue-600 uppercase tracking-widest rounded-lg">
                          <TrendingUp size={10} /> Em andamento
                        </span>
                      )}
                      {course.status === 'not_started' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest rounded-lg">
                          <Lock size={10} /> Não iniciado
                        </span>
                      )}
                    </div>

                    <h4 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-gray-400 text-sm font-medium line-clamp-1 italic">
                      {course.description}
                    </p>
                    {course.totalLessons > 0 && (
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {course.completedLessons} de {course.totalLessons} aulas concluídas
                      </p>
                    )}
                  </div>

                  <div className="w-full lg:w-72 space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progresso</p>
                        <p className="text-xs font-bold text-gray-900">
                          {course.progress === 100 ? 'Concluído' : course.progress > 0 ? 'Em andamento' : 'Não iniciado'}
                        </p>
                      </div>
                      <span className="text-2xl font-black text-blue-600 tracking-tighter">{course.progress}%</span>
                    </div>

                    <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          course.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                      />
                    </div>

                    {/* Botão de ação:
                        - Em andamento com ultimaAulaId → vai direto para a última aula acessada
                        - Concluído ou não iniciado → vai para a página do curso */}
                    <Link
                      href={
                        course.status === 'in_progress' && course.ultimaAulaId
                          ? `/academy/courses/${course.slug}/aula/${course.ultimaAulaId}`
                          : `/academy/courses/${course.slug}`
                      }
                      className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        course.status === 'completed'
                          ? 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                          : course.status === 'in_progress'
                            ? 'bg-gray-900 text-white hover:bg-blue-600 shadow-lg shadow-gray-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                      }`}
                    >
                      {course.status === 'completed' && <>Revisar Conteúdo <PlayCircle size={14} /></>}
                      {course.status === 'in_progress' && <>Continuar Aprendendo <PlayCircle size={14} /></>}
                      {course.status === 'not_started' && <>Começar Agora <PlayCircle size={14} /></>}
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

function StatCard({ icon, label, value, variant }: {
  icon: React.ReactNode
  label: string
  value: string | number
  variant: 'blue' | 'green' | 'orange' | 'purple'
}) {
  const styles = {
    blue: 'bg-blue-50/50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50/50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50/50 text-orange-600 border-orange-100',
    purple: 'bg-purple-50/50 text-purple-600 border-purple-100'
  }

  return (
    <div className={`p-6 rounded-[2rem] border transition-all hover:scale-[1.02] ${styles[variant]}`}>
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