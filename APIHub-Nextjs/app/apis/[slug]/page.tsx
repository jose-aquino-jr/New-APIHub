'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, Shield, Globe, Zap, Copy, Check, FileText, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCategoryFromTags, parseParameters, getApiBySlug, generateSlug } from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'
import type { API } from '@/types'

interface PageProps {
  params: {
    slug: string
  }
}

export default function APIDetail({ params }: PageProps) {
  const [api, setApi] = useState<API | null>(null)
  const [relatedApis, setRelatedApis] = useState<API[]>([])
  const [copied, setCopied] = useState(false)
  const { user, favorites, toggleFavorite } = useAuth()

  useEffect(() => {
    loadAPI()
  }, [params.slug])

  const loadAPI = async () => {
    try {
      console.log('🔍 Buscando API com slug:', params.slug)
      
      const foundApi = await getApiBySlug(params.slug)
      console.log('📦 API encontrada:', foundApi)

      if (!foundApi) {
        console.log('❌ API não encontrada para slug:', params.slug)
        notFound()
      }

      setApi(foundApi)

      // Carregar APIs relacionadas
      if (foundApi) {
        const category = getCategoryFromTags(foundApi.tags)
        const { data: related } = await supabase
          .from('apis')
          .select('*')
          .neq('id', foundApi.id)
          .like('tags', `%${category}%`)
          .limit(4)

        setRelatedApis(related || [])
      }
    } catch (error) {
      console.error('Erro ao carregar API:', error)
      notFound()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!api) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4 sm:px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando API...</p>
        </div>
      </div>
    )
  }

  const fullUrl = `${api.base_url}${api.endpoint_path || ''}`
  const parameters = parseParameters(api.parameters)

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container-custom py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        {/* Header da API */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6 lg:mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                <span className={`badge ${getCategoryColor(getCategoryFromTags(api.tags))}`}>
                  {getCategoryFromTags(api.tags)}
                </span>
                <span className="text-orange-600 font-semibold text-sm sm:text-base">GRATUITA</span>
                
                {user && (
                  <button 
                    onClick={() => toggleFavorite(api.id)}
                    className={`p-1 sm:p-2 rounded-lg transition-all ${
                      favorites.includes(api.id)
                        ? 'bg-orange-50 text-orange-500' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${favorites.includes(api.id) ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                {api.name}
              </h1>
              
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                {api.description}
              </p>

              <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
                {api.https && (
                  <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-600">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    HTTPS
                  </span>
                )}
                {api.cors && (
                  <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-blue-600">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                    CORS
                  </span>
                )}
                <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-orange-600">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                  {api.authentication_type}
                </span>
              </div>
              
              {api.pdf_url && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 sm:mt-4"
                >
                  <a
                    href={api.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto text-sm sm:text-base"
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Documentação Completa</span>
                    </div>
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  </a>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 text-center sm:text-left">
                    📄 Guia detalhado de implementação e exemplos
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* URL Base */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">URL Base</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <code className="flex-1 bg-gray-900 text-gray-100 p-2 sm:p-3 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto min-h-[44px] flex items-center">
                  {api.base_url}
                </code>
                <button
                  onClick={() => copyToClipboard(api.base_url)}
                  className="p-2 sm:p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors min-w-[44px] flex items-center justify-center"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Endpoint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Endpoint</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                  <span className="px-2 sm:px-3 py-1 sm:py-1 bg-blue-100 text-blue-600 rounded text-xs sm:text-sm font-medium w-fit sm:w-auto">
                    {api.method}
                  </span>
                  <code className="flex-1 bg-gray-100 p-2 sm:p-3 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto min-h-[44px] flex items-center">
                    {fullUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(fullUrl)}
                    className="p-2 sm:p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors min-w-[44px] flex items-center justify-center"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Parâmetros */}
            {Object.keys(parameters).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
              >
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Parâmetros</h2>
                <div className="space-y-1 sm:space-y-2">
                  {Object.entries(parameters).map(([key, value]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-200 gap-1 sm:gap-2">
                      <code className="text-xs sm:text-sm font-medium text-blue-600 break-all">{key}</code>
                      <span className="text-xs sm:text-sm text-gray-600 break-all">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Exemplo de Uso */}
            {api.usage_example && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
              >
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Exemplo de Uso</h2>
                <pre className="bg-gray-900 text-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm leading-relaxed">
                  {api.usage_example}
                </pre>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Card de Acesso Rápido ao PDF */}
            {api.pdf_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Documentação</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Baixe o guia completo com exemplos práticos e instruções detalhadas.
                </p>
                <a
                  href={api.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  Abrir PDF
                </a>
              </motion.div>
            )}

            {/* APIs Relacionadas */}
            {relatedApis.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card"
              >
                <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">APIs Relacionadas</h3>
                <div className="space-y-2 sm:space-y-3">
                  {relatedApis.map((relatedApi) => (
                    <Link
                      key={relatedApi.id}
                      href={`/apis/${generateSlug(relatedApi.name)}`}
                      className="block p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <div className="font-medium text-gray-800 group-hover:text-blue-600 mb-1 text-sm sm:text-base">
                        {relatedApi.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {relatedApi.description}
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Função auxiliar para cores de categoria
function getCategoryColor(category: string) {
  switch (category) {
    case 'Clima': return 'badge-blue'
    case 'Financeiro': return 'badge-green'
    case 'Notícias': return 'badge-purple'
    case 'IA': return 'badge-orange'
    default: return 'badge-blue'
  }
}
