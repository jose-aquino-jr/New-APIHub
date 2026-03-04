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
  const [copied, setCopied] = useState(false)
  const [individualCopy, setIndividualCopy] = useState<string | number | null>(null)

  useEffect(() => {
    async function fetchCertificates() {
      // Sincronização de Token (Página 36 da Doc)
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      if (!user?.id || !token) return

      try {
        setLoading(true)
        // Buscando progresso consolidado (Ajuste conforme Pág 21 da doc)
        const res = await fetch(`${BACKEND_URL}/curso-progresso`, { // Endpoint Pág 27, item 7.1
  headers: { 'Authorization': `Bearer ${token}` }
})
const data = await res.json()
const list = data.success ? data.data : []
// Filtra pelo campo correto da doc: progresso_percentual
const onlyCompleted = list.filter((c: any) => Number(c.progresso_percentual) === 100)
        // Mapeia para garantir que nomes de campos batam com a UI
        const mappedCerts = onlyCompleted.map((c: any) => ({
            id: c.id,
            curso_id: c.curso_id,
            nome_curso: c.curso_nome || c.nome_curso || 'Curso APIHub',
            updated_at: c.updated_at || new Date().toISOString()
        }))

        setCerts(mappedCerts)
      } catch (error) {
        console.error("Erro ao carregar certificados:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCertificates()
  }, [user?.id])

  const handleShareIndividual = (cert: Certificate) => {
    const link = `${BACKEND_URL}/validar-certificado/${cert.id}`; // URL sugerida para validação externa
    navigator.clipboard.writeText(`Orgulho em compartilhar meu certificado do curso ${cert.nome_curso} na APIHub Academy! 🎓\nLink de validação: ${link}`);
    
    setIndividualCopy(cert.id);
    setTimeout(() => setIndividualCopy(null), 2000);
  };

  const handleShareAll = async () => {
    if (certs.length === 0) return;
    const shareText = `🚀 Acabei de conquistar ${certs.length} certificado(s) na APIHub Academy!\n\n` +
      `Cursos concluídos:\n${certs.map(c => `✅ ${c.nome_curso}`).join('\n')}\n\n` +
      `Confira minha jornada aqui: ${window.location.origin}/academy/perfil/${user?.id}`;

    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="relative">
        <Loader2 className="animate-spin w-16 h-16 text-blue-600 opacity-20" />
        <Award className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={32} />
      </div>
      <p className="mt-6 text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Auditando Conquistas</p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full">
            <Award size={14} className="font-bold" />
            <span className="text-[10px] font-black uppercase tracking-widest">Hall da Fama</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter">
          Seus <span className="text-blue-600">Certificados</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl font-medium">
          Cada certificado abaixo representa horas de dedicação e domínio técnico. Parabéns pela jornada!
        </p>
      </header>

      {certs.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] p-24 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
             <Award className="text-gray-200" size={40} />
          </div>
          <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">Nenhum certificado disponível</h3>
          <p className="text-gray-400 mt-2 text-sm font-medium">Conclua 100% de um curso para desbloquear sua conquista.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {certs.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 relative overflow-hidden"
            >
              {/* Marca d'água decorativa */}
              <Award size={120} className="absolute -right-8 -bottom-8 text-gray-50 opacity-50 group-hover:text-blue-50 group-hover:scale-110 transition-all duration-700" />

              <div className="relative z-10 flex flex-col gap-8">
                <div className="flex justify-between items-center">
                  <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-blue-600 transition-colors">
                    <CheckCircle2 size={32} />
                  </div>
                  <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl uppercase tracking-widest border border-emerald-100">
                    Certificado Oficial
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{cert.nome_curso}</h3>
                  <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                    <span>Emissão: {new Date(cert.updated_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <a
                    href={`${BACKEND_URL}/gerar-pdf/${cert.curso_id}`}
                    target="_blank"
                    className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 shadow-xl shadow-gray-200 transition-all active:scale-95"
                  >
                    <Download size={16} /> Baixar PDF
                  </a>
                  <button 
                    onClick={() => handleShareIndividual(cert)}
                    className="p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all bg-white relative"
                  >
                    <AnimatePresence>
                        {individualCopy === cert.id ? (
                            <motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="text-emerald-500">
                                <Check size={20} />
                            </motion.div>
                        ) : (
                            <Share2 size={20} className="text-gray-400" />
                        )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer de Engajamento */}
      <footer className="bg-gray-900 rounded-[3rem] p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-20" />
        
        <div className="relative z-10 space-y-4 text-center lg:text-left">
          <h4 className="text-3xl font-black tracking-tight">Mostre seu valor ao mundo.</h4>
          <p className="text-gray-400 font-medium max-w-md">Compartilhe sua coleção completa de certificados nas redes sociais com apenas um clique.</p>
        </div>
        
        <button 
          onClick={handleShareAll}
          disabled={certs.length === 0}
          className={`relative z-10 group ${
            copied ? 'bg-emerald-500' : 'bg-white text-gray-900 hover:bg-blue-600 hover:text-white'
          } px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all duration-500 flex items-center gap-3 min-w-[240px] justify-center active:scale-95`}
        >
          {copied ? (
            <span className="flex items-center gap-2">
                <Check size={18} /> Copiado com Sucesso!
            </span>
          ) : (
            <span className="flex items-center gap-2">
                <Copy size={18} className="group-hover:rotate-12 transition-transform" /> Copiar Link do Portfólio
            </span>
          )}
        </button>
      </footer>
    </div>
  )
}