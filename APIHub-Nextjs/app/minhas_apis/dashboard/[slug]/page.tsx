''use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Eye, Star, MessageSquare, TrendingUp, ArrowLeft,
  ShieldCheck, Loader2, Lock, Unlock, AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Toaster, toast } from 'sonner'
import type { API } from '@/types'

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export default function APIDashboard() {
  const params = useParams()
  const router = useRouter()
  const apiId = params.id 

  const [loading, setLoading] = useState(true)
  const [apiData, setApiData] = useState<API | null>(null)

  useEffect(() => {
    async function fetchAPIDetails() {
      try {
        // Busca os dados atualizados para o Dashboard
        const res = await fetch(`https://apihub-br.duckdns.org/api-detalhes/${apiId}`)
        const data = await res.json()
        
        if (data.success) {
          setApiData(data.data)
        } else {
          toast.error("API não encontrada no catálogo.")
          router.push('/minhas_apis')
        }
      } catch (error) {
        console.error("Erro dashboard:", error)
        toast.error("Erro ao conectar com o servidor de métricas.")
      } finally {
        setLoading(false)
      }
    }
    if (apiId) fetchAPIDetails()
  }, [apiId, router])

  // Lógica de cálculo para métricas (Visualizações simuladas baseadas em rating/ranking)
  const stats = [
    { 
      label: 'Alcance Estimado', 
      // Simulação: APIs melhor rankeadas costumam ter mais views
      value: apiData?.ranking_position ? `${(1000 / apiData.ranking_position).toFixed(0)} views` : '---', 
      icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100' 
    },
    { 
      label: 'Avaliação Média', 
      value: apiData?.rating ? apiData.rating.toFixed(1) : '0.0', 
      icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' 
    },
    { 
      label: 'Rank Global', 
      value: apiData?.ranking_position ? `#${apiData.ranking_position}` : 'N/A', 
      icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' 
    },
    { 
      label: 'Total de Avaliações', 
      value: apiData?.total_ranked || '0', 
      icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' 
    },
  ]

  // Mock de reviews enriquecido
  const reviews: Review[] = [
    { id: '1', user: 'DevGabriel', rating: 5, comment: 'API extremamente rápida e fácil de integrar!', date: '2023-10-25' },
    { id: '2', user: 'AnaFrontend', rating: 4, comment: 'Gostei muito, mas senti falta de mais exemplos em Python.', date: '2023-10-24' },
    { id: '3', user: 'StackOverFlow', rating: 5, comment: 'A melhor documentação da categoria.', date: '2023-10-20' },
  ]

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Gerando Relatório de Performance...</p>
    </div>
  )

  return (
    <div className="min-h-screen pt-32 bg-[#F8FAFC] pb-20 font-sans">
      <Toaster richColors position="top-right" />
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header do Dashboard */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => router.push('/minhas_apis')}
              className="group flex items-center gap-2 text-xs font-black text-gray-400 hover:text-blue-600 transition-all uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
              Gerenciador de APIs
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
              Insights: <span className="text-blue-600">{apiData?.name}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-white p-3 px-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <span className="text-xs font-black text-gray-700 uppercase tracking-widest">Ativa no Catálogo</span>
             </div>
          </div>
        </div>

        {/* Grid de Stats com Animação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-6"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Coluna Principal: Feedback */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-blue-600" /> 
                Voz da Comunidade
              </h2>
              <span className="text-xs font-bold text-gray-400">{reviews.length} comentários recentes</span>
            </div>

            <div className="space-y-6">
              {reviews.map((review) => (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={review.id} 
                  className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                        {review.user[0]}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg">{review.user}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-100'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      {new Date(review.date).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-gray-600 font-medium leading-relaxed italic text-lg">
                    "{review.comment}"
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Coluna Sidebar: Saúde Técnica */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 mb-8 uppercase tracking-[0.2em]">Distribuição de Notas</h3>
              <div className="space-y-6">
                {[5, 4, 3, 2, 1].map((nota) => (
                  <div key={nota} className="flex items-center gap-4">
                    <span className="text-xs font-black text-gray-400 w-4">{nota}</span>
                    <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${apiData?.rating && apiData.rating >= nota ? (nota * 20) : (nota === 5 ? 10 : 2)}%` }}
                        className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]" 
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-[10px] text-gray-400 font-medium leading-tight">
                As notas são baseadas em performance, facilidade de uso e suporte da documentação.
              </p>
            </div>

            {/* Card de Segurança */}
            <div className="bg-gray-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <ShieldCheck size={180} />
              </div>
              
              <h3 className="font-black text-2xl mb-8 flex items-center gap-3">
                <ShieldCheck className="text-blue-400 w-7 h-7" /> Segurança
              </h3>
              
              <div className="space-y-5 relative z-10">
                <div className="flex justify-between items-center bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocolo</span>
                  <span className={`text-xs font-black flex items-center gap-2 ${apiData?.https ? 'text-green-400' : 'text-red-400'}`}>
                    {apiData?.https ? <Lock size={14} /> : <Unlock size={14} />}
                    {apiData?.https ? 'HTTPS Ativo' : 'HTTP Inseguro'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">CORS Policy</span>
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg ${apiData?.cors ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {apiData?.cors ? 'GLOBAL ACCESS' : 'RESTRICTED'}
                  </span>
                </div>

                <div className="pt-4">
                   <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <AlertCircle size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Dica de Otimização</span>
                   </div>
                   <p className="text-xs text-gray-400 font-medium leading-relaxed">
                     Considere habilitar o CORS para aumentar a adoção da sua API por desenvolvedores Web (Frontend).
                   </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}