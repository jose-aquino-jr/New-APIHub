'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, Award, Share2, Loader2, CheckCircle2, Copy, Check 
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

const BACKEND_URL = 'https://apihub-br.duckdns.org'

interface Certificate {
  id: string | number
  curso_id: string | number
  nome_curso: string
  progresso: number
  updated_at: string
}

export default function CertificatesPage() {
  const { user } = useAuth()
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false) // Estado para o feedback visual

  useEffect(() => {
    async function fetchCertificates() {
      if (!user?.id) return
      try {
        setLoading(true)
        const res = await fetch(`${BACKEND_URL}/cursos-progresso/${user.id}`)
        const data = await res.json()
        const onlyCompleted = (Array.isArray(data) ? data : []).filter(
          (c: any) => Number(c.progresso) === 100
        )
        setCerts(onlyCompleted)
      } catch (error) {
        console.error("Erro:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCertificates()
  }, [user?.id])

  // Função para copiar o link e mensagem
  const handleShareAll = async () => {
    if (certs.length === 0) return;

    const shareText = `🚀 Acabei de conquistar ${certs.length} certificado(s) na APIHub Academy!\n\n` +
      `Cursos concluídos:\n${certs.map(c => `✅ ${c.nome_curso}`).join('\n')}\n\n` +
      `Confira meu perfil de estudante aqui: ${window.location.href}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000); // Reseta o botão após 3 segundos
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
      <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
      <p>Validando suas conquistas...</p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest">
            <Award size={18} />
            <span>Suas Conquistas</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Galeria de Certificados</h1>
          <p className="text-gray-500 text-lg">Você possui {certs.length} certificados validados.</p>
        </div>
      </header>

      {certs.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] p-20 text-center space-y-4">
          <Award className="text-gray-300 w-10 h-10 mx-auto" />
          <h3 className="text-xl font-bold">Nenhum certificado ainda</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {certs.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500"
            >
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                    <CheckCircle2 size={32} />
                  </div>
                  <span className="text-[10px] font-black bg-green-100 text-green-700 px-4 py-1.5 rounded-full uppercase tracking-tighter">
                    Validado pela APIHub
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">{cert.nome_curso}</h3>
                  <p className="text-gray-400 text-sm font-medium">
                    Concluído em {new Date(cert.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-50 flex flex-wrap gap-4">
                  <a
                    href={`${BACKEND_URL}/gerar-pdf/${cert.curso_id}`}
                    target="_blank"
                    className="flex-1 bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black hover:-translate-y-1 transition-all"
                  >
                    <Download size={18} /> Baixar PDF
                  </a>
                  <button 
                    onClick={() => {
                      const link = `${BACKEND_URL}/gerar-pdf/${cert.curso_id}`;
                      navigator.clipboard.writeText(`Confira meu certificado do curso ${cert.nome_curso}: ${link}`);
                      alert('Link do certificado copiado!');
                    }}
                    className="p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                  >
                    <Share2 size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Rodapé de Compartilhamento com Feedback Visual */}
      <footer className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-xl font-bold">Impulsione seu LinkedIn!</h4>
          <p className="text-blue-100 opacity-90 text-sm">Clique no botão ao lado para copiar sua lista de conquistas e compartilhar.</p>
        </div>
        
        <button 
          onClick={handleShareAll}
          disabled={certs.length === 0}
          className={`${
            copied ? 'bg-green-500 text-white' : 'bg-white text-blue-600'
          } px-8 py-4 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2 min-w-[200px] justify-center`}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span 
                key="check" 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="flex items-center gap-2"
              >
                <Check size={18} /> Copiado!
              </motion.span>
            ) : (
              <motion.span 
                key="copy" 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="flex items-center gap-2"
              >
                <Copy size={18} /> Como Compartilhar
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </footer>
    </div>
  )
}