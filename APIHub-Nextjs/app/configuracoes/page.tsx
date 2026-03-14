'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, User, Loader2, Check, Save } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { toast, Toaster } from 'sonner'

// Lista de tecnologias para seleção
const BACKEND_TECHS = [
  'Node.js', 'Python', 'Go', 'Java', 'C#', 
  'PHP', 'Ruby', 'Rust', 'TypeScript', 'C++'
]

export default function Configuracoes() {
  const { user, refreshUserData } = useAuth() // FIX 1: importar refreshUserData
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setBio(user.bio || '')
      setPreviewUrl(user.avatar_url || null)
      if (Array.isArray(user.preferredLanguages)) {
        setPreferredLanguages(user.preferredLanguages)
      } else if (typeof user.preferredLanguages === 'string') {
        setPreferredLanguages(user.preferredLanguages.split(',').filter(Boolean))
      }
    }
  }, [user])

  const toggleTech = (tech: string) => {
    setPreferredLanguages(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    const token = localStorage.getItem('authToken')

    if (!token || !user?.id) {
      toast.error("Sessão inválida", { description: "Por favor, faça login novamente." })
      setIsSaving(false)
      return
    }

    try {
      const payload = {
        name: name,
        bio: bio,
        preferredLanguages: preferredLanguages,
      }

      const res = await fetch(`https://apihub-br.duckdns.org/users/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success("Perfil atualizado!", {
          description: "As alterações foram persistidas no banco de dados."
        })
        await refreshUserData() // FIX 1: sincroniza o contexto com os dados novos
      } else {
        // FIX 2: tenta parsear o erro, mas não deixa uma falha de parse
        // esconder a mensagem real — usa o status HTTP como fallback
        let errorMessage = `Erro ${res.status}`
        try {
          const errorData = await res.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // corpo da resposta não era JSON, mantém o fallback de status
        }
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      toast.error("Falha na sincronização", { description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  )

  return (
    <div className="min-h-screen pt-28 pb-12 bg-gray-50 text-black px-4">
      <Toaster richColors position="top-right" />
      <div className="max-w-5xl mx-auto">
        
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Configurações</h1>
          <p className="text-gray-500 mt-1">Gerencie seu perfil público no APIHub.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card Lateral - Perfil */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center sticky top-28">
              <div className="relative inline-block group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-xl mx-auto">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 p-2.5 rounded-full text-white shadow-lg hover:scale-110 transition-all">
                  <Camera size={18} />
                </button>
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-xl text-gray-900 truncate">{name || user.name}</h3>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User size={20} className="text-blue-600" /> Informações de Usuário
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Bio (Biografia)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-4 h-28 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Fale sobre sua experiência com APIs..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 ml-1">Linguagens Preferidas</label>
                  <div className="flex flex-wrap gap-2 p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                    {BACKEND_TECHS.map((tech) => {
                      const isSelected = preferredLanguages.includes(tech)
                      return (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleTech(tech)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                              : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                          {tech}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full md:w-auto bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {isSaving ? "Guardando..." : "Salvar Alterações"}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}